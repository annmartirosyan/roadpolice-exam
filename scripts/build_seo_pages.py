#!/usr/bin/env python3
"""Generate SEO-optimized HTML entry pages for varordakan.com.

Produces:
  - index.html            (Armenian main landing page)
  - qnnutyun/index.html   (Armenian 20-question mock exam)
  - nshanner/index.html   (Armenian 282 road signs, 42 markings, 13 vehicle IDs)
  - gunaenkalum/index.html (Armenian 53 color-blindness / Ishihara plates)
  - orenq-jek/index.html  (Armenian traffic rules, law search, regulator simulator)
  - ru/index.html         (Russian main landing page)
  - en/index.html         (English main landing page)
"""

from __future__ import annotations

import html
import json
from pathlib import Path

BASE_URL = "https://varordakan.com"
ROOT = Path(__file__).resolve().parent.parent

ASSETS = {
    "styles": "styles.css?v=20261113o",
    "questions": "data/questions.js?v=20261113e",
    "questions_i18n": "data/questions_i18n.js?v=20261113k",
    "signs": "data/signs.js?v=20261113e",
    "signs_i18n": "data/signs_i18n.js?v=20261113k",
    "markings": "data/markings.js?v=20261113e",
    "color_tests": "data/color_tests.js?v=20261113k",
    "rules": "data/rules.js?v=20261113e",
    "app_i18n": "app-i18n.js?v=20261113o",
    "app_core": "app-core.js?v=20261113j",
    "app_game": "app-game.js?v=20261113o",
    "app": "app.js?v=20261113o",
}

CHROME_TEXT = {
    "hy": {
        "brand_title": "Varordakan · ՃՈ Քննական Հարցաշար",
        "brand_sub": "1050 հարց · 282 նշան",
        "home": "Գլխավոր",
        "practice": "Ուսուցում",
        "exam": "Քննություն (20)",
        "mistakes": "Սխալներ",
        "signs": "Նշաններ և գծանշում",
        "colortest": "Գունաընկալում",
        "cheatsheet": "Օրենք և հուշաթերթ",
        "game": "🚗 Խաղ",
        "search": "Որոնում",
        "footer": "ՀՀ ՃՈ Տեսական Քննություն · ABC Կարգեր",
        "og_locale": "hy_AM",
        "faq_summary": "❓ Հաճախ տրվող հարցեր (ՀՀ վարորդական քննություն 2026)",
        "footer_links": [
            ("/", "Հարցաշար (ՀԱՅ)"),
            ("/usucum/", "Ուսուցում"),
            ("/qnnutyun/", "Քննություն (20)"),
            ("/skhalner/", "Սխալներ"),
            ("/nshanner/", "Նշաններ"),
            ("/gunaenkalum/", "Գունաընկալում"),
            ("/orenq-jek/", "Օրենք և ՃԵԿ"),
            ("/khagh/", "🚗 Խաղ"),
            ("/voronum/", "Որոնում"),
            ("/ru/", "Русский"),
            ("/en/", "English"),
        ],
    },
    "ru": {
        "brand_title": "Varordakan · ПДД Экзамен Армении",
        "brand_sub": "1050 вопросов · 282 знака",
        "home": "Главная",
        "practice": "Обучение",
        "exam": "Экзамен (20)",
        "mistakes": "Ошибки",
        "signs": "Знаки и разметка",
        "colortest": "Цветовосприятие",
        "cheatsheet": "Законы и шпаргалка",
        "game": "🚗 Игра",
        "search": "Поиск",
        "footer": "Теоретический экзамен Полиции РА · Категории ABC",
        "og_locale": "ru_RU",
        "faq_summary": "❓ Частые вопросы об экзамене ПДД в Армении (2026)",
        "footer_links": [
            ("/", "Армянская версия"),
            ("/qnnutyun/", "Экзамен (20)"),
            ("/nshanner/", "Дорожные знаки"),
            ("/gunaenkalum/", "Цветовосприятие"),
            ("/orenq-jek/", "ПДД и законы"),
            ("/khagh/", "🚗 Игра"),
            ("/ru/", "Русский"),
            ("/en/", "English"),
        ],
    },
    "en": {
        "brand_title": "Varordakan · Armenia Driving Exam",
        "brand_sub": "1,050 questions · 282 signs",
        "home": "Home",
        "practice": "Practice",
        "exam": "Mock Exam (20)",
        "mistakes": "Mistakes",
        "signs": "Signs & Markings",
        "colortest": "Color Test",
        "cheatsheet": "Rules & Guide",
        "game": "🚗 Drive Game",
        "search": "Search",
        "footer": "Armenia Road Police Theory Exam · ABC Categories",
        "og_locale": "en_US",
        "faq_summary": "❓ Frequently Asked Questions (Armenia Driving Exam 2026)",
        "footer_links": [
            ("/", "Armenian Version"),
            ("/qnnutyun/", "Mock Exam (20)"),
            ("/nshanner/", "Road Signs"),
            ("/gunaenkalum/", "Color Test"),
            ("/orenq-jek/", "Traffic Rules"),
            ("/khagh/", "🚗 Drive Game"),
            ("/ru/", "Русский"),
            ("/en/", "English"),
        ],
    },
}

