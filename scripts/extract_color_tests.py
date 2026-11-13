#!/usr/bin/env python3
"""Download and extract Armenian color-blindness / psychological test plates."""

from __future__ import annotations

import argparse
import hashlib
import html as html_lib
import json
import re
import ssl
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import certifi

AGDRIVE_PAGE_URL = "https://agdrive.am/am/Tests/psychological-tests"
VARORD_PSYCHO_URL = (
    "https://www.varord.am/%D6%84%D5%B6%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6-%D5%B0%D5%A1%D6%80%D6%81%D5%A5%D6%80/"
    "%D5%B0%D5%B8%D5%A3%D5%A5%D5%A2%D5%A1%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6-%D5%A9%D5%A5%D5%BD%D5%BF%D5%A5%D6%80"
)
VARORD_ORIGIN = "https://www.varord.am"


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", html_lib.unescape(text)).strip()


def parse_varord_psycho_html(raw_html: str) -> list[dict]:
    blocks = re.split(r'<div\s+id=["\']q_\d+["\']', raw_html)[1:]
    items: list[dict] = []
    for idx, block in enumerate(blocks, start=1):
        img_m = re.search(r'<img[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']', block, flags=re.I)
        h3_m = re.search(r"<h3>(.*?)</h3>", block, flags=re.S | re.I)
        opts_raw = re.findall(
            r'<input[^>]*value=["\']([^"\']+)["\'][^>]*data-rs=["\']([^"\']+)["\']',
            block,
            flags=re.I,
        )
        if not img_m or not h3_m or len(opts_raw) < 2:
            continue
        options = [_clean(val) for val, _rs in opts_raw]
        correct_indices = [i for i, (_val, rs) in enumerate(opts_raw) if rs.lower() == "ok"]
        if len(correct_indices) != 1:
            continue
        items.append(
            {
                "source": "varord.am",
                "sourceOrder": idx,
                "question": _clean(h3_m.group(1)),
                "options": options,
                "correctIndex": correct_indices[0],
                "remoteImage": img_m.group(1).strip(),
            }
        )
    return items


def parse_agdrive_js_chunk(js_text: str) -> list[dict]:
    anchor = js_text.find("options_am:")
    if anchor == -1:
        raise ValueError("Could not find psychological tests array in agdrive bundle")
    # Locate the array starting with [{id:1,question_am:
    m_start = re.search(r"\[\{\s*id\s*:\s*1\s*,\s*question_am\s*:", js_text)
    if not m_start:
        raise ValueError("Could not find array start in agdrive bundle")
    start = m_start.start()
    end = js_text.find("}],roadSigns", start)
    if end == -1:
        end = js_text.find("}]", start)
    if end == -1:
        raise ValueError("Could not find array end in agdrive bundle")
    arr_js = js_text[start : end + 2]

    # Convert JS object literal keys to valid JSON using node
    node_code = (
        "const arr = "
        + arr_js
        + "; console.log(JSON.stringify(arr));"
    )
    proc = subprocess.run(
        ["node", "-e", node_code],
        check=True,
        capture_output=True,
        text=True,
    )
    raw_items = json.loads(proc.stdout)
    out: list[dict] = []
    for item in raw_items:
        opts = [_clean(str(o)) for o in item.get("options_am", [])]
        ans = item.get("answer")
        if not isinstance(ans, int) or not (0 <= ans < len(opts)):
            continue
        out.append(
            {
                "source": "agdrive.am",
                "sourceOrder": int(item.get("id", len(out) + 1)),
                "question": _clean(str(item.get("question_am", ""))),
                "options": opts,
                "correctIndex": ans,
                "remoteImage": str(item.get("image", "")).strip(),
            }
        )
    return out


def build_color_tests_dataset(raw_dir: Path, data_dir: Path, refresh: bool = False) -> dict:
    raw_dir.mkdir(parents=True, exist_ok=True)
    img_dir = data_dir / "color_tests"
    img_dir.mkdir(parents=True, exist_ok=True)
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())

    def fetch_text(url: str, cache_name: str) -> str:
        cache_path = raw_dir / cache_name
        if refresh or not cache_path.exists() or cache_path.stat().st_size == 0:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
                cache_path.write_bytes(resp.read())
        return cache_path.read_text(encoding="utf-8", errors="replace")

    varord_html = fetch_text(VARORD_PSYCHO_URL, "varord_psycho.html")
    varord_items = parse_varord_psycho_html(varord_html)

    ag_html = fetch_text(AGDRIVE_PAGE_URL, "agdrive_psycho.html")
    bundle_m = re.search(r'<script[^>]+src=["\']([^"\']*assets/index-[^"\']+\.js)["\']', ag_html)
    if not bundle_m:
        raise ValueError("Could not find agdrive bundle script URL")
    bundle_url = urllib.parse.urljoin("https://agdrive.am/", bundle_m.group(1))
    ag_js = fetch_text(bundle_url, "agdrive_bundle.js")
    ag_items = parse_agdrive_js_chunk(ag_js)

    def download_image(url: str) -> tuple[str, str]:
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            ext = ".jpg"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
            payload = resp.read()
        digest = hashlib.sha256(payload).hexdigest()[:16]
        norm_ext = ".jpg" if ext == ".jpeg" else ext
        filename = f"{digest}{norm_ext}"
        dest = img_dir / filename
        if not dest.exists():
            dest.write_bytes(payload)
        return f"data/color_tests/{filename}", digest

    combined = []
    seen_hashes = set()
    for item in ag_items + varord_items:
        remote = item.pop("remoteImage")
        full_url = (
            urllib.parse.urljoin(VARORD_ORIGIN, remote)
            if item["source"] == "varord.am"
            else remote
        )
        local_path, digest = download_image(full_url)
        if digest in seen_hashes:
            continue
        seen_hashes.add(digest)
        num = len(combined) + 1
        combined.append(
            {
                "id": f"ct-{num}",
                "number": num,
                "question": item["question"],
                "image": local_path,
                "options": item["options"],
                "correctIndex": item["correctIndex"],
                "source": item["source"],
            }
        )

    dataset = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": [AGDRIVE_PAGE_URL, VARORD_PSYCHO_URL],
        "totalPlates": len(combined),
        "plates": combined,
    }
    json_text = json.dumps(dataset, ensure_ascii=False, indent=2)
    (data_dir / "color_tests.json").write_text(json_text, encoding="utf-8")
    (data_dir / "color_tests.js").write_text(
        f"window.COLOR_TESTS_DATA = {json_text};\n", encoding="utf-8"
    )
    print(f"Extracted {len(combined)} unique color-perception plates ({len(ag_items)} agdrive + {len(varord_items)} varord).")
    return dataset


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract Armenian color-perception test plates.")
    parser.add_argument("--refresh", action="store_true", help="Re-download sources.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    build_color_tests_dataset(root / "raw_pdfs", root / "data", refresh=args.refresh)
    return 0


if __name__ == "__main__":
    sys.exit(main())
