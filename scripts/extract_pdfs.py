#!/usr/bin/env python3
"""Download and extract Armenian Road Police ABC exam PDFs (1.pdf - 10.pdf)."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import ssl
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import certifi
import pymupdf

BASE_URL = "https://roadpolice.am/exam/abc/hy/{group_id}.pdf"
GROUP_IDS = list(range(1, 11))

RE_GROUP_TITLE = re.compile(r"^ԽՈՒՄԲ\s+(\d+)$")
RE_TOTAL_COUNT = re.compile(r"^(\d+)\s+հարց$")
RE_HEADER_LINE = re.compile(r"^ABC\s+կարգեր\s*·")
RE_FOOTER_LINE = re.compile(r"^Էջ\s+\d+\s*/\s*\d+$")
RE_NUMBERED_ITEM = re.compile(r"^(\d+)\.\s*(.*)$")
RE_ANSWER = re.compile(r"^Պատ\.?\s*[`՛՝']?\s*(\d+)\s*$")


def _clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _extract_visual_rows(page: pymupdf.Page) -> list[tuple[float, float, str]]:
    """Group text lines on the same horizontal row (within 3pt) and sort left-to-right."""
    raw_lines: list[tuple[float, float, float, str]] = []
    text_dict = page.get_text("dict")
    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            txt = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
            if not txt:
                continue
            x0, y0, _x1, y1 = line["bbox"]
            raw_lines.append((y0, y1, x0, txt))

    raw_lines.sort(key=lambda item: (round(item[0], 1), item[2]))

    rows: list[list[tuple[float, float, float, str]]] = []
    for item in raw_lines:
        if rows and abs(item[0] - rows[-1][0][0]) <= 3.0:
            rows[-1].append(item)
        else:
            rows.append([item])

    result: list[tuple[float, float, str]] = []
    for row in rows:
        row.sort(key=lambda item: item[2])
        y0 = min(item[0] for item in row)
        y1 = max(item[1] for item in row)
        merged = _clean_text(" ".join(item[3] for item in row))
        if merged:
            result.append((y0, y1, merged))
    return result


def _is_chrome_row(text: str, page_index: int) -> bool:
    if RE_HEADER_LINE.match(text):
        return True
    if RE_FOOTER_LINE.match(text):
        return True
    if RE_GROUP_TITLE.match(text):
        return True
    if page_index == 0 and RE_TOTAL_COUNT.match(text):
        return True
    return False


def parse_pdf_document(
    doc: pymupdf.Document,
    group_id: int,
    image_writer: Callable[[bytes, str], str],
) -> tuple[dict, list[dict]]:
    """Parse a single group PDF document into structured questions and orphan images."""
    expected_count: int | None = None
    group_title = f"ԽՈՒՄԲ {group_id}"

    # Build a flat ordered stream of events across pages:
    # ("text", page_idx, y0, y1, text) or ("image", page_idx, y0, y1, xref, img_bytes, ext)
    events: list[tuple] = []
    seen_img_rects_on_page: set[tuple[int, float, float, float, float]] = set()

    for page_idx, page in enumerate(doc):
        rows = _extract_visual_rows(page)
        for y0, y1, text in rows:
            if page_idx == 0:
                m_title = RE_GROUP_TITLE.match(text)
                if m_title:
                    group_title = text
                m_total = RE_TOTAL_COUNT.match(text)
                if m_total:
                    expected_count = int(m_total.group(1))

            if _is_chrome_row(text, page_idx):
                continue
            events.append(("text", page_idx, y0, y1, text))

        for img_info in page.get_images(full=True):
            xref = img_info[0]
            rects = page.get_image_rects(xref)
            if not rects:
                continue
            extracted = doc.extract_image(xref)
            img_bytes = extracted["image"]
            ext = extracted.get("ext", "png")
            for rect in rects:
                key = (
                    page_idx,
                    round(rect.x0, 1),
                    round(rect.y0, 1),
                    round(rect.x1, 1),
                    round(rect.y1, 1),
                )
                if key in seen_img_rects_on_page:
                    continue
                seen_img_rects_on_page.add(key)
                events.append(("image", page_idx, rect.y0, rect.y1, xref, img_bytes, ext))

    # Sort all events by (page_idx, y0) so images sit strictly between the stem and options
    # (or within the active question's vertical span).
    events.sort(key=lambda ev: (ev[1], ev[2], 0 if ev[0] == "text" else 1))

    questions: list[dict] = []
    orphan_images: list[dict] = []

    current_q: dict | None = None
    in_options = False
    expected_next_q_num = 1

    def finalize_current() -> None:
        nonlocal current_q, in_options
        if current_q is not None:
            current_q["text"] = _clean_text(current_q["text"])
            current_q["options"] = [_clean_text(opt) for opt in current_q["options"]]
            questions.append(current_q)
            current_q = None
            in_options = False

    for ev in events:
        kind = ev[0]
        if kind == "image":
            _, page_idx, y0, y1, xref, img_bytes, ext = ev
            if current_q is not None and current_q.get("correctIndex") is None:
                img_path = image_writer(img_bytes, ext)
                current_q["images"].append(img_path)
            else:
                orphan_images.append({"page": page_idx + 1, "xref": xref, "y0": y0, "y1": y1})
            continue

        _, page_idx, y0, y1, text = ev

        m_ans = RE_ANSWER.match(text)
        if m_ans and current_q is not None:
            ans_num = int(m_ans.group(1))
            current_q["correctIndex"] = ans_num - 1
            finalize_current()
            expected_next_q_num += 1
            continue

        m_num = RE_NUMBERED_ITEM.match(text)
        if m_num:
            num = int(m_num.group(1))
            rest = m_num.group(2).strip()

            # Detect whether this numbered line starts a new question or an option.
            # New question starts when:
            # - no active question and num == expected_next_q_num
            # - OR active question is not yet finalized? (handled above since Պատ. finalizes)
            if current_q is None:
                if num != expected_next_q_num:
                    raise ValueError(
                        f"Group {group_id}: expected question {expected_next_q_num} on page {page_idx + 1}, got '{text}'"
                    )
                current_q = {
                    "uid": f"g{group_id}-q{num}",
                    "groupId": group_id,
                    "number": num,
                    "text": rest,
                    "images": [],
                    "options": [],
                    "correctIndex": None,
                }
                in_options = False
                continue

            # Inside an active question: numbered items 1, 2, ... are options
            expected_opt_num = len(current_q["options"]) + 1
            if num == expected_opt_num:
                in_options = True
                current_q["options"].append(rest)
                continue

            # Rare edge case: what if a question stem itself begins with a number?
            # If not in_options yet, append to stem; otherwise raise for inspection.
            if not in_options:
                current_q["text"] = f"{current_q['text']} {text}".strip()
                continue
            raise ValueError(
                f"Group {group_id} Q{current_q['number']}: unexpected numbered line '{text}' "
                f"(expected option {expected_opt_num}) on page {page_idx + 1}"
            )

        # Plain continuation line
        if current_q is not None:
            if in_options and current_q["options"]:
                current_q["options"][-1] = f"{current_q['options'][-1]} {text}".strip()
            else:
                current_q["text"] = f"{current_q['text']} {text}".strip()

    if current_q is not None:
        raise ValueError(f"Group {group_id}: unclosed question {current_q['number']} at end of PDF")

    if expected_count is None:
        expected_count = len(questions)

    group_data = {
        "id": group_id,
        "title": group_title,
        "questionCount": expected_count,
        "questions": questions,
    }
    return group_data, orphan_images


def verify_group_data(group: dict, orphan_images: list[dict]) -> None:
    """Validate structural integrity of an extracted group."""
    if orphan_images:
        raise ValueError(f"Group {group['id']}: found {len(orphan_images)} orphan image(s): {orphan_images[:3]}")

    questions = group["questions"]
    if len(questions) != group["questionCount"]:
        raise ValueError(
            f"Group {group['id']}: extracted question count ({len(questions)}) "
            f"!= header count ({group['questionCount']})"
        )

    for idx, q in enumerate(questions, start=1):
        if q["number"] != idx:
            raise ValueError(f"Group {group['id']}: expected question number {idx}, got {q['number']}")
        if not q["text"]:
            raise ValueError(f"Group {group['id']} Q{idx}: empty question text")
        if len(q["options"]) < 2:
            raise ValueError(f"Group {group['id']} Q{idx}: fewer than 2 options ({q['options']})")
        if any(not opt for opt in q["options"]):
            raise ValueError(f"Group {group['id']} Q{idx}: empty option in {q['options']}")
        ci = q.get("correctIndex")
        if ci is None or not (0 <= ci < len(q["options"])):
            raise ValueError(
                f"Group {group['id']} Q{idx}: invalid correctIndex {ci} for {len(q['options'])} options"
            )


def download_pdfs(raw_dir: Path, refresh: bool = False) -> list[tuple[int, Path]]:
    raw_dir.mkdir(parents=True, exist_ok=True)
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    paths: list[tuple[int, Path]] = []
    for gid in GROUP_IDS:
        dest = raw_dir / f"{gid}.pdf"
        if refresh or not dest.exists() or dest.stat().st_size == 0:
            url = BASE_URL.format(group_id=gid)
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=60) as resp:
                dest.write_bytes(resp.read())
        paths.append((gid, dest))
    return paths


def build_dataset(raw_dir: Path, data_dir: Path, refresh: bool = False) -> dict:
    images_dir = data_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    pdf_files = download_pdfs(raw_dir, refresh=refresh)

    def image_writer(img_bytes: bytes, ext: str) -> str:
        digest = hashlib.sha256(img_bytes).hexdigest()[:16]
        norm_ext = "jpg" if ext.lower() == "jpeg" else ext.lower()
        filename = f"{digest}.{norm_ext}"
        out_path = images_dir / filename
        if not out_path.exists():
            out_path.write_bytes(img_bytes)
        return f"data/images/{filename}"

    explanations_path = data_dir / "explanations.json"
    explanations_map: dict[str, str] = {}
    if explanations_path.exists():
        explanations_map = json.loads(explanations_path.read_text(encoding="utf-8"))

    groups: list[dict] = []
    for gid, pdf_path in pdf_files:
        with pymupdf.open(pdf_path) as doc:
            group_data, orphans = parse_pdf_document(doc, gid, image_writer)
            verify_group_data(group_data, orphans)
            for q in group_data["questions"]:
                if q["uid"] in explanations_map:
                    q["explanation"] = explanations_map[q["uid"]]
            groups.append(group_data)
            img_q_count = sum(1 for q in group_data["questions"] if q["images"])
            print(
                f"Group {gid:2d}: {len(group_data['questions']):3d} questions "
                f"({img_q_count:3d} with images) - OK"
            )

    dataset = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "roadpolice.am/exam/abc/hy",
        "totalQuestions": sum(len(g["questions"]) for g in groups),
        "groups": groups,
    }

    json_path = data_dir / "questions.json"
    json_text = json.dumps(dataset, ensure_ascii=False, indent=2)
    json_path.write_text(json_text, encoding="utf-8")

    js_path = data_dir / "questions.js"
    js_path.write_text(f"window.EXAM_DATA = {json_text};\n", encoding="utf-8")

    return dataset


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract roadpolice.am ABC exam PDFs.")
    parser.add_argument("--refresh", action="store_true", help="Re-download all PDFs.")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    dataset = build_dataset(
        raw_dir=project_root / "raw_pdfs",
        data_dir=project_root / "data",
        refresh=args.refresh,
    )
    print(f"Total extracted questions: {dataset['totalQuestions']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
