# ՃՈ Քննական Հարցաշար · Armenian Road Police ABC Exam Study App

Interactive, offline-ready web application for preparing for the Armenian Road Police theoretical driver's license exam (ABC categories).

**Live site:** https://annmartirosyan.github.io/roadpolice-exam/

## Features

- **Ուսուցում (Practice Mode):** Study all **1,050 official questions** across **10 groups** (`1.pdf`–`10.pdf`) with instant green/red feedback, per-group accuracy and progress bars, shuffle mode, keyboard shortcuts (`1`–`5`, `←`/`→`, `Enter`), question-number jump grid, click-to-zoom images, and an expandable **Բացատրություն (Ինչու է ճիշտ)** reasoning tab on every question.
- **Քննություն (Timed Mock Exam):** Official-style **20-question** mock exam (2 random questions from each of the 10 groups) with a **30-minute** countdown timer, auto-submit on expiry, `18/20` passing threshold, full answer breakdown with reasoning, and saved exam history.
- **Սխալներ (Mistakes Retry):** Automatically collects wrong or missed questions from Practice and Mock Exams so you can focus on weak spots; answering a saved mistake correctly resolves and removes it from the queue.
- **Նշաններ (Road Signs):** Complete catalog of **282 Armenian road signs** across **8 categories** with images and descriptions, searchable by sign code (e.g. `1.1`, `3.24`), title, or description.
- **Որոնում (Search & Browse):** Full-text search across all questions and options (normalizing Armenian `և` / `եւ`), group and image-only filters, and an answer-reveal toggle.
- **Progress Backup:** Persisted automatically in browser `localStorage` (`roadpolice_abc_v1`) with 1-click JSON Export/Import.
- **Visitor Tracking:** Counts unique visitors and per-session page opens in the footer via [Abacus](https://abacus.jasoncameron.dev) when served from a live domain (automatically skipped on `localhost` / `file://`).
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
