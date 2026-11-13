# ՃՈ Քննական Հարցաշար · Armenian Road Police ABC Exam Study App

Interactive, offline-ready web application for preparing for the Armenian Road Police theoretical driver's license exam (ABC categories).

**Live site:** https://varordakan.com/ (also served via GitHub Pages)

## Features

- **Գլխավոր (Landing Page):** Streamlined overview with animated road scene, live Readiness %, daily study goal & streak, and section shortcuts.
- **Ուսուցում (Practice Mode):** Study all **1,050 official questions** in **Armenian (`ՀԱՅ`), Russian (`РУС`), or English (`ENG`)** with optional bilingual Armenian hint, **Bookmarks (`★ Պահված հարցեր`)**, **Exam Readiness %**, **⚡ Խելացի մարզում**, instant green/red feedback, and expandable **Բացատրություն** with clickable sign codes & rule links.
- **Քննություն (Timed Mock Exam):** Official-style **20-question** mock exam weighted by official rules (`15+2+2+1`), optional **Color-Perception Pre-Test**, **30-minute** countdown timer, `18/20` pass threshold, and saved exam history.
- **Սխալներ (Mistakes Retry):** Automatically collects wrong/missed questions and requires **2 consecutive correct answers** (`0/2 → 1/2 → 2/2`) before clearing a question.
- **Նշաններ և գծանշում (Signs, Markings & Vehicle IDs):** **282 Road Signs**, **42 Road Markings (`1.1–1.26`, `2.1–2.7`)**, and **13 Vehicle Identification Signs** in `HY/RU/EN` with linked exam questions and a **🎯 Նշանների թեստ**.
- **Գունաընկալում (Color-Blindness / Psychological Tests):** **53 real color-perception & figure plates** with practice and 3-question (0-mistakes) check modes.
- **Օրենք և հուշաթերթ (Law Reader & Cheat Sheet):** Full searchable **ՃԵԿ (204 points)**, **Road Traffic Safety Law (151 items)**, and **Malfunctions List (46 items)**, plus an interactive 3-pose regulator simulator and exam numbers guide.
- **Floating Yellow Sticky Note (`📌 Իմ նշումները`):** Movable/draggable yellow note across every tab with auto-save, minimize/restore, and delete controls.
- **Daily Goal & Streak (`🔥`):** Tracks daily answered questions (`10/20/30/50`) and consecutive goal days.
- **Որոնում (Search & Browse):** Full-text search across all questions and options (normalizing Armenian `և` / `եւ`), group and image-only filters, and an answer-reveal toggle.
- **Offline PWA Support:** Installable to Home Screen on iPhone, iPad, Android, and desktop (`manifest.webmanifest` + `sw.js`) for ad-free offline study.
- **Progress Persistence:** Saved automatically in browser `localStorage` (`roadpolice_abc_v1`).
- **Visitor Tracking:** Counts unique visitors (`Այցելուներ`, once per browser) and total page opens (`Բացումներ`, every time anyone opens the page, including repeat visits) in the footer via [Abacus](https://abacus.jasoncameron.dev) when served from a live domain (automatically skipped on `localhost` / `file://`).
  - Check unique visitors JSON: `https://abacus.jasoncameron.dev/get/annmartirosyan-roadpolice-exam/unique-visitors`
  - Check page opens JSON: `https://abacus.jasoncameron.dev/get/annmartirosyan-roadpolice-exam/page-opens`

## Data Sources

- **Exam Questions (Groups 1–10):** `https://roadpolice.am/exam/abc/hy/{1..10}.pdf` (1,050 questions, 699 deduplicated images)
- **Road Signs & Descriptions:** `https://www.varord.am/գիտելիքի-բազա/ճանապարհային-նշաններ` (282 signs across 8 categories)

## Running Locally

Because the generated datasets (`data/questions.js` and `data/signs.js`) are bundled as standard scripts, you can either:

1. **Open directly in a browser:**
   ```bash
   open index.html
   ```
2. **Or serve over HTTP:**
   ```bash
   python3 -m http.server 8080
   ```
   Then visit `http://localhost:8080`.

## Updating the Extracted Data

Set up the Python virtual environment once:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Re-download and regenerate the datasets:

```bash
# Re-extract all 10 exam PDFs (pass --refresh to re-download cached PDFs)
.venv/bin/python scripts/extract_pdfs.py --refresh

# Re-extract all road signs & images (pass --refresh to re-download HTML/images)
.venv/bin/python scripts/extract_signs.py --refresh
```

## Running Tests

```bash
# Python parser & verification tests
.venv/bin/pytest tests/ -v

# JavaScript core logic tests (requires Node.js)
node --test tests/app-core.test.mjs
```

## Project Structure

```text
├── index.html                        # Application shell & 5-tab navigation
├── styles.css                        # Responsive UI styling
├── app-core.js                       # State, storage, Armenian normalization, exam & filter logic
├── app.js                            # UI rendering & event handlers
├── data/
│   ├── questions.json / questions.js # 1,050 extracted exam questions
│   ├── signs.json / signs.js         # 282 extracted road signs
│   ├── images/                       # Question diagrams
│   └── signs/                        # Road sign icons
├── scripts/
│   ├── extract_pdfs.py               # roadpolice.am PDF downloader, parser & verifier
│   └── extract_signs.py              # varord.am road signs scraper
├── tests/
│   ├── app-core.test.mjs
│   ├── test_extract_pdfs.py
│   └── test_extract_signs.py
└── .github/workflows/deploy-pages.yml
```
