# Road Police ABC Exam Study Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract all 10 Armenian Road Police ABC theoretical exam PDFs (`1.pdf`–`10.pdf`) with their diagrams and answer keys into a static, offline-ready interactive study website with Practice, Timed Mock Exam, Mistakes Retry, and Search tabs.

**Architecture:** A Python (`pymupdf`) extraction script downloads and parses `1.pdf`–`10.pdf` using positional text/image bounding boxes, verifies question counts and image assignments, and emits `data/questions.json`, `data/questions.js`, and deduplicated `data/images/*`. The frontend separates pure state, Armenian search, and exam logic into `app-core.js` (tested via `node --test`) from DOM rendering in `index.html`, `styles.css`, and `app.js` (compatible with both `file://` and HTTP).

**Tech Stack:** Python 3.14 (`pymupdf`, `pytest`), Vanilla HTML/CSS/JS, Node.js (`node --test` for unit tests).

**Spec:** `/Users/amartirosyan/roadpolice-exam/docs/superpowers/specs/2026-11-13-roadpolice-exam-design.md`

## Global Constraints

- Extract 100% of questions, options, correct answers (`Պատ.`), and embedded images across all 10 PDFs (`https://roadpolice.am/exam/abc/hy/1.pdf` through `10.pdf`).
- Must work directly via `file://` (via `data/questions.js` setting `window.EXAM_DATA`) as well as over HTTP, with zero Node.js build step or backend server required at runtime.
- Practice mode (`Ուսուցում`) provides instant green/red feedback, locks recorded answer per question, supports group reset and shuffle, and adds wrong answers to Mistakes (`Սխալներ`).
- Mock Exam (`Քննություն`) selects 20 questions (2 randomly from each of the 10 groups), runs a 30-minute (`1800`s) countdown timer with auto-submit, and passes at `>= 18/20`.
- Mistakes tab (`Սխալներ`) lets users retry missed questions and removes resolved ones when answered correctly.
- Search tab (`Որոնում`) normalizes Armenian `և` / `եւ`, supports group and image-only filters, and toggles answer visibility.
- Persistence uses `localStorage` key `roadpolice_abc_v1` with JSON export/import backup.

## Review Focus

- **Cross-page question splits in PDFs:** A question stem appears at the bottom of page `p` and its options/answer (`Պատ.`) appear at the top of page `p+1`; parser must keep them as one question rather than dropping or splitting.
- **Armenian `և` vs `եւ` ligature mismatch:** Official PDFs often use `եւ` (e.g., `երթեւեկություն`), whereas user keyboards type `և`; search must match both transparently.
- **Corrupted or incompatible `localStorage` / imported JSON:** Invalid JSON or missing fields must safely fall back/reject without crashing the app.
- **Mock exam timer expiry & unanswered questions:** Auto-submitting at `00:00` with unanswered questions must count unanswered items as wrong, add them to `Սխալներ`, and save history cleanly.
- **Practice re-click or shuffle stability:** Clicking options on an already-answered question in Practice must not overwrite the locked result or duplicate mistake entries, and shuffling display order must still key state by `uid`.

---

### Task 1: PDF Extraction Pipeline, Verification & Dataset Generation

**Files:**
- Create: `/Users/amartirosyan/roadpolice-exam/requirements.txt`
- Create: `/Users/amartirosyan/roadpolice-exam/scripts/extract_pdfs.py`
- Create: `/Users/amartirosyan/roadpolice-exam/tests/test_extract_pdfs.py`
- Generated outputs: `/Users/amartirosyan/roadpolice-exam/raw_pdfs/*.pdf`, `/Users/amartirosyan/roadpolice-exam/data/images/*`, `/Users/amartirosyan/roadpolice-exam/data/questions.json`, `/Users/amartirosyan/roadpolice-exam/data/questions.js`

**Interfaces:**
- Produces in `scripts/extract_pdfs.py`:
  - `parse_pdf_document(doc, group_id: int, image_writer: Callable[[bytes, str], str]) -> dict` returning `{"id": int, "title": str, "questionCount": int, "questions": list[dict]}`
  - `verify_group_data(group: dict, orphan_images: list) -> None` raising `ValueError` on count mismatch, number gaps, invalid `correctIndex`, `< 2` options, or orphan images.
  - `build_dataset(raw_dir: Path, data_dir: Path, refresh: bool = False) -> dict`

