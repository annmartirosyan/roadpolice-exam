# Road Police ABC Exam Study Website — Design Document

**Date:** 2026-11-13  
**Project Root:** `/Users/amartirosyan/roadpolice-exam`  
**Status:** Draft (pending builder check & user approval)

---

## 1. Intent & Why

The Armenian Road Police publishes the official ABC category theoretical driver's license exam as 10 separate multi-page PDFs (`1.pdf`–`10.pdf`), each containing ~150 multiple-choice questions with embedded road-sign/traffic-situation images and inline answer keys. Studying from static PDFs is slow, spoils answers at a glance, offers no exam simulation, and makes tracking weak areas difficult.

This project turns all 10 official PDFs into an interactive, Armenian-language study web application with instant-feedback practice, timed mock exams, automatic mistake tracking for retry, and full-text search.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Extract 100% of questions, numbered options, correct answers (`Պատ.`), and embedded images across all 10 official PDFs (`https://roadpolice.am/exam/abc/hy/1.pdf` through `10.pdf`), accurately associating every image with its question.
- Provide four core study workflows in a single responsive web app:
  1. **Ուսուցում (Practice):** Study by group (1–10) with instant green/red feedback, progress tracking, question-grid navigation, and keyboard shortcuts.
  2. **Քննություն (Timed Mock Exam):** 20-question timed simulation (2 random questions per group, 30-minute timer, pass threshold 18/20) with end-of-exam review.
  3. **Սխալներ (Mistakes Retry):** Automatic queue of questions answered incorrectly across Practice and Mock Exam, allowing focused re-practice until answered correctly.
  4. **Որոնում (Search & Browse):** Search across all ~1,470 questions, filter by group or image presence, and toggle answers for rapid review.
- Persist progress, mistakes, and exam history in browser `localStorage` with JSON export/import backup.

### Non-Goals
- User authentication, accounts, or server-side database storage.
- Community comments, crowdsourced explanations, or editing official questions.
- Driving school administration tools or license categories other than ABC.

### Anti-Goals
- **Image-question mismatch:** Assigning a diagram to the wrong question renders visual questions unusable. Extraction must verify image-to-question mapping structurally and report any anomalies.
- **Broken `file://` opening:** Requiring a backend or crashing on CORS if opened locally as a static file.
- **Unicode search bugs:** Failing to match Armenian ligature `և` against `եւ` when searching.

---

## 3. Constraints

- **Source format:** `1.pdf`–`10.pdf` are Chromium/Skia-generated PDFs (~52 pages each, ~126+ embedded images per PDF). Question text and images must be extracted programmatically using positional bounding boxes, not naive text-only regexes.
- **No global PDF packages preinstalled:** Global `python3` lacks `pypdf`/`pdfplumber`/`pymupdf` and system `poppler`. The extraction script will run inside a local project `.venv` using `pymupdf` (`fitz`).
- **Offline / zero-runtime-dependency frontend:** Must run purely in a browser without a Node.js server or build pipeline.

---

## 4. Approaches Considered

1. **Static Web App + Python PDF Extractor Pipeline (Selected)**
   - Python script in `.venv` downloads `1.pdf`–`10.pdf`, extracts structured JSON/JS data and image files, and runs automated integrity checks. Frontend is plain HTML/CSS/JS with `localStorage`.
   - *Trade-offs:* Zero runtime dependencies, instant load, easy static hosting (GitHub Pages/Netlify/local), works offline. Progress lives in the browser (mitigated by JSON export/import).
2. **React / Vite SPA + Python Extractor**
   - Same extraction pipeline paired with a bundled React app.
   - *Trade-offs:* Adds `npm` build complexity without meaningful study-feature gains.
3. **Python FastAPI Backend + SQLite**
   - Serves questions and stores progress in SQLite.
   - *Trade-offs:* Requires running a Python server at all times and prevents static hosting.

---

## 5. Architecture & Key Decisions

### 5.1 Project Structure
```text
/Users/amartirosyan/roadpolice-exam/
├── scripts/
│   └── extract_pdfs.py        # Downloads, parses, verifies, and emits data
├── raw_pdfs/                  # Cached 1.pdf..10.pdf (gitignored if git used)
├── data/
│   ├── images/                # Deduplicated extracted images (hash-named)
│   ├── questions.json         # Canonical dataset for tooling/inspection
│   └── questions.js           # `window.EXAM_DATA = ...` for file:// compatibility
├── index.html
├── styles.css
├── app.js
└── requirements.txt           # pymupdf
```

### 5.2 PDF Extraction & Verification (`scripts/extract_pdfs.py`)
- **Download & Cache:** Fetches `https://roadpolice.am/exam/abc/hy/{1..10}.pdf` into `raw_pdfs/` (skips existing unless `--refresh` is passed).
- **Positional Parsing:** Uses `pymupdf` (`fitz`) page by page, collecting:
  - Text blocks/lines with bounding boxes `(x0, y0, x1, y1)`, filtering out running headers (`ABC կարգեր · հարցաշար`, `ԽՈՒՄԲ N`) and page footers (`Էջ X / Y`).
  - Embedded images (`page.get_images(full=True)` + `page.get_image_rects(xref)`) with bounding boxes `(x0, y0, x1, y1)`.