PAGES = [
    {
        "out": "index.html",
        "path": "/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "home",
        "hreflang_group": True,
        "title": "Varordakan · Վարորդական թեստեր և ՃՈ քննական հարցաշար 2026 (ABC)",
        "description": "ՀՀ Ճանապարհային ոստիկանության վարորդական տեսական քննության պաշտոնական 1050 հարցերը բացատրություններով, 20-հարցանոց օնլայն քննություն, 282 ճանապարհային նշան և 53 գունաընկալման թեստ։ Անվճար, հայերեն, ռուսերեն և անգլերեն։",
        "keywords": "վարորդական թեստեր, ՃՈ քննական հարցաշար, վարորդական իրավունք 2026, ավտոդպրոց թեստեր, varordakan qnnutyun, ABC հարցաշար, varordakan.com",
        "h1": "ՀՀ ՃՈ Վարորդական տեսական քննության հարցաշար (ABC · 2026)",
        "lead": "Պատրաստվեք ՀՀ Ճանապարհային ոստիկանության տեսական քննությանը հասկանալով, ոչ թե անգիր անելով։ Բոլոր 1050 պաշտոնական հարցերը 10 խմբում՝ մանրամասն բացատրություններով, 282 ճանապարհային նշանով, գծանշումներով և 53 գունաընկալման թեստով։",
        "bullets": [
            "1050 պաշտոնական ABC հարց՝ ըստ 1–10 խմբերի, պարզ բացատրություններով և ՃԵԿ կետերի հղումներով",
            "Իրական 20-հարցանոց փորձնական քննություն (30 րոպե, անցողիկ շեմ՝ 18/20, 15+2+2+1 բաշխում)",
            "282 ճանապարհային նշան, 42 գծանշում (1.1–2.7), 13 ճանաչման նշան և գիտելիքի վիկտորինա",
            "53 գունաընկալման աղյուսակ և կարգավորողի ազդանշանների ինտերակտիվ մարզիչ",
        ],
        "faqs": [
            (
                "Քանի՞ հարց կա ՀՀ վարորդական տեսական քննության հարցաշարում։",
                "Պաշտոնական ABC տեսական քննության հարցաշարը ներառում է 1050 հարց՝ բաժանված 10 խմբի (յուրաքանչյուրում 105 հարց)։ Varordakan.com կայքում առկա են բոլոր 1050 հարցերը՝ հայերեն, ռուսերեն և անգլերեն բացատրություններով։",
            ),
            (
                "Ինչպե՞ս է անցկացվում իրական ՃՈ տեսական քննությունը։",
                "Քննությունը սկսվում է գունաընկալման 3 հոգեբանական հարցով (0 սխալ)։ Ապա տրվում է 20 հարց՝ 30 րոպեում (15 իրավիճակ/նշան + 2 օրենք/ՃԵԿ + 2 անսարքություն + 1 առաջին բուժօգնություն)։ Անցնելու համար անհրաժեշտ է առնվազն 18 ճիշտ պատասխան։",
            ),
            (
                "Արդյո՞ք կայքը անվճար է և աշխատում է առանց ինտերնետի։",
                "Այո, Varordakan.com-ը 100% անվճար է, առանց գրանցման և առաջին բացումից հետո աշխատում է նաև օֆլայն՝ հեռախոսի և համակարգչի վրա։",
            ),
        ],
    },
    {
        "out": "usucum/index.html",
        "path": "/usucum/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "practice",
        "hreflang_group": False,
        "title": "Ուսուցում · 1050 ՃՈ հարցեր բացատրություններով | Varordakan",
        "description": "Սովորեք ՀՀ ՃՈ վարորդական տեսական քննության բոլոր 1050 հարցերը 1–10 խմբերով՝ մանրամասն հայերեն բացատրություններով, ՃԵԿ կետերով և խելացի պարապմունքով։",
        "keywords": "վարորդական թեստեր ուսուցում, ճո 1050 հարցեր, վարորդական հարցաշար խումբ 1 10, բացատրություններ",
        "h1": "Ուսուցում · 1050 քննական հարցեր ըստ խմբերի (1–10)",
        "lead": "Անցեք ՀՀ ՃՈ պաշտոնական 1050 հարցերը խմբ առ խումբ՝ յուրաքանչյուր պատասխանի մանրամասն բացատրությամբ, նշանների հղումներով և 10-հարցանոց խելացի պարապմունքով։",
        "bullets": [
            "10 խումբ (յուրաքանչյուրում 105 հարց)՝ հաջորդական կամ խառնված ռեժիմով",
            "Երկլեզու հուշումներ (ՀԱՅ / РУС / ENG) և պահված հարցերի (★) ցանկ",
            "Կապված ՃԵԿ կետերի և ճանապարհային նշանների ակնթարթային բացում",
        ],
        "faqs": [
            (
                "Ինչպե՞ս են բաժանված 1050 հարցերը 1–10 խմբերում։",
                "1–8 խմբերից իրական քննությանը ընտրվում է 15 հարց, 9-րդ խմբից (օրենք/ՃԵԿ)՝ 2 հարց, իսկ 10-րդ խմբից՝ 2 անսարքության և 1 առաջին բուժօգնության հարց։",
            ),
        ],
    },
    {
        "out": "qnnutyun/index.html",
        "path": "/qnnutyun/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "exam",
        "hreflang_group": False,
        "title": "Վարորդական օնլայն քննություն (20 հարց · 30 րոպե) | Varordakan",
        "description": "Անցեք ՀՀ ՃՈ 20-հարցանոց օնլայն փորձնական քննություն 30 րոպե ժամանակաչափով՝ պաշտոնական 15+2+2+1 բաշխմամբ և գունաընկալման նախնական ստուգմամբ։",
        "keywords": "վարորդական օնլայն քննություն, ճո փորձնական քննություն, 20 հարց վարորդական թեստ, varordakan qnnutyun online",
        "h1": "Վարորդական օնլայն փորձնական քննություն (20 հարց · 30 րոպե)",
        "lead": "Ստուգեք Ձեր պատրաստվածությունը ՀՀ ՃՈ պաշտոնական քննության ձևաչափով՝ 3 գունաընկալման աղյուսակից և 20 թեստային հարցից բաղկացած քննությամբ։",
        "bullets": [
            "Պաշտոնական 15+2+2+1 հարցերի բաշխում (խումբ 1–8, 9, 10)",
            "30 րոպե հետհաշվարկ և 18/20 անցողիկ շեմի ավտոմատ գնահատում",
            "Արդյունքների մանրամասն վերլուծություն՝ յուրաքանչյուր սխալի բացատրությամբ",
        ],
        "faqs": [
            (
                "Քանի՞ սխալ կարելի է անել վարորդական տեսական քննության ժամանակ։",
                "20 հարցանոց հիմնական փուլում թույլատրվում է առավելագույնը 2 սխալ (անցողիկ շեմը՝ 18 ճիշտ պատասխան)։ Նախորդող 3 գունաընկալման հարցերում սխալ չի թույլատրվում։",
            ),
            (
                "Որքա՞ն ժամանակ է տրվում քննության համար։",
                "Տեսական քննության համար տրվում է 30 րոպե։ Օնլայն մարզիչը ավտոմատ կերպով հաշվում է ժամանակը և պահպանում Ձեր վերջին 50 քննությունների պատմությունը։",
            ),
        ],
    },
    {
        "out": "skhalner/index.html",
        "path": "/skhalner/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "mistakes",
        "hreflang_group": False,
        "title": "Սխալների ուղղում և կրկնություն | Varordakan",
        "description": "Հավաքագրված սխալ պատասխանների մարզիչ՝ 2 անգամ անընդմեջ ճիշտ պատասխանելու մեխանիզմով, որպեսզի ոչ մի բարդ հարց չմոռանաք։",
        "keywords": "վարորդական սխալների ուղղում, ճո բարդ հարցեր, կրկնություն վարորդական թեստ",
        "h1": "Սխալների ուղղում և կրկնություն",
        "lead": "Ուսուցման ընթացքում կամ քննություններում սխալված հարցերը ավտոմատ կուտակվում են այստեղ։ Հարցը մաքրվում է ցանկից միայն 2 անգամ անընդմեջ ճիշտ պատասխանելուց հետո։",
        "bullets": [
            "Սխալների ավտոմատ հաշվառում ուսուցումից և փորձնական քննությունից",
            "2 անընդմեջ ճիշտ պատասխանի կանոն՝ գիտելիքի իրական ամրապնդման համար",
            "Մանրամասն բացատրություն յուրաքանչյուր սխալված հարցի տակ",
        ],
        "faqs": [
            (
                "Ինչու՞ է անհրաժեշտ 2 անգամ անընդմեջ ճիշտ պատասխանել։",
                "Պատահական գուշակած պատասխանը բացառելու համար հարցը դուրս է գալիս սխալների ցանկից միայն երկու հաջորդական ճիշտ լուծումից հետո։",
            ),
        ],
    },
    {
        "out": "nshanner/index.html",
        "path": "/nshanner/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "signs",
        "hreflang_group": False,
        "title": "Ճանապարհային նշաններ և գծանշումներ (282 նշան + 42 գծանշում) | Varordakan",
        "description": "ՀՀ ճանապարհային երթևեկության բոլոր 282 նշանները (8 խումբ), 42 ճանապարհային գծանշումները (1.1–2.7), 13 ճանաչման նշանները և նշանների վիկտորինա։",
        "keywords": "ճանապարհային նշաններ, ճանապարհային գծանշումներ, նշանների թեստ, ճո նշաններ հայերեն",
        "h1": "ՀՀ Ճանապարհային նշաններ, գծանշումներ և ճանաչման նշաններ",
        "lead": "Ամբողջական տեղեկատու՝ 282 ճանապարհային նշաններ ըստ խմբերի, 42 հորիզոնական ու ուղղաձիգ գծանշումներ (1.1–2.7), 13 տրանսպորտային միջոցի ճանաչման նշան և ինտերակտիվ վիկտորինա։",
        "bullets": [
            "Նախազգուշացնող, առավելության, արգելող, թելադրող, տեղեկատվական և սպասարկման նշաններ",
            "Կապված քննական հարցերի քանակը և արագ անցումը տվյալ նշանի հարցերին",
            "10-հարցանոց «Գուշակիր նշանը» վիկտորինա հայերեն, ռուսերեն և անգլերեն",
        ],
        "faqs": [
            (
                "Քանի՞ խումբ ճանապարհային նշան կա ՀՀ ՃԵԿ-ում։",
                "Ճանապարհային նշանները բաժանված են 8 խմբի (նախազգուշացնող, առավելության, արգելող, թելադրող, հատուկ թելադրանքների, տեղեկատվության, սպասարկման և լրացուցիչ տեղեկատվության ցուցանակներ)՝ ընդամենը 282 նշան։",
            ),
            (
                "Ինչո՞ւ են գծանշումները նույնպես ներառված։",
                "Քննական հարցերի զգալի մասը վերաբերում է 1.1–1.26 հորիզոնական և 2.1–2.7 ուղղաձիգ գծանշումներին, որոնք կարող եք ուսումնասիրել առանձին ենթաբաժնում։",
            ),
        ],
    },
    {
        "out": "gunaenkalum/index.html",
        "path": "/gunaenkalum/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "colortest",
        "hreflang_group": False,
        "title": "Գունաընկալման թեստ վարորդական քննության համար (53 աղյուսակ) | Varordakan",
        "description": "ՀՀ ՃՈ վարորդական քննության հոգեբանական և գունաընկալման 53 պաշտոնական աղյուսակներ (Իշիհարա / Ռաբկին) և 3-հարցանոց քննական ստուգում։",
        "keywords": "գունաընկալման թեստ, վարորդական հոգեբանական թեստ, դալթոնիզմի թեստ վարորդական",
        "h1": "Գունաընկալման և հոգեբանական թեստեր (53 պաշտոնական աղյուսակ)",
        "lead": "Վարժվեք Իշիհարայի և Ռաբկինի բոլոր 53 աղյուսակներով կամ անցեք իրական ՃՈ քննության 3-հարցանոց նախնական ստուգումը՝ 0 սխալով։",
        "bullets": [
            "Բոլոր 53 աղյուսակները՝ հայերեն, ռուսերեն և անգլերեն հարցերով ու պատասխաններով",
            "Արագ 3-հարցանոց քննական ստուգում (պահանջվում է 3/3 ճիշտ պատասխան՝ ըստ Կառավարության N 385-Ն որոշման)",
            "Պատկերների խոշորացման և ակնթարթային ստուգման հնարավորություն",
        ],
        "faqs": [
            (
                "Պարտադի՞ր է արդյոք գունաընկալման փուլը ՃՈ քննության ժամանակ։",
                "Այո, ըստ ՀՀ Կառավարության N 385-Ն որոշման՝ հիմնական 20 հարցից առաջ համակարգիչը տալիս է 3 հոգեբանական/գունաընկալման հարց, և բոլոր 3-ին պետք է պատասխանել ճիշտ։",
            ),
        ],
    },
    {
        "out": "orenq-jek/index.html",
        "path": "/orenq-jek/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "cheatsheet",
        "hreflang_group": False,
        "title": "ՀՀ ՃԵԿ, կարգավորողի ազդանշաններ և քննական հուշաթերթ | Varordakan",
        "description": "Կարգավորողի ազդանշանների ինտերակտիվ մարզիչ, խաչմերուկների առաջնահերթության սանդուղք, հիմնական քննական թվեր և որոնելի ՀՀ ՃԵԿ ու օրենք։",
        "keywords": "ՃԵԿ կանոններ, կարգավորողի ազդանշաններ, ճանապարհային երթևեկության օրենք, վարորդական հուշաթերթ",
        "h1": "ՀՀ ՃԵԿ, Օրենք, Կարգավորողի մարզիչ և քննական հուշաթերթ",
        "lead": "Որոնեք ՀՀ Ճանապարհային երթևեկության կանոնների (ՃԵԿ), օրենքի և անսարքությունների ցանկի ցանկացած կետ կամ կրկնեք կարգավորողի բոլոր 3 դիրքերը ինտերակտիվ մարզչով։",
        "bullets": [
            "Կարգավորողի ազդանշանների ինտերակտիվ սիմուլյատոր (ձախից, կրծքից, աջից, թիկունքից)",
            "Երթևեկության կարգավորման գերակայության սանդուղք և բոլոր քննական թվերը (արագություն, հեռավորություն, անվադողեր)",
            "Որոնելի պաշտոնական ՃԵԿ (204 կետ), Օրենք (151 հոդված) և N 2 հավելված (46 կետ)",
        ],
        "faqs": [
            (
                "Ինչպե՞ս արագ հիշել կարգավորողի ազդանշանները։",
                "Երբ աջ ձեռքը պարզված է առաջ՝ ձախից կարելի է գնալ բոլոր ուղղություններով, կրծքից՝ միայն աջ, աջից և թիկունքից՝ արգելված է։ Կարգավորողի ինտերակտիվ մարզիչը ցույց է տալիս նաև տրամվայի ուղղությունները։",
            ),
        ],
    },
    {
        "out": "khagh/index.html",
        "path": "/khagh/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "game",
        "hreflang_group": False,
        "title": "Ճանապարհային խաղ · Վարիր և կարդա նշանները | Varordakan",
        "description": "Ինտերակտիվ վարորդական խաղ․ ավտոմեքենան ընթանում է ճանապարհով, իսկ դուք կառավարում եք այն՝ ըստ մոտեցող ՀՀ ճանապարհային նշանների (Ձախ, Ուղիղ, Աջ, Արգելակել)։",
        "keywords": "վարորդական խաղ, ճանապարհային նշանների խաղ, ճո խաղ օնլայն, պդդ խաղ հայերեն",
        "h1": "Ճանապարհային խաղ · Վարիր ավտոմեքենան նշաններով",
        "lead": "Վարժեցրեք արագ կողմնորոշումը իրական ճանապարհային իրավիճակներում․ մեքենան ընթանում է առաջ, իսկ մոտեցող նշանները հուշում են՝ թեքվել ձախ, աջ, շարունակել ուղիղ, թե արգելակել։",
        "bullets": [
            "20 իրական ճանապարհային իրավիճակ ՀՀ ՃԵԿ պաշտոնական նշաններով",
            "Արագ խաղի (8 վրկ) և հանգիստ ուսուցման ռեժիմներ",
            "Կլավիատուրայի (← ↑ → ↓ / Space) և հեռախոսի հարմար կառավարում",
        ],
        "faqs": [
            (
                "Ինչպե՞ս է աշխատում ճանապարհային նշանների խաղը։",
                "Յուրաքանչյուր փուլում մեքենան մոտենում է իրական ճանապարհային նշանի (STOP, զիջեք ճանապարհը, շրջանցում, արգելող կամ թելադրող նշաններ)։ Ընտրեք ճիշտ մանևրը մինչև նշանին հասնելը։",
            ),
        ],
    },
    {
        "out": "voronum/index.html",
        "path": "/voronum/",
        "lang": "hy",
        "route_lang": "hy",
        "route_tab": "search",
        "hreflang_group": False,
        "title": "Հարցաշարի որոնում (1050 հարց) | Varordakan",
        "description": "Արագ որոնում ՀՀ ՃՈ 1050 քննական հարցերի մեջ՝ հայերեն, ռուսերեն կամ անգլերեն բառերով, խմբերով, նկարով և պահված հարցերով։",
        "keywords": "վարորդական հարցերի որոնում, ճո հարցաշար որոնել, պդդ հարցեր որոնում",
        "h1": "Հարցաշարի արագ որոնում (1050 հարց)",
        "lead": "Գտեք ցանկացած քննական հարց ըստ բանալի բառի հայերենով, ռուսերենով կամ անգլերենով, զտեք ըստ խմբի, նկարների առկայության կամ պահված հարցերի։",
        "bullets": [
            "Ակնթարթային որոնում երեք լեզվով՝ հայերեն, ռուսերեն և անգլերեն",
            "Զտում ըստ 1–10 խմբերի, նկարով հարցերի և պահված (★) հարցերի",
            "Ուղիղ անցում գտնված հարցից դեպի ուսուցման ռեժիմ",
        ],
        "faqs": [
            (
                "Կարո՞ղ եմ որոնել նաև ռուսերեն կամ անգլերեն բառերով։",
                "Այո, որոնումը միաժամանակ ստուգում է հայերեն, ռուսերեն և անգլերեն հարցերի և տարբերակների տեքստերը։",
            ),
        ],
    },
    {
        "out": "ru/index.html",
        "path": "/ru/",
        "lang": "ru",
        "route_lang": "ru",
        "route_tab": "home",
        "hreflang_group": True,
        "title": "Varordakan · ПДД Армении 2026: 1050 экзаменационных вопросов и онлайн тест",
        "description": "Бесплатный тренажёр теоретического экзамена по ПДД Армении (Полиция РА, категории ABC) на русском языке: все 1050 официальных вопросов с объяснениями, 282 знака, разметка и 53 таблицы цветовосприятия.",
        "keywords": "ПДД Армении 2026, экзамен ПДД Армения онлайн, билеты ПДД Армения на русском, водительские права Армения, дорожные знаки Армения",
        "h1": "Экзамен ПДД Армении 2026 — все 1050 вопросов на русском языке",
        "lead": "Полный бесплатный курс подготовки к теоретическому экзамену Полиции Республики Армения (категории A, B, C) с переводом и подробными объяснениями каждого вопроса, знаков и таблиц цветовосприятия.",
        "bullets": [
            "Все 1050 официальных билетов в 10 группах с понятными объяснениями на русском языке",
            "Пробный экзамен: 20 вопросов за 30 минут (проходной балл 18/20, схема 15+2+2+1)",
            "282 дорожных знака, 42 вида разметки (1.1–2.7), опознавательные знаки и викторина",
            "53 реальные таблицы цветовосприятия и интерактивный тренажёр регулировщика",
        ],
        "faqs": [
            (
                "Можно ли сдавать теоретический экзамен по ПДД в Армении на русском языке?",
                "Да, на официальном компьютерном экзамене в регистрационно-экзаменационных подразделениях Полиции РА можно выбрать армянский, русский или английский язык. Все 1050 вопросов, объяснений и знаков на Varordakan.com полностью переведены на русский.",
            ),
            (
                "Сколько вопросов и ошибок допускается на экзамене в Армении?",
                "Сначала даются 3 вопроса на цветовосприятие (0 ошибок), затем 20 основных вопросов на 30 минут. Для сдачи нужно минимум 18 правильных ответов.",
            ),
        ],
    },
    {
        "out": "en/index.html",
        "path": "/en/",
        "lang": "en",
        "route_lang": "en",
        "route_tab": "home",
        "hreflang_group": True,
        "title": "Varordakan · Armenia Driving Theory Exam 2026 (1,050 Official ABC Questions)",
        "description": "Free English preparation for the Armenia Road Police driving theory exam (ABC categories): all 1,050 official questions with explanations, 20-question mock exam, 282 road signs, and 53 color-blindness plates.",
        "keywords": "Armenia driving theory test, Armenia road police exam questions, Armenia driving license test English, Armenia traffic signs, Yerevan driving test",
        "h1": "Armenia Driving Theory Exam 2026 — All 1,050 Official Questions in English",
        "lead": "Prepare for the Armenia Road Police theoretical driving exam (ABC categories) by understanding every rule. Includes all 1,050 official questions, English explanations, 282 road signs, and 53 color-perception plates.",
        "bullets": [
            "All 1,050 official ABC exam questions across 10 groups with clear English explanations",
            "Realistic 20-question timed mock exam (30 minutes, 18/20 pass mark, 15+2+2+1 split)",
            "282 road signs, 42 road markings (1.1–2.7), 13 vehicle ID signs, and sign quiz",
            "53 official color-blindness plates and interactive traffic regulator simulator",
        ],
        "faqs": [
            (
                "Can I take the Armenia driving theory test in English?",
                "Yes. The Armenia Road Police theoretical exam is available in Armenian, Russian, and English. Varordakan.com provides all 1,050 official questions, explanations, signs, and color plates in English.",
            ),
            (
                "What is the passing score for the Armenia Road Police theory exam?",
                "You must first pass 3 color-perception questions with 0 mistakes, followed by 20 theory questions in 30 minutes. At least 18 out of 20 correct answers are required to pass.",
            ),
        ],
    },
]


