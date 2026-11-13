#!/usr/bin/env python3
"""Parse official Armenian Traffic Rules (ՃԵԿ), Law on Road Traffic Safety, and Malfunctions into data/rules.js."""

from __future__ import annotations

import html as html_lib
import json
import re
import ssl
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import certifi

SOURCES = {
    "jek": "https://www.varord.am/%D5%A3%D5%AB%D5%BF%D5%A5%D5%AC%D5%AB%D6%84%D5%AB-%D5%A2%D5%A1%D5%A6%D5%A1/%D5%B3%D5%A1%D5%B6%D5%A1%D5%BA%D5%A1%D6%80%D5%B0%D5%A1%D5%B5%D5%AB%D5%B6-%D5%A5%D6%80%D5%A9%D6%87%D5%A5%D5%AF%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6-%D5%AF%D5%A1%D5%B6%D5%B8%D5%B6%D5%B6%D5%A5%D6%80",
    "law": "https://www.varord.am/%D5%A3%D5%AB%D5%BF%D5%A5%D5%AC%D5%AB%D6%84%D5%AB-%D5%A2%D5%A1%D5%A6%D5%A1/%D6%85%D6%80%D5%A5%D5%B6%D6%84-%D5%B3%D5%A1%D5%B6%D5%A1%D5%BA%D5%A1%D6%80%D5%B0%D5%A1%D5%B5%D5%AB%D5%B6-%D5%A5%D6%80%D5%A9%D6%87%D5%A5%D5%AF%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6-%D5%A1%D5%B6%D5%BE%D5%BF%D5%A1%D5%B6%D5%A3%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6-%D5%B4%D5%A1%D5%BD%D5%AB%D5%B6",
    "malfunctions": "https://www.varord.am/%D5%A3%D5%AB%D5%BF%D5%A5%D5%AC%D5%AB%D6%84%D5%AB-%D5%A2%D5%A1%D5%A6%D5%A1/%D5%BF-%D5%B4-%D5%B6%D5%A5%D6%80%D5%AB-%D5%B7%D5%A1%D5%B0%D5%A1%D5%A3%D5%B8%D6%80%D5%AE%D5%B8%D6%82%D5%B4%D5%B6-%D5%A1%D6%80%D5%A3%D5%A5%D5%AC%D5%B8%D5%B2-%D5%A1%D5%B6%D5%BD%D5%A1%D6%80%D6%84%D5%B8%D6%82%D5%A9%D5%B5%D5%B8%D6%82%D5%B6%D5%B6%D5%A5%D6%80%D5%AB-%D5%B8%D6%82-%D5%BA%D5%A1%D5%B5%D5%B4%D5%A1%D5%B6%D5%B6%D5%A5%D6%80%D5%AB-%D6%81%D5%A1%D5%B6%D5%AF",
}

RE_POINT = re.compile(r"^(\d+(?:\.\d+)?)\.\s*(.+)$", re.S)
RE_ARTICLE = re.compile(r"^Հոդված\s+(\d+(?:\.\d+)?)\.?", re.I)
RE_SUBNUM = re.compile(r"^(\d+)\)\s*")


def _clean(fragment: str) -> str:
    txt = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = html_lib.unescape(txt)
    lines = [re.sub(r"[ \t]+", " ", l).strip() for l in txt.splitlines()]
    return "\n".join(l for l in lines if l).strip()