- **Question Segmentation:** Parses:
  - Group expected total from the page-1 banner (`\d+\s+հարց`).
  - Question start (`^\d+\.\s+`), numbered options (`^\d+\.\s+`), and answer key (`^Պատ\.?\s*`?\s*(\d+)`).
  - Multi-line wrapping for long question stems and option texts.
  - Cross-page questions (if a question begins near the bottom of page `p` and its options/answer continue at the top of page `p+1`).
- **Image Matching:** Associates each image rect on a page with the question whose vertical span brackets or immediately precedes the image (before option `1.` or between question stem and answer). Handles rare multi-image questions if any exist by attaching an ordered `images: [...]` array per question.
- **Image Deduplication & Output:** Deduplicates identical image payloads by SHA-256 content hash into `data/images/<hash>.<ext>` (preserving original JPEG/PNG).
- **Automated Verification Checks:** After parsing each PDF, asserts and logs:
  - Extracted question count matches the header count (`N հարց`) and sequential IDs `1..N` have no gaps.
  - Every question has `>= 2` options and `1 <= correct <= len(options)`.
  - Zero orphan images on any page.
  - Emits both `data/questions.json` and `data/questions.js` (`window.EXAM_DATA = ...`) so `index.html` works directly via `file://` as well as HTTP.

### 5.3 Data Schema (`questions.json` / `EXAM_DATA`)
```json
{
  "generatedAt": "2026-11-13T...",
  "source": "roadpolice.am/exam/abc/hy",
  "groups": [
    {
      "id": 1,
      "title": "ԽՈՒՄԲ 1",
      "questionCount": 147,
      "questions": [
        {
          "uid": "g1-q1",
          "groupId": 1,
          "number": 1,
          "text": "Նշաններից ո՞րն է կոչվում «Արգելքի շրջանցումը ձախից»։",
          "images": ["data/images/ab12cd34.jpg"],
          "options": ["1", "2", "3", "4", "5"],
          "correctIndex": 2
        }
      ]
    }
  ]
}
```
*(Note: `correctIndex` is 0-based internally, corresponding to `Պատ.` 1-based answer minus 1.)*

### 5.4 Web Application Tabs & Behavior

1. **Header & Navigation**
   - App title: `ՃՈ Քննական Հարցաշար · ABC`
   - 4 tabs: `Ուսուցում`, `Քննություն`, `Սխալներ (N)`, `Որոնում`
   - Backup controls: Export JSON (`Արտահանել`) and Import JSON (`Ներմուծել`) for progress portability.

2. **Tab 1 — `Ուսուցում` (Practice Mode)**
   - Group pills `Խումբ 1` … `Խումբ 10` displaying `answered/total` and accuracy %, plus a group-level `Վերսկսել խումբը` (Reset group) action and `Խառնել` (Shuffle) toggle.
   - Displays question number, text, image(s) (clickable to enlarge in a lightbox modal), and numbered option buttons.
   - Clicking an option immediately locks that question's recorded attempt in Practice state, highlights the chosen option (green if right, red if wrong) and always reveals the correct option in green.
   - If wrong, automatically adds `uid` to the Mistakes queue.
   - Includes `Նախորդը` / `Հաջորդը` buttons, keyboard shortcuts (`1`–`5` to answer, `ArrowLeft`/`ArrowRight` to navigate, `Enter` for next), and a compact clickable question-number grid color-coded by status (unanswered / correct / wrong).

3. **Tab 2 — `Քննություն` (Timed Mock Exam)**
   - Start screen showing rules: 20 questions (2 randomly sampled from each of groups 1–10), 30:00 timer, pass with `>= 18/20` (<= 2 mistakes).
   - Active exam view: live countdown timer, question navigator (1–20), ability to select/change answers freely and jump between questions before submitting (`Ավարտել քննությունը`), plus auto-submit when the timer reaches `00:00`.
   - End screen: Pass/Fail badge (`Հանձնված է` / `Չի հանձնվել`), score, duration, full 20-question review highlighting mistakes, and automatic addition of any missed questions to the Mistakes queue.
   - Stores last N exam results (date, score, passed, duration) in `localStorage`.

4. **Tab 3 — `Սխալներ` (Mistakes Retry)**
   - Lists/queues all questions currently in the Mistakes set (with group tag and how many times missed).
   - Interactive retry mode: user answers each missed question with instant feedback.
   - Answering correctly marks it resolved and removes it from the active queue after moving forward (or via explicit `Հեռացնել սխալներից` / automatic removal on next), with a `Մաքրել բոլորը` (Clear all) confirmation button.

5. **Tab 4 — `Որոնում` (Search & Browse — proposed default)**
   - Text search input normalizing Armenian `և` / `եւ` and case folding.
   - Filters: Group (`Բոլորը` or `1`–`10`), `Միայն նկարով հարցեր` (Images only), and a `Ցույց տալ պատասխանները` (Show answers) toggle.
   - Paginated or virtualized result list so rendering ~1,470 items stays fast.

### 5.5 LocalStorage Schema (`roadpolice_abc_v1`)
- `practice`: `{ [uid]: { selectedIndex: number, correct: boolean } }`
- `mistakes`: `{ [uid]: { wrongCount: number, lastWrongAt: number } }`
- `examHistory`: `Array<{ id, date, score, total, passed, durationSec }>`
- `ui`: `{ activeTab, activeGroupId, activeQuestionIndexByGroup }`

---

## 6. Left to the Builder

- Exact visual theme, color palette, typography (Armenian-friendly system/Google fonts fallback), and mobile breakpoint styling.
- Specific PDF layout edge-case handling discovered across `2.pdf`–`10.pdf` during extraction (so long as automated count and orphan-image assertions pass for all 10 PDFs).
- Lightbox modal behavior for zooming traffic-situation images.
- Unit/smoke verification scripts for the extractor and frontend logic.