- [ ] **Step 1: Set up `.venv` and `requirements.txt`**

Create `/Users/amartirosyan/roadpolice-exam/requirements.txt` with `pymupdf>=1.24.0` and `pytest>=8.0.0`, create `.venv`, and install dependencies.

- [ ] **Step 2: Write failing tests in `tests/test_extract_pdfs.py`**

Tests to include (building synthetic in-memory PDFs with `fitz.open()`):
1. `test_parse_multiline_and_image_matching`: 2 questions on 1 page where Q1 has an embedded image between stem and options and Q2 wraps across 2 lines; verifies `images` has 1 image on Q1 and 0 on Q2, options and `correctIndex` are accurate.
2. `test_parse_cross_page_question`: Question stem on page 1 bottom, options & `Պատ.` on page 2 top; verifies it merges into 1 complete question and ignores running headers/footers (`ABC կարգեր · հարցաշար`, `Էջ 1 / 2`).
3. `test_verify_raises_on_orphan_image_or_count_mismatch`: Verifies `verify_group_data` raises `ValueError` when header count != extracted count or when an orphan image exists.

- [ ] **Step 3: Run pytest to verify failure**

Run: `/Users/amartirosyan/roadpolice-exam/.venv/bin/pytest tests/test_extract_pdfs.py -v`
Expected: FAIL with `ModuleNotFoundError` / `ImportError`.

- [ ] **Step 4: Implement `scripts/extract_pdfs.py`**

Implement downloading (`urllib.request` with User-Agent), `fitz` page element extraction (collecting text lines with `(y0, y1, text)` and image bounding boxes `(y0, y1, xref)`), header/footer filtering, sequential state-machine parsing across pages, vertical-coordinate image matching (with fallback tolerance for slight overlap/side-by-side placement), SHA-256 image deduplication, strict verification, and `questions.json` + `questions.js` emission.

- [ ] **Step 5: Run pytest to verify unit tests pass**

Run: `/Users/amartirosyan/roadpolice-exam/.venv/bin/pytest tests/test_extract_pdfs.py -v`
Expected: PASS (all tests green).

- [ ] **Step 6: Run extraction on all 10 live PDFs (`1.pdf`–`10.pdf`)**

Run: `/Users/amartirosyan/roadpolice-exam/.venv/bin/python scripts/extract_pdfs.py`
Expected: Downloads/caches `1.pdf`–`10.pdf`, passes verification for every group (0 orphan images, exact question count match for all 10 groups), writes `data/questions.json`, `data/questions.js`, and `data/images/`.

---

### Task 2: Core State, Search Normalization & Exam Logic (`app-core.js`)

**Files:**
- Create: `/Users/amartirosyan/roadpolice-exam/app-core.js`
- Create: `/Users/amartirosyan/roadpolice-exam/tests/app-core.test.mjs`

**Interfaces:**
- Produces in `app-core.js` (attached to `globalThis.RoadPoliceCore` and exported via `module.exports` when in CommonJS):
  - `STORAGE_KEY = "roadpolice_abc_v1"`
  - `EXAM_DURATION_SEC = 1800`
  - `EXAM_PASS_SCORE = 18`
  - `normalizeArmenian(text: string) -> string`
  - `createInitialState() -> State`
  - `loadState(storage) -> State`
  - `saveState(storage, state) -> void`
  - `exportStateJson(state) -> string`
  - `importStateJson(jsonStr) -> State` (throws descriptive Error on invalid payload)
  - `recordPracticeAnswer(state, uid, selectedIndex, correctIndex) -> { state, isCorrect, newlyRecorded }`
  - `resetGroupPractice(state, groupQuestions) -> State`
  - `generateMockExam(groups, rng = Math.random) -> Question[]` (20 questions: 2 per group, shuffled)
  - `gradeMockExam(state, examQuestions, answersByUid, durationSec) -> { state, result }`
  - `retryMistakeAnswer(state, uid, selectedIndex, correctIndex) -> { state, isCorrect }`
  - `resolveMistake(state, uid) -> State`
  - `clearAllMistakes(state) -> State`
  - `filterQuestions(groups, { query, groupId, imagesOnly }) -> Question[]`

