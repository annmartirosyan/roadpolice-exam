import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from extract_signs import parse_signs_html


def test_parse_signs_html_extracts_categories_and_signs():
    sample_html = """
    <html><body>
      <div id="accordion">
        <h3>1. ՆԱԽԱԶԳՈՒՇԱՑՆՈՂ ՆՇԱՆՆԵՐ</h3>
        <div style="display:none;">
          <div class="full-length minh150">
            <hr>
            <div class="div128"><img alt="1.1. «Երկաթուղային գծանց»" src = "/images/sign/n1/1_1.png"></div>
            <div>
              <h4>1.1. «Երկաթուղային գծանց»</h4>
              <p>Նշանը տեղադրվում է մինչև վտանգավոր հատվածի սկիզբը։</p>
            </div>
          </div>
          <div class="full-length minh150">
            <div class="div128"><img alt="1.2." src="/images/sign/n1/1_2.png"></div>
            <div>
              <h4>1.2. «Առանց ուղեփակոցի»</h4>
              <p></p>
            </div>
          </div>
        </div>
        <h3>2. ԱՌԱՎԵԼՈՒԹՅԱՆ ՆՇԱՆՆԵՐ</h3>
        <div>
          <div class="full-length minh150">
            <div class="div128"><img src="/images/sign/n2/2_1.png"></div>
            <div>
              <h4>2.1. «Գլխավոր ճանապարհ»</h4>
              <p>Տալիս է առաջնահերթ երթևեկության իրավունք &laquo;ճանապարհին&raquo;։</p>
            </div>
          </div>
        </div>
      </div>
      <!-- End Content -->
      <footer class="footer"><img src="/images/footer.png"><p>Footer text</p></footer>
    </body></html>
    """
    categories = parse_signs_html(sample_html)
    assert len(categories) == 2

    c1, c2 = categories
    assert c1["id"] == 1
    assert c1["title"] == "1. ՆԱԽԱԶԳՈՒՇԱՑՆՈՂ ՆՇԱՆՆԵՐ"
    assert len(c1["signs"]) == 2
    assert c1["signs"][0]["code"] == "1.1"
    assert c1["signs"][0]["title"] == "1.1. «Երկաթուղային գծանց»"
    assert c1["signs"][0]["description"] == "Նշանը տեղադրվում է մինչև վտանգավոր հատվածի սկիզբը։"
    assert c1["signs"][0]["remoteImage"] == "/images/sign/n1/1_1.png"
    assert c1["signs"][1]["description"] == ""

    assert c2["id"] == 2
    assert len(c2["signs"]) == 1
    assert "«ճանապարհին»" in c2["signs"][0]["description"]
