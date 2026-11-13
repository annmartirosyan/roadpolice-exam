#!/usr/bin/env python3
"""Download and extract RU and EN official roadpolice.am ABC exam PDFs."""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import urllib.request
from pathlib import Path

import certifi
import pymupdf

BASE_URL = "https://roadpolice.am/exam/abc/{lang}/{group_id}.pdf"
GROUP_IDS = list(range(1, 11))

LANG_PATTERNS = {
    "ru": {
        "group_title": re.compile(r"^ГРУППА\s+(\d+)$", re.I),
        "total_count": re.compile(r"^(\d+)\s+вопрос", re.I),
        "header": re.compile(r"^(?:Категории\s+ABC|ГРУППА\s+\d+)", re.I),
        "footer": re.compile(r"^стр\.\s*\d+\s*/\s*\d+$", re.I),
        "answer": re.compile(r"^Ответ\s*:\s*(\d+)\s*$", re.I),
    },
    "en": {
        "group_title": re.compile(r"^GROUP\s+(\d+)$", re.I),
        "total_count": re.compile(r"^(\d+)\s+question", re.I),
        "header": re.compile(r"^(?:ABC\s+categories|GROUP\s+\d+)", re.I),
        "footer": re.compile(r"^page\s+\d+\s*/\s*\d+$", re.I),
        "answer": re.compile(r"^Answer\s*:\s*(\d+)\s*$", re.I),
    },
}

RE_NUMBERED_ITEM = re.compile(r"^(\d+)\.\s*(.*)$")


def _clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _extract_visual_rows(page: pymupdf.Page) -> list[str]:
    raw_lines: list[tuple[float, float, str]] = []
    text_dict = page.get_text("dict")
    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            txt = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
            if not txt:
                continue
            x0, y0, _x1, _y1 = line["bbox"]
            raw_lines.append((y0, x0, txt))

    raw_lines.sort(key=lambda item: (round(item[0], 1), item[1]))
    rows: list[list[tuple[float, float, str]]] = []
    for item in raw_lines:
        if rows and abs(item[0] - rows[-1][0][0]) <= 3.0:
            rows[-1].append(item)
        else:
            rows.append([item])

    out: list[str] = []
    for row in rows:
        row.sort(key=lambda item: item[1])
        merged = _clean_text(" ".join(item[2] for item in row))
        if merged:
            out.append(merged)
    return out


def parse_multilang_pdf(doc: pymupdf.Document, group_id: int, lang: str) -> list[dict]:
    pats = LANG_PATTERNS[lang]
    expected_count: int | None = None
    lines: list[str] = []

    for page_idx, page in enumerate(doc):
        for row in _extract_visual_rows(page):
            if page_idx == 0:
                m_tot = pats["total_count"].match(row)
                if m_tot:
                    expected_count = int(m_tot.group(1))
                    continue
            if pats["header"].match(row) or pats["footer"].match(row) or pats["group_title"].match(row):
                continue
            lines.append(row)

    questions: list[dict] = []
    current_q: dict | None = None
    in_options = False
    expected_next_q = 1

    for text in lines:
        m_ans = pats["answer"].match(text)
        if m_ans and current_q is not None:
            current_q["correctIndex"] = int(m_ans.group(1)) - 1
            current_q["text"] = _clean_text(current_q["text"])
            current_q["options"] = [_clean_text(o) for o in current_q["options"]]
            questions.append(current_q)
            current_q = None
            in_options = False
            expected_next_q += 1
            continue

        m_num = RE_NUMBERED_ITEM.match(text)
        if m_num:
            num = int(m_num.group(1))
            rest = m_num.group(2).strip()
            if current_q is None:
                if num != expected_next_q:
                    raise ValueError(
                        f"[{lang}] Group {group_id}: expected Q{expected_next_q}, got '{text}'"
                    )
                current_q = {
                    "uid": f"g{group_id}-q{num}",
                    "number": num,
                    "text": rest,
                    "options": [],
                    "correctIndex": None,
                }
                in_options = False
                continue

            expected_opt = len(current_q["options"]) + 1
            if num == expected_opt:
                in_options = True
                current_q["options"].append(rest)
                continue

            if not in_options:
                current_q["text"] = f"{current_q['text']} {text}".strip()
                continue

            raise ValueError(
                f"[{lang}] Group {group_id} Q{current_q['number']}: unexpected numbered line '{text}'"
            )

        if current_q is not None:
            if in_options and current_q["options"]:
                current_q["options"][-1] = f"{current_q['options'][-1]} {text}".strip()
            else:
                current_q["text"] = f"{current_q['text']} {text}".strip()

    if current_q is not None:
        raise ValueError(f"[{lang}] Group {group_id}: unclosed question {current_q['number']}")

    if expected_count is not None and len(questions) != expected_count:
        raise ValueError(
            f"[{lang}] Group {group_id}: extracted {len(questions)} != header {expected_count}"
        )

    return questions


def build_multilang_dataset(raw_dir: Path, data_dir: Path, refresh: bool = False) -> dict:
    hy_data = json.loads((data_dir / "questions.json").read_text(encoding="utf-8"))
    hy_by_uid = {
        q["uid"]: q for g in hy_data["groups"] for q in g["questions"]
    }

    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    i18n: dict[str, dict[str, dict]] = {"ru": {}, "en": {}}

    for lang in ("ru", "en"):
        lang_dir = raw_dir / lang
        lang_dir.mkdir(parents=True, exist_ok=True)
        for gid in GROUP_IDS:
            dest = lang_dir / f"{gid}.pdf"
            if refresh or not dest.exists() or dest.stat().st_size == 0:
                url = BASE_URL.format(lang=lang, group_id=gid)
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, context=ssl_ctx, timeout=60) as resp:
                    dest.write_bytes(resp.read())

            with pymupdf.open(dest) as doc:
                qs = parse_multilang_pdf(doc, gid, lang)
            for q in qs:
                hy_q = hy_by_uid.get(q["uid"])
                if not hy_q:
                    raise ValueError(f"[{lang}] Unknown uid {q['uid']}")
                if len(q["options"]) != len(hy_q["options"]):
                    raise ValueError(
                        f"[{lang}] {q['uid']}: option count {len(q['options'])} != HY {len(hy_q['options'])}"
                    )
                if q["correctIndex"] != hy_q["correctIndex"]:
                    raise ValueError(
                        f"[{lang}] {q['uid']}: answer {q['correctIndex']} != HY {hy_q['correctIndex']}"
                    )
                i18n[lang][q["uid"]] = {
                    "text": q["text"],
                    "options": q["options"],
                }
        print(f"Extracted {lang.upper()}: {len(i18n[lang])} / {len(hy_by_uid)} questions verified - OK")

    json_text = json.dumps(i18n, ensure_ascii=False, indent=2)
    (data_dir / "questions_i18n.json").write_text(json_text, encoding="utf-8")
    (data_dir / "questions_i18n.js").write_text(f"window.EXAM_I18N = {json_text};\n", encoding="utf-8")
    return i18n


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract RU & EN roadpolice.am ABC PDFs.")
    parser.add_argument("--refresh", action="store_true", help="Re-download PDFs.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    build_multilang_dataset(root / "raw_pdfs", root / "data", refresh=args.refresh)
    return 0


if __name__ == "__main__":
    sys.exit(main())
