import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from extract_color_tests import parse_agdrive_js_chunk, parse_varord_psycho_html


def test_parse_varord_psycho_html():
    html = """
    <div id="q_1" class="toCenter">
      <p><img src = "/images/hogebanakan/h1.jpg"></p>
      <h3>Ի՞նչ եք տեսնում նկարում։</h3>
      <div class="quiz-answers">
        <input type="button" value="5" data-rs="no">
        <input type="button" value="9" data-rs="ok">
        <input type="button" value="8" data-rs="no">
      </div>
    </div>
    """
    items = parse_varord_psycho_html(html)
    assert len(items) == 1
    assert items[0]["question"] == "Ի՞նչ եք տեսնում նկարում։"
    assert items[0]["options"] == ["5", "9", "8"]
    assert items[0]["correctIndex"] == 1
    assert items[0]["remoteImage"] == "/images/hogebanakan/h1.jpg"


def test_parse_agdrive_js_chunk():
    js = (
        'something=[{id:1,question_am:"Ինչ թիվ է պատկերված նկարում:",'
        'image:"https://i.ibb.co/example/1.png",'
        'options_am:["12","8","6","ոչ մի"],answer:1}],roadSigns:{}'
    )
    items = parse_agdrive_js_chunk(js)
    assert len(items) == 1
    assert items[0]["question"] == "Ինչ թիվ է պատկերված նկարում:"
    assert items[0]["options"] == ["12", "8", "6", "ոչ մի"]
    assert items[0]["correctIndex"] == 1
    assert items[0]["remoteImage"] == "https://i.ibb.co/example/1.png"