- [ ] **Step 1: Write failing tests in `tests/app-core.test.mjs`**

Tests using `node:test` and `node:assert/strict`:
1. `normalizeArmenian` matches `"երթևեկություն"` against `"Երթեւեկության"` (`և` vs `եւ` and case).
2. `loadState` recovers gracefully from corrupted JSON in storage; `importStateJson` rejects invalid JSON/missing structure without mutating state.
3. `recordPracticeAnswer` locks first selection (second call on same `uid` does not overwrite `selectedIndex` or duplicate `wrongCount`), and adds wrong answers to `mistakes`.
4. `generateMockExam` picks exactly 20 questions (2 from each of 10 groups) with no duplicates.
5. `gradeMockExam` handles timer expiry with unanswered questions (unanswered counts as wrong, added to `mistakes`, `passed: score >= 18`, saves `examHistory`).
6. `retryMistakeAnswer` and `resolveMistake` keep/increment wrong counts on errors and cleanly remove resolved UIDs.
7. `filterQuestions` filters by group, `imagesOnly`, and normalized Armenian query.

- [ ] **Step 2: Run `node --test` to verify failure**

Run: `node --test tests/app-core.test.mjs`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `app-core.js`**

Implement pure immutable-style helpers and safe storage/JSON handling matching the exact signatures above.

- [ ] **Step 4: Run `node --test` to verify all tests pass**

Run: `node --test tests/app-core.test.mjs`
Expected: PASS (all tests green).

---

### Task 3: Interactive Frontend UI (`index.html`, `styles.css`, `app.js`)

**Files:**
- Create: `/Users/amartirosyan/roadpolice-exam/index.html`
- Create: `/Users/amartirosyan/roadpolice-exam/styles.css`
- Create: `/Users/amartirosyan/roadpolice-exam/app.js`

**Interfaces:**
- Consumes: `window.EXAM_DATA` (from `data/questions.js`) and `window.RoadPoliceCore` (from `app-core.js`).

- [ ] **Step 1: Build `index.html`**

Semantic HTML5 structure with `<html lang="hy">`, header navigation for all 4 tabs (`Ուսուցում`, `Քննություն`, `Սխալներ`, `Որոնում`), backup controls (`Արտահանել`, `Ներմուծել`), main app container, image lightbox modal, and script tags (`data/questions.js`, `app-core.js`, `app.js`).

- [ ] **Step 2: Build `styles.css`**

Clean, high-contrast Armenian-friendly UI (`Noto Sans Armenian` / system sans-serif), responsive layout for desktop and mobile, clear green/red feedback states, compact question number grid, timer bar (warning color under 5 minutes), and accessible focus rings.

- [ ] **Step 3: Build `app.js`**

Wire up all 4 tabs:
- **Ուսուցում:** Group selector pills with `answered/total` & accuracy %, Shuffle toggle, Group reset button, instant-feedback question card, clickable lightbox images, Prev/Next buttons, keyboard shortcuts (`1`–`5`, `ArrowLeft`, `ArrowRight`, `Enter`), question-number jump grid.
- **Քննություն:** Rules & exam history start screen, active 20-question exam with `30:00` countdown timer & auto-submit, free navigation across 1–20 before submit, detailed end-of-exam review list.
- **Սխալներ:** Interactive retry flow for queued mistakes (showing `wrongCount` & group), instant feedback, automatic/button removal when answered correctly, and Clear All with confirmation.
- **Որոնում:** Debounced Armenian search input, Group dropdown, Images-only checkbox, Show-answers toggle, and pagination (50 per page) for smooth scrolling.

- [ ] **Step 4: Verify JS syntax, asset paths, and full test suite**

Run:
- `node --check app-core.js && node --check app.js`
- `node --test tests/app-core.test.mjs`
- `/Users/amartirosyan/roadpolice-exam/.venv/bin/pytest tests/test_extract_pdfs.py -v`
- Verify every image path referenced in `data/questions.json` exists on disk under `data/images/`.
- Serve locally and smoke-test HTTP responses and rendering.
