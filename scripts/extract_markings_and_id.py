#!/usr/bin/env python3
"""Extract Road Markings (Form 2), Vehicle ID Signs (Form 3), and RU/EN sign translations."""

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

import certifi

DRV_URLS = {
    "hy": "https://drv.am/road-signs/hy",
    "ru": "https://drv.am/road-signs/ru",
    "en": "https://drv.am/road-signs/en",
}

RE_SIGN_CODE = re.compile(r"^(\d+(?:\.\d+)*)\b")


def _clean(fragment: str) -> str:
    txt = re.sub(r"<[^>]+>", " ", fragment)
    txt = html_lib.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


def parse_drv_sections(raw_html: str) -> dict:
    """Parse Form 1 (signs), Form 2 (markings), and Form 3 (vehicle ID signs) from drv.am HTML."""
    # Split out all h2 / h3 blocks in document order after the main form headings
    m_start = re.search(r'<h2\s+id=["\'][^"\']*(?:ձև-n-1|форма-n-1|form-no-1)[^"\']*["\']', raw_html, re.I)
    if not m_start:
        # Fallback: start at first <h2
        m_start = re.search(r"<h2\b", raw_html, re.I)
    content = raw_html[m_start.start():] if m_start else raw_html

    tokens = list(re.finditer(r"<(h2|h3)\b([^>]*)>(.*?)</\1>", content, re.S | re.I))
    form1_signs: list[dict] = []
    markings_horiz: list[dict] = []
    markings_vert: list[dict] = []
    vehicle_ids: list[dict] = []

    current_form = 1
    current_sub = ""

    for idx, m in enumerate(tokens):
        tag = m.group(1).lower()
        attrs = m.group(2)
        title = _clean(m.group(3))
        end_pos = tokens[idx + 1].start() if idx + 1 < len(tokens) else len(content)
        body_slice = content[m.end() : end_pos]
        # Cut off at footer/next major block if last
        if idx + 1 == len(tokens):
            cut = body_slice.find("</div>")
            if cut != -1:
                body_slice = body_slice[:cut]

        if tag == "h2":
            tl = title.lower()
            if "ձև n 2" in tl or "форма n 2" in tl or "form no. 2" in tl:
                current_form = 2
                current_sub = "horiz"
            elif "ձև n 3" in tl or "форма n 3" in tl or "form no. 3" in tl:
                current_form = 3
                current_sub = "id"
            elif "ձև n 1" in tl or "форма n 1" in tl or "form no. 1" in tl:
                current_form = 1
            elif "ii." in tl or "ուղղաձիգ" in tl or "вертикаль" in tl or "vertical" in tl:
                current_sub = "vert"
            elif "i." in tl or "հորիզոնական" in tl or "горизонталь" in tl or "horizontal" in tl:
                current_sub = "horiz"
            continue

        # h3 item
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', body_slice, re.I)
        # Filter out non-sign UI icons if any
        imgs = [u for u in imgs if "road-signs" in u or "mark-" in u or "ident-" in u or "sign-" in u]
        # Extract <p> paragraphs (exclude action-text-attachment figcaptions)
        p_texts = [_clean(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", body_slice, re.S | re.I)]
        desc = " ".join(p for p in p_texts if p).strip()

        m_code = RE_SIGN_CODE.match(title)
        code = m_code.group(1) if m_code else ""
        rec = {
            "code": code,
            "title": title,
            "description": desc,
            "remoteImages": imgs,
        }
        if current_form == 1:
            form1_signs.append(rec)
        elif current_form == 2:
            if current_sub == "vert" or code.startswith("2."):
                markings_vert.append(rec)
            else:
                markings_horiz.append(rec)
        elif current_form == 3:
            vehicle_ids.append(rec)

    return {
        "form1": form1_signs,
        "horiz": markings_horiz,
        "vert": markings_vert,
        "vehicle_id": vehicle_ids,
    }


def build_markings_and_i18n(raw_dir: Path, data_dir: Path, refresh: bool = False) -> tuple[dict, dict]:
    raw_dir.mkdir(parents=True, exist_ok=True)
    img_dir = data_dir / "markings"
    img_dir.mkdir(parents=True, exist_ok=True)
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())

    parsed_by_lang = {}
    for lang, url in DRV_URLS.items():
        cache = raw_dir / f"drv_signs_{lang}.html"
        if refresh or not cache.exists() or cache.stat().st_size == 0:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
                cache.write_bytes(resp.read())
        html = cache.read_text(encoding="utf-8", errors="replace")
        parsed_by_lang[lang] = parse_drv_sections(html)
        p = parsed_by_lang[lang]
        print(
            f"drv.am [{lang}]: form1={len(p['form1'])}, horiz={len(p['horiz'])}, "
            f"vert={len(p['vert'])}, vehicle_id={len(p['vehicle_id'])}"
        )

    def download_img(url: str) -> str:
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower() or ".png"
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
        fname = f"{digest}{ext}"
        dest = img_dir / fname
        if refresh or not dest.exists() or dest.stat().st_size == 0:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
                dest.write_bytes(resp.read())
        return f"data/markings/{fname}"

    # Build Form 2 + Form 3 dataset aligned across hy/ru/en
    categories_cfg = [
        (
            "horiz",
            101,
            {
                "hy": "I. Հորիզոնական գծանշում (1.1–1.26)",
                "ru": "I. Горизонтальная разметка (1.1–1.26)",
                "en": "I. Horizontal Markings (1.1–1.26)",
            },
        ),
        (
            "vert",
            102,
            {
                "hy": "II. Ուղղաձիգ գծանշում (2.1–2.7)",
                "ru": "II. Вертикальная разметка (2.1–2.7)",
                "en": "II. Vertical Markings (2.1–2.7)",
            },
        ),
        (
            "vehicle_id",
            103,
            {
                "hy": "Տրանսպորտային միջոցի ճանաչման նշաններ (Ձև N 3)",
                "ru": "Опознавательные знаки ТС (форма N 3)",
                "en": "Vehicle Identification Signs (Form No. 3)",
            },
        ),
    ]

    marking_categories = []
    total_items = 0
    for key, cat_id, titles in categories_cfg:
        hy_items = parsed_by_lang["hy"][key]
        ru_items = parsed_by_lang["ru"][key]
        en_items = parsed_by_lang["en"][key]
        items_out = []
        for i, hy_it in enumerate(hy_items):
            ru_it = ru_items[i] if i < len(ru_items) else hy_it
            en_it = en_items[i] if i < len(en_items) else hy_it
            local_imgs = [download_img(u) for u in hy_it["remoteImages"]]
            code = hy_it["code"] or f"id-{i+1}"
            items_out.append(
                {
                    "id": f"m-{cat_id}-{i+1}",
                    "categoryId": cat_id,
                    "code": code,
                    "title": hy_it["title"],
                    "title_ru": ru_it["title"],
                    "title_en": en_it["title"],
                    "description": hy_it["description"],
                    "description_ru": ru_it["description"],
                    "description_en": en_it["description"],
                    "image": local_imgs[0] if local_imgs else "",
                    "images": local_imgs,
                }
            )
            total_items += 1
        marking_categories.append(
            {
                "id": cat_id,
                "key": key,
                "title": titles["hy"],
                "title_ru": titles["ru"],
                "title_en": titles["en"],
                "count": len(items_out),
                "items": items_out,
            }
        )

    markings_dataset = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalItems": total_items,
        "categories": marking_categories,
    }
    m_json = json.dumps(markings_dataset, ensure_ascii=False, indent=2)
    (data_dir / "markings.json").write_text(m_json, encoding="utf-8")
    (data_dir / "markings.js").write_text(f"window.MARKINGS_DATA = {m_json};\n", encoding="utf-8")

    # Also build RU/EN translations for existing signs.json by matching code
    signs_data = json.loads((data_dir / "signs.json").read_text(encoding="utf-8"))
    ru_by_code = {}
    en_by_code = {}
    for item in parsed_by_lang["ru"]["form1"]:
        if item["code"] and item["code"] not in ru_by_code:
            ru_by_code[item["code"]] = item
    for item in parsed_by_lang["en"]["form1"]:
        if item["code"] and item["code"] not in en_by_code:
            en_by_code[item["code"]] = item

    cat_titles_i18n = {
        "ru": {
            1: "1. ПРЕДУПРЕЖДАЮЩИЕ ЗНАКИ",
            2: "2. ЗНАКИ ПРИОРИТЕТА",
            3: "3. ЗАПРЕЩАЮЩИЕ ЗНАКИ",
            4: "4. ПРЕДПИСЫВАЮЩИЕ ЗНАКИ",
            5: "5. ЗНАКИ ОСОБЫХ ПРЕДПИСАНИЙ",
            6: "6. ИНФОРМАЦИОННЫЕ ЗНАКИ",
            7: "7. ЗНАКИ СЕРВИСА",
            8: "8. ЗНАКИ ДОПОЛНИТЕЛЬНОЙ ИНФОРМАЦИИ (ТАБЛИЧКИ)",
        },
        "en": {
            1: "1. WARNING SIGNS",
            2: "2. PRIORITY SIGNS",
            3: "3. PROHIBITORY SIGNS",
            4: "4. MANDATORY SIGNS",
            5: "5. SPECIAL REGULATION SIGNS",
            6: "6. INFORMATION SIGNS",
            7: "7. SERVICE SIGNS",
            8: "8. ADDITIONAL INFORMATION SIGNS (PLATES)",
        },
    }

    signs_i18n = {"categories": cat_titles_i18n, "ru": {}, "en": {}}
    for cat in signs_data["categories"]:
        for s in cat["signs"]:
            m = RE_SIGN_CODE.match(s["title"])
            code = m.group(1) if m else s["code"]
            if code in ru_by_code:
                signs_i18n["ru"][s["id"]] = {
                    "title": ru_by_code[code]["title"],
                    "description": ru_by_code[code]["description"],
                }
            if code in en_by_code:
                signs_i18n["en"][s["id"]] = {
                    "title": en_by_code[code]["title"],
                    "description": en_by_code[code]["description"],
                }

    si_json = json.dumps(signs_i18n, ensure_ascii=False, indent=2)
    (data_dir / "signs_i18n.json").write_text(si_json, encoding="utf-8")
    (data_dir / "signs_i18n.js").write_text(f"window.SIGNS_I18N = {si_json};\n", encoding="utf-8")
    print(
        f"Saved markings.js ({total_items} items) and signs_i18n.js "
        f"(ru={len(signs_i18n['ru'])}, en={len(signs_i18n['en'])})."
    )
    return markings_dataset, signs_i18n


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract Road Markings & Vehicle ID Signs.")
    parser.add_argument("--refresh", action="store_true", help="Re-download sources.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    build_markings_and_i18n(root / "raw_pdfs", root / "data", refresh=args.refresh)
    return 0


if __name__ == "__main__":
    sys.exit(main())
