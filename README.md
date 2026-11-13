# ՃՈ Քննական Հարցաշար · Armenian Road Police ABC Exam Study App

Interactive, offline-ready web application for preparing for the Armenian Road Police theoretical driver's license exam (ABC categories).

**Live site:** https://varordakan.com/ (also served via GitHub Pages)

## Features

- **Գլխավոր (Landing Page):** Overview of the platform, live Readiness %, key stats, feature directory with direct navigation, and a step-by-step guide to the official exam format.
- **Ուսուցում (Practice Mode):** Study all **1,050 official questions** across **10 groups** (`1.pdf`–`10.pdf`) with instant green/red feedback, **Exam Readiness %** weighted by official topic rules, **⚡ Խելացի մարզում** (10-question Smart Drill prioritizing mistakes and weak areas), per-group accuracy/progress bars, shuffle mode, keyboard shortcuts (`1`–`5`, `←`/`→`, `Enter`), question-number jump grid, click-to-zoom images, and an expandable **Բացատրություն (Ինչու է ճիշտ)** reasoning tab with clickable road-sign popups.
- **Քննություն (Timed Mock Exam):** Official-style **20-question** mock exam weighted by official rules (**15** Rules/Signs, **2** Law, **2** Malfunctions, **1** First Aid), optional **Color-Perception Pre-Test (`Գունաընկալման թեստ`)**, **30-minute** countdown timer, auto-submit on expiry, `18/20` passing threshold, full answer breakdown with reasoning, and saved exam history.
- **Սխալներ (Mistakes Retry):** Automatically collects wrong or missed questions from Practice and Mock Exams so you can focus on weak spots; answering a saved mistake correctly resolves and removes it from the queue.
- **Նշաններ (Road Signs & Quiz):** Complete catalog of **282 Armenian road signs** across **8 categories** with images and descriptions, searchable by sign code/title/description, direct **"Հարցեր (N)"** practice links per sign, and a **🎯 Նշանների թեստ** flashcard quiz.
- **Գունաընկալում (Color-Blindness / Psychological Tests):** **53 real color-perception & figure plates** (Ishihara / Rabkin style) with instant feedback plus an official 3-question (0-mistakes) check mode.
- **Հուշաթերթ (Cheat Sheet & Regulator Simulator):** Interactive 3-pose traffic regulator simulator, 5-step right-of-way priority ladder, and a quick-reference sheet for all exam speeds, distances, tire/steering limits, license ages, first-aid thresholds, and common traps.
- **Որոնում (Search & Browse):** Full-text search across all questions and options (normalizing Armenian `և` / `եւ`), group and image-only filters, and an answer-reveal toggle.
- **Offline PWA Support:** Installable to Home Screen on iPhone, iPad, Android, and desktop (`manifest.webmanifest` + `sw.js`) for ad-free offline study.
- **Progress Backup:** Persisted automatically in browser `localStorage` (`roadpolice_abc_v1`) with 1-click JSON Export/Import.
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
