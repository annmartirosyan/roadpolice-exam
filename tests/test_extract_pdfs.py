import sys
from pathlib import Path

import pymupdf as fitz
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from extract_pdfs import parse_pdf_document, verify_group_data


def _make_sample_png_bytes() -> bytes:
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 40, 20), 0)
    pix.clear_with(200)
    return pix.tobytes("png")


def test_parse_multiline_and_image_matching(tmp_path):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    font_path = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
    page.insert_font(fontname="arm", fontfile=font_path)

    # Emit lines with split number + text columns (just like Chromium Skia PDFs)
    page.insert_text((40, 60), "ԽՈՒՄԲ 1", fontname="arm", fontsize=14)
    page.insert_text((40, 80), "ABC կարգեր · տեսական հարցաշար", fontname="arm", fontsize=11)
    page.insert_text((40, 100), "2 հարց", fontname="arm", fontsize=11)

    page.insert_text((40, 140), "1.", fontname="arm", fontsize=11)
    page.insert_text((60, 140), "Առաջին հարցը նկարով է։", fontname="arm", fontsize=11)

    img_bytes = _make_sample_png_bytes()
    page.insert_image(fitz.Rect(60, 150, 220, 250), stream=img_bytes)

    page.insert_text((50, 280), "1.", fontname="arm", fontsize=11)
    page.insert_text((70, 280), "Տարբերակ 1", fontname="arm", fontsize=11)
    page.insert_text((50, 300), "2.", fontname="arm", fontsize=11)
    page.insert_text((70, 300), "Տարբերակ 2", fontname="arm", fontsize=11)
    page.insert_text((50, 320), "Պատ.` 2", fontname="arm", fontsize=11)

    page.insert_text((40, 360), "2.", fontname="arm", fontsize=11)
    page.insert_text((60, 360), "Երկրորդ հարցը երկար է եւ", fontname="arm", fontsize=11)
    page.insert_text((60, 376), "շարունակվում է հաջորդ տողում։", fontname="arm", fontsize=11)
    page.insert_text((50, 400), "1.", fontname="arm", fontsize=11)
    page.insert_text((70, 400), "Առաջին պատասխան", fontname="arm", fontsize=11)
    page.insert_text((50, 420), "2.", fontname="arm", fontsize=11)
    page.insert_text((70, 420), "Երկրորդ պատասխան", fontname="arm", fontsize=11)
    page.insert_text((50, 440), "Պատ.` 1", fontname="arm", fontsize=11)
    page.insert_text((40, 815), "Էջ 1 / 1", fontname="arm", fontsize=10)

    saved = {}

    def writer(data: bytes, ext: str) -> str:
        name = f"data/images/test_{len(saved)}.{ext}"
        saved[name] = data
        return name

    group, orphans = parse_pdf_document(doc, group_id=1, image_writer=writer)
    verify_group_data(group, orphans)

    assert group["questionCount"] == 2
    assert len(group["questions"]) == 2
    q1, q2 = group["questions"]
    assert q1["number"] == 1
    assert len(q1["images"]) == 1
    assert q1["options"] == ["Տարբերակ 1", "Տարբերակ 2"]
    assert q1["correctIndex"] == 1

    assert q2["number"] == 2
    assert q2["images"] == []
    assert "հաջորդ տողում" in q2["text"]
    assert q2["correctIndex"] == 0


def test_parse_cross_page_question():
    doc = fitz.open()
    p1 = doc.new_page(width=595, height=842)
    p1.insert_htmlbox(
        fitz.Rect(40, 30, 550, 160),
        """
        <div style="font-family: sans-serif; font-size: 12px;">
          <div>ԽՈՒՄԲ 2</div>
          <div>1 հարց</div>
          <div>1. Հարց, որը սկսվում է առաջին էջում</div>
          <div>Էջ 1 / 2</div>
        </div>
        """,
    )

    p2 = doc.new_page(width=595, height=842)
    p2.insert_htmlbox(
        fitz.Rect(40, 30, 550, 220),
        """
        <div style="font-family: sans-serif; font-size: 12px;">
          <div>ABC կարգեր · հարցաշար ԽՈՒՄԲ 2</div>
          <div>1. Առաջին տարբերակ</div>
          <div>2. Երկրորդ տարբերակ</div>
          <div>3. Երրորդ տարբերակ</div>
          <div>Պատ.` 3</div>
          <div>Էջ 2 / 2</div>
        </div>
        """,
    )

    group, orphans = parse_pdf_document(doc, group_id=2, image_writer=lambda b, e: f"img.{e}")
    verify_group_data(group, orphans)

    assert group["questionCount"] == 1
    q = group["questions"][0]
    assert q["number"] == 1
    assert len(q["options"]) == 3
    assert q["correctIndex"] == 2


def test_verify_raises_on_orphan_image_or_count_mismatch():
    bad_group = {
        "id": 1,
        "title": "ԽՈՒՄԲ 1",
        "questionCount": 2,
        "questions": [
            {
                "uid": "g1-q1",
                "groupId": 1,
                "number": 1,
                "text": "Q1",
                "images": [],
                "options": ["A", "B"],
                "correctIndex": 0,
            }
        ],
    }
    with pytest.raises(ValueError, match="count"):
        verify_group_data(bad_group, [])

    good_group = {
        "id": 1,
        "title": "ԽՈՒՄԲ 1",
        "questionCount": 1,
        "questions": bad_group["questions"],
    }
    with pytest.raises(ValueError, match="orphan"):
        verify_group_data(good_group, [{"page": 1, "xref": 5}])