def render_page(page: dict) -> str:
    lang = page["lang"]
    ch = CHROME_TEXT[lang]
    canonical = f"{BASE_URL}{page['path']}"
    base_tag = '  <base href="/" />\n'

    route_meta = ""
    if page["route_lang"]:
        route_meta += f'  <meta name="varordakan-route-lang" content="{html.escape(page["route_lang"])}" />\n'
    if page["route_tab"]:
        route_meta += f'  <meta name="varordakan-route-tab" content="{html.escape(page["route_tab"])}" />\n'

    hreflang_tags = ""
    if page["hreflang_group"]:
        hreflang_tags = (
            f'  <link rel="alternate" hreflang="hy" href="{BASE_URL}/" />\n'
            f'  <link rel="alternate" hreflang="ru" href="{BASE_URL}/ru/" />\n'
            f'  <link rel="alternate" hreflang="en" href="{BASE_URL}/en/" />\n'
            f'  <link rel="alternate" hreflang="x-default" href="{BASE_URL}/" />\n'
        )

    faq_entities = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        }
        for q, a in page["faqs"]
    ]

    ld_graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "name": "Varordakan",
                "url": canonical,
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web, iOS, Android",
                "inLanguage": ["hy", "ru", "en"],
                "isAccessibleForFree": True,
                "image": f"{BASE_URL}/og-image.png",
                "description": page["description"],
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "AMD"},
            },
            {
                "@type": "FAQPage",
                "mainEntity": faq_entities,
            },
        ],
    }
    ld_json = json.dumps(ld_graph, ensure_ascii=False, indent=2).replace("</", "<\\/")

    bullets_html = "\n".join(f"          <li>{html.escape(b)}</li>" for b in page["bullets"])
    faqs_html = "\n".join(
        f"""        <div class="seo-faq-item">
          <h3>{html.escape(q)}</h3>
          <p>{html.escape(a)}</p>
        </div>"""
        for q, a in page["faqs"]
    )

    footer_links_html = "\n".join(
        f'      <a href="{html.escape(href)}">{html.escape(lbl)}</a>' for href, lbl in ch["footer_links"]
    )
    return f"""<!DOCTYPE html>
<html lang="{html.escape(lang)}">
<head>
  <meta charset="UTF-8" />
{base_tag}  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://abacus.jasoncameron.dev; object-src 'none'; base-uri 'self'; form-action 'self';"
  />
  <meta name="theme-color" content="#1d4ed8" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <title>{html.escape(page["title"])}</title>
  <meta name="description" content="{html.escape(page["description"])}" />
  <meta name="keywords" content="{html.escape(page["keywords"])}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="{html.escape(canonical)}" />
{hreflang_tags}{route_meta}  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Varordakan" />
  <meta property="og:locale" content="{html.escape(ch["og_locale"])}" />
  <meta property="og:title" content="{html.escape(page["title"])}" />
  <meta property="og:description" content="{html.escape(page["description"])}" />
  <meta property="og:url" content="{html.escape(canonical)}" />
  <meta property="og:image" content="{BASE_URL}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{html.escape(page["title"])}" />
  <meta name="twitter:description" content="{html.escape(page["description"])}" />
  <meta name="twitter:image" content="{BASE_URL}/og-image.png" />
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="icon" href="logo-192.png" type="image/png" />
  <link rel="apple-touch-icon" href="logo-512.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{ASSETS["styles"]}" />
  <script type="application/ld+json">
{ld_json}
  </script>
</head>
<body>
  <header class="app-header">
    <div class="header-inner">
      <button type="button" class="brand brand-btn" id="btn-brand-home" title="Varordakan">
        <img class="brand-logo" src="logo-192.png" alt="Varordakan logo" width="42" height="42" />
        <div>
          <span class="brand-title" id="brand-title-text">{html.escape(ch["brand_title"])}</span>
          <p class="brand-subtitle" id="overall-progress-text">{html.escape(ch["brand_sub"])}</p>
        </div>
      </button>

      <div class="header-tools">
        <button type="button" class="streak-pill" id="btn-daily-goal" title="Daily Goal">
          🔥 <span id="streak-pill-text">0/20</span>
        </button>

        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" class="lang-btn" data-lang="hy">ՀԱՅ</button>
          <button type="button" class="lang-btn" data-lang="ru">РУС</button>
          <button type="button" class="lang-btn" data-lang="en">ENG</button>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" id="btn-open-note" title="Sticky Note">
          📝
        </button>
      </div>
    </div>

    <nav class="tab-nav" aria-label="Sections">
      <button type="button" class="tab-btn" data-tab="home">{html.escape(ch["home"])}</button>
      <button type="button" class="tab-btn" data-tab="practice">{html.escape(ch["practice"])}</button>
      <button type="button" class="tab-btn" data-tab="exam">{html.escape(ch["exam"])}</button>
      <button type="button" class="tab-btn" data-tab="mistakes">
        {html.escape(ch["mistakes"])} <span class="badge" id="mistakes-badge">0</span>
      </button>
      <button type="button" class="tab-btn" data-tab="signs">{html.escape(ch["signs"])}</button>
      <button type="button" class="tab-btn" data-tab="colortest">{html.escape(ch["colortest"])}</button>
      <button type="button" class="tab-btn" data-tab="cheatsheet">{html.escape(ch["cheatsheet"])}</button>
      <button type="button" class="tab-btn" data-tab="game">{html.escape(ch["game"])}</button>
      <button type="button" class="tab-btn" data-tab="search">{html.escape(ch["search"])}</button>
    </nav>
  </header>

  <main class="app-main" id="app-root">
    <article class="card ssr-seo-card">
      <h1 class="hero-title" style="margin-top: 0;">{html.escape(page["h1"])}</h1>
      <p class="hero-subtitle">{html.escape(page["lead"])}</p>
      <ul class="cheat-list">
{bullets_html}
      </ul>
    </article>
  </main>

  <section class="app-main seo-faq-section" id="seo-faq-section" aria-label="FAQ">
    <details class="exam-guide-details">
      <summary class="exam-guide-summary" id="seo-faq-summary">{html.escape(ch["faq_summary"])}</summary>
      <div class="exam-guide-body seo-faq-body" id="seo-faq-body">
{faqs_html}
      </div>
    </details>
  </section>

  <footer class="app-footer">
    <div class="footer-inner">
      <span id="footer-brand-text">{html.escape(ch["footer"])}</span>
      <span class="visit-stats" id="visit-stats" hidden>
        <strong id="stat-visitors">—</strong> · <strong id="stat-opens">—</strong>
      </span>
    </div>
    <nav class="footer-seo-links" id="footer-seo-links" aria-label="Pages">
{footer_links_html}
    </nav>
  </footer>

  <!-- Floating Draggable Yellow Sticky Note -->
  <aside class="sticky-note" id="sticky-note" hidden aria-label="My Notes">
    <div class="sticky-note-header" id="sticky-note-drag">
      <span class="sticky-note-title">📌</span>
      <div class="sticky-note-actions">
        <button type="button" class="sticky-icon-btn" id="sticky-btn-dl" aria-label="Download">⬇️</button>
        <button type="button" class="sticky-icon-btn" id="sticky-btn-min" aria-label="Minimize">―</button>
        <button type="button" class="sticky-icon-btn" id="sticky-btn-del" aria-label="Delete">🗑️</button>
      </div>
    </div>
    <div class="sticky-note-body" id="sticky-note-body">
      <textarea class="sticky-note-textarea" id="sticky-note-text" rows="5"></textarea>
    </div>
  </aside>

  <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true">
    <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close">✕</button>
    <img class="lightbox-img" id="lightbox-img" alt="Traffic situation" />
  </div>

  <div class="modal-backdrop" id="sign-modal" hidden role="dialog" aria-modal="true" aria-labelledby="sign-modal-title">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title" id="sign-modal-title">Sign</h3>
        <button type="button" class="btn btn-sm btn-ghost" id="sign-modal-close" aria-label="Close">✕</button>
      </div>
      <div class="modal-body" id="sign-modal-body"></div>
    </div>
  </div>

  <div class="toast" id="toast" hidden role="status" aria-live="polite"></div>

  <script src="{ASSETS["questions"]}"></script>
  <script src="{ASSETS["questions_i18n"]}"></script>
  <script src="{ASSETS["signs"]}"></script>
  <script src="{ASSETS["signs_i18n"]}"></script>
  <script src="{ASSETS["markings"]}"></script>
  <script src="{ASSETS["color_tests"]}"></script>
  <script src="{ASSETS["rules"]}"></script>
  <script src="{ASSETS["app_i18n"]}"></script>
  <script src="{ASSETS["app_core"]}"></script>
  <script src="{ASSETS["app_game"]}"></script>
  <script src="{ASSETS["app"]}"></script>
</body>
</html>
"""


def main() -> None:
    for page in PAGES:
        out_path = ROOT / page["out"]
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(render_page(page), encoding="utf-8")
        print(f"Generated {page['out']}")


if __name__ == "__main__":
    main()
