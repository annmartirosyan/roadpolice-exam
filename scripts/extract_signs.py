#!/usr/bin/env python3
"""Download and extract Armenian road signs & descriptions from varord.am."""

from __future__ import annotations

import argparse
import hashlib
import html as html_lib
import json
import re
import ssl
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import certifi

SIGNS_PAGE_URL = (
    "https://www.varord.am/%D5%A3%D5%AB%D5%BF%D5%A5%D5%AC%D5%AB%D6%84%D5%AB-%D5%A2%D5%A1%D5%A6%D5%A1/"
    "%D5%B3%D5%A1%D5%B6%D5%A1%D5%BA%D5%A1%D6%80%D5%B0%D5%A1%D5%B5%D5%AB%D5%B6-%D5%B6%D5%B7%D5%A1%D5%B6%D5%B6%D5%A5%D6%80"
)
BASE_ORIGIN = "https://www.varord.am"

RE_CATEGORY_NUM = re.compile(r"^(\d+)\.\s*(.+)$")
RE_SIGN_CODE = re.compile(r"^(\d+(?:\.\d+)*)\.\s*(.*)$")


def _strip_tags(fragment: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", fragment, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def parse_signs_html(raw_html: str) -> list[dict]:
    """Parse road signs categories and items from the varord.am HTML page."""
    acc_match = re.search(r'<div\s+id=["\']accordion["\']\s*>(.*)', raw_html, flags=re.S | re.I)
    if not acc_match:
        raise ValueError("Could not locate #accordion container in signs HTML")

    acc_body = acc_match.group(1)
    for stop_marker in ("<!-- End Content -->", "<footer", "</main>"):
        idx = acc_body.find(stop_marker)
        if idx != -1:
            acc_body = acc_body[:idx]

    parts = re.split(r"(<h3>.*?</h3>)", acc_body, flags=re.S | re.I)
    categories: list[dict] = []

    for i in range(1, len(parts), 2):
        cat_title = _strip_tags(parts[i])
        m_cat = RE_CATEGORY_NUM.match(cat_title)
        cat_id = int(m_cat.group(1)) if m_cat else len(categories) + 1
        body = parts[i + 1] if i + 1 < len(parts) else ""

        blocks = body.split('<div class="full-length')
        signs: list[dict] = []
        for idx, block in enumerate(blocks[1:], start=1):
            img_match = re.search(r'<img[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']', block, flags=re.I)
            h4_match = re.search(r"<h4>(.*?)</h4>", block, flags=re.S | re.I)
            p_matches = re.findall(r"<p[^>]*>(.*?)</p>", block, flags=re.S | re.I)

            title = _strip_tags(h4_match.group(1)) if h4_match else ""
            if not title:
                continue

            description = " ".join(_strip_tags(p) for p in p_matches if _strip_tags(p)).strip()
            m_code = RE_SIGN_CODE.match(title)
            code = m_code.group(1) if m_code else f"{cat_id}.{idx}"
            remote_img = img_match.group(1).strip() if img_match else ""

            signs.append(
                {
                    "id": f"s-{cat_id}-{idx}-{code}",
                    "categoryId": cat_id,
                    "code": code,
                    "title": title,
                    "description": description,
                    "remoteImage": remote_img,
                    "image": "",
                }
            )

        categories.append(
            {
                "id": cat_id,
                "title": cat_title,
                "signCount": len(signs),
                "signs": signs,
            }
        )

    if not categories:
        raise ValueError("No road sign categories parsed")

    return categories


def build_signs_dataset(
    raw_dir: Path,
    data_dir: Path,
    refresh: bool = False,
) -> dict:
    raw_dir.mkdir(parents=True, exist_ok=True)
    signs_img_dir = data_dir / "signs"
    signs_img_dir.mkdir(parents=True, exist_ok=True)

    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    html_cache = raw_dir / "varord_signs.html"
    if refresh or not html_cache.exists() or html_cache.stat().st_size == 0:
        req = urllib.request.Request(SIGNS_PAGE_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=60) as resp:
            html_cache.write_bytes(resp.read())

    raw_html = html_cache.read_text(encoding="utf-8", errors="replace")
    categories = parse_signs_html(raw_html)

    def download_sign_image(remote_path: str) -> str:
        if not remote_path:
            return ""
        full_url = urllib.parse.urljoin(BASE_ORIGIN, remote_path)
        ext = Path(urllib.parse.urlparse(full_url).path).suffix.lower() or ".png"
        digest = hashlib.sha256(full_url.encode("utf-8")).hexdigest()[:16]
        filename = f"{digest}{ext}"
        dest = signs_img_dir / filename
        if refresh or not dest.exists() or dest.stat().st_size == 0:
            req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
                dest.write_bytes(resp.read())
        return f"data/signs/{filename}"

    total_signs = 0
    for cat in categories:
        for sign in cat["signs"]:
            remote_img = sign.pop("remoteImage", "")
            sign["image"] = download_sign_image(remote_img)
            total_signs += 1
        print(f"Category {cat['id']}: {cat['signCount']} signs ({cat['title']}) - OK")

    dataset = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": SIGNS_PAGE_URL,
        "totalSigns": total_signs,
        "categories": categories,
    }

    json_text = json.dumps(dataset, ensure_ascii=False, indent=2)
    (data_dir / "signs.json").write_text(json_text, encoding="utf-8")
    (data_dir / "signs.js").write_text(f"window.SIGNS_DATA = {json_text};\n", encoding="utf-8")
    return dataset


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract road signs from varord.am.")
    parser.add_argument("--refresh", action="store_true", help="Re-download HTML and images.")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    dataset = build_signs_dataset(
        raw_dir=project_root / "raw_pdfs",
        data_dir=project_root / "data",
        refresh=args.refresh,
    )
    print(f"Total extracted road signs: {dataset['totalSigns']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