def parse_accordion_chapters(raw_html: str, doc_id: str) -> list[dict]:
    m_acc = re.search(r'<div\s+id=["\']accordion["\'][^>]*>(.*)', raw_html, re.S | re.I)
    if not m_acc:
        raise ValueError(f"[{doc_id}] Missing #accordion container")
    acc = m_acc.group(1)
    for stop in ("<!-- End Content -->", "<footer", '<div class="fb-comments"'):
        idx = acc.find(stop)
        if idx != -1:
            acc = acc[:idx]

    parts = re.split(r"(<h3>.*?</h3>)", acc, flags=re.S | re.I)
    chapters: list[dict] = []

    for i in range(1, len(parts), 2):
        ch_title = _clean(parts[i])
        body = parts[i + 1] if i + 1 < len(parts) else ""
        blocks = body.split('<div class="full-length')
        items: list[dict] = []

        # Track article number if heading has "Հոդված N"
        m_ch_art = RE_ARTICLE.search(ch_title)
        ch_art_num = m_ch_art.group(1) if m_ch_art else ""

        for b_idx, block in enumerate(blocks[1:], start=1):
            # Cut off trailing closing wrappers on last block
            h4_m = re.search(r"<h4>(.*?)</h4>", block, re.S | re.I)
            heading = _clean(h4_m.group(1)) if h4_m else ""
            block_no_h4 = re.sub(r"<h4>.*?</h4>", "", block, flags=re.S | re.I)
            text = _clean(block_no_h4)
            if not text and not heading:
                continue

            full_text = f"{heading}\n{text}".strip() if heading else text
            ref = ""
            number = ""
            item_id = f"{doc_id}-{len(chapters)+1}-{b_idx}"

            if doc_id == "jek":
                m_pt = RE_POINT.match(full_text)
                if m_pt:
                    number = m_pt.group(1)
                    ref = f"Կետ {number}"
                    item_id = f"ket-{number}"
            elif doc_id == "law":
                m_art = RE_ARTICLE.match(full_text) or RE_ARTICLE.match(heading)
                if m_art:
                    number = m_art.group(1)
                    ref = f"Հոդված {number}"
                    item_id = f"hodvac-{number}"
                elif heading:
                    ref = heading
            elif doc_id == "malfunctions":
                m_sub = RE_SUBNUM.match(full_text)
                if m_sub:
                    number = f"{len(chapters)+1}.{m_sub.group(1)}"
                    ref = f"Կետ {len(chapters)+1}.{m_sub.group(1)}"

            items.append(
                {
                    "id": item_id,
                    "ref": ref,
                    "number": number,
                    "text": full_text,
                }
            )

        if items:
            chapters.append(
                {
                    "id": f"{doc_id}-ch-{len(chapters)+1}",
                    "article": ch_art_num,
                    "title": ch_title,
                    "items": items,
                }
            )

    return chapters


def build_rules_dataset(raw_dir: Path, data_dir: Path, refresh: bool = False) -> dict:
    raw_dir.mkdir(parents=True, exist_ok=True)
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())

    def fetch(key: str) -> str:
        cache = raw_dir / f"varord_{key}.html"
        if refresh or not cache.exists() or cache.stat().st_size == 0:
            req = urllib.request.Request(SOURCES[key], headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
                cache.write_bytes(resp.read())
        return cache.read_text(encoding="utf-8", errors="replace")

    docs = [
        {
            "id": "jek",
            "title": "ՀՀ Ճանապարհային երթևեկության կանոններ (ՃԵԿ)",
            "chapters": parse_accordion_chapters(fetch("jek"), "jek"),
        },
        {
            "id": "law",
            "title": "Օրենք «Ճանապարհային երթևեկության անվտանգության ապահովման մասին»",
            "chapters": parse_accordion_chapters(fetch("law"), "law"),
        },
        {
            "id": "malfunctions",
            "title": "Շահագործումն արգելող անսարքությունների ցանկ (N 2 հավելված)",
            "chapters": parse_accordion_chapters(fetch("malfunctions"), "malfunctions"),
        },
    ]

    dataset = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "documents": docs,
    }
    json_text = json.dumps(dataset, ensure_ascii=False, indent=2)
    (data_dir / "rules.json").write_text(json_text, encoding="utf-8")
    (data_dir / "rules.js").write_text(f"window.RULES_DATA = {json_text};\n", encoding="utf-8")
    for d in docs:
        cnt = sum(len(c["items"]) for c in d["chapters"])
        print(f"Rules [{d['id']}]: {len(d['chapters'])} chapters, {cnt} items")
    return dataset


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    build_rules_dataset(root / "raw_pdfs", root / "data")
    return 0


if __name__ == "__main__":
    sys.exit(main())
