# Idea OverFlow

NirMa HackaMined'26 Project — A platform to capture, organize, and transform overflowing ideas into clear, structured, and actionable documents.

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Layout](#project-layout)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [Potential Use Cases](#potential-use-cases)
- [Future Enhancements](#future-enhancements)
- [Team](#team)
- [Conclusion](#conclusion)

## Overview
Many students, researchers, and teams have lots of ideas but struggle to turn them into well-structured documents that follow academic or institutional guidelines. Idea OverFlow provides a workspace to:
- Capture raw ideas quickly
- Organize and refine them into structured sections
- Compare documents against a reference template
- Get suggestions to fix missing or incorrect sections and formatting

The goal is to turn chaotic brainstorming into clear, submission-ready documents.

## Problem Statement
Preparing documents that follow specific academic or institutional standards is challenging because:
- Users may not know the expected structure (e.g., Introduction, Methodology, Results, Conclusion).
- Important sections or subsections may be missing.
- Formatting rules (headings, numbering, font usage) are not consistently followed.
- Manually checking every document against a guideline or sample paper is time-consuming and error-prone.

Consequently, users often submit documents that require multiple rounds of corrections, wasting time for both authors and reviewers.

## Our Solution
Idea OverFlow is a semi-automated document preparation platform that takes a user's rough, vague content and transforms it into a polished, conference-ready paper — without requiring any knowledge of LaTeX or complex formatting tools.

Here is what it does end-to-end:

1. A user uploads their rough draft.
2. The system detects the target conference format (e.g., IEEE, ACM) and auto-formats the content accordingly.
3. It scores the document, reviews its structure, suggests missing parts, and lets the user make edits — all in one place.
4. The user downloads a properly formatted PDF, ready for submission.

Example suggestions the system might give:
- "Add a 'Related Work' section after 'Introduction' — required by IEEE format."
- "Your Abstract exceeds the 150-word limit for this conference."
- "The 'Methodology' section is present but lacks a subsection on experimental setup."

## Key Features

### 1. Vague-to-Formatted Conversion
- Paste rough, unformatted text and have it automatically structured and formatted to match a target conference style (IEEE, ACM, Springer, etc.).
- The system maps content to the correct sections, applies the right heading hierarchy, column layout, font rules, and spacing — no LaTeX knowledge needed.

### 2. AI-Powered Content Rephrasing
- Get AI-generated suggestions to rephrase sentences for clarity, conciseness, and academic tone.
- Helps users improve writing quality without changing the core meaning of their content.

### 3. Document Scoring
- Receive a **score** for your document based on how well it conforms to the target conference's formatting and structural requirements.
- The score breaks down into categories: structure completeness, formatting compliance, section ordering, and length guidelines.
- Helps users quickly understand how "submission-ready" their document is at a glance.

### 4. Structure Review & Missing Parts Detection
- Automatically compare your document against the expected structure of the target conference.
- Get a clear report of:
  - **Missing required sections** (e.g., Abstract, Conclusion, References)
  - **Out-of-order sections**
  - **Sections that need more content** based on the conference's typical expectations

### 5. Easy-to-Use Built-in Editor
- Edit your document directly inside the platform using a simple, button-based UI — no LaTeX commands required.
- Features include:
  - Add / remove / rename sections with one click
  - Bold, italic, headings, bullet points, and other common formatting via a familiar toolbar
  - Real-time preview of how the document will look in the final formatted output

### 6. Formatted PDF Download
- Once satisfied, download your document as a properly formatted PDF that matches the chosen conference template.
- No manual LaTeX compilation or template wrangling needed.

### 7. Platform Plugins (Overleaf & Google Docs)
- Use Idea OverFlow's capabilities directly inside the tools you already work with, via browser plugins:
  - **Overleaf Plugin** — Get real-time structure suggestions, section scoring, and AI review without leaving your LaTeX editor.
  - **Google Docs Plugin** — Format, review, and chat with the AI assistant about your document content right inside Google Docs.
- Plugin features include:
  - Inline editing suggestions and one-click apply
  - AI chat sidebar to ask questions about your document (e.g., "What is missing in my methodology section?")
  - Live document review against the target conference template

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend (Editor) | Python 3.11+, FastAPI | REST API for LaTeX compilation, rephrasing, document review, and scoring |
| Backend (Plugin) | Python 3.11+, FastAPI | REST API consumed by the browser extension for AI chat, review, and edit actions |
| AI / LLM | Google Gemini API (`google-generativeai`) | Content rephrasing, structure review, missing section detection, AI chat |
| LaTeX Engine | `pdflatex` (TeX Live / MiKTeX) | Compiles generated `.tex` files into downloadable PDFs |
| LaTeX Parsing | `pylatexenc` | Encodes/decodes LaTeX special characters |
| Document Parsing | `python-docx` (`docx`) | Parses uploaded `.docx` files for structure extraction |
| Frontend (Editor) | HTML, CSS, JavaScript | Browser-based document editor UI (no framework, served statically) |
| Editor Blocks | Editor.js (CDN) | Block-based rich-text editing (headers, lists, tables, code blocks) |
| Browser Extension | JavaScript, Manifest V3 | Overleaf plugin — injects sidebar for editing, review, and AI chat |
| Google Docs Add-on | Google Apps Script (`.gs`) | Sidebar add-on for reviewing and rephrasing content inside Google Docs |
| Validation | Pydantic v2 | Request/response validation in the FastAPI backends |
| Serving | Uvicorn | ASGI server for both FastAPI backends |

---

## Project Layout

```
IdeaOverflow/
│
├── editor/                    # Core web editor — the main platform
│   ├── index.html             # Full browser-based editor UI (served as a static file)
│   ├── main.py                # FastAPI backend — LaTeX compile, rephrase, review, score
│   ├── acl.sty                # ACL LaTeX style file (bundled for pdflatex)
│   └── logo.svg
│
├── plugins/                   # Browser extension for Overleaf
│   ├── manifest.json          # Chrome Extension Manifest V3 config
│   ├── content.js             # Injected script — adds the IdeaOverflow sidebar to Overleaf
│   ├── background.js          # Extension service worker
│   ├── styles.css             # Sidebar styles injected into Overleaf
│   ├── main.py                # FastAPI backend consumed by the extension
│   ├── ai_assistant.py        # Gemini AI logic — chat, review, edit, autocomplete
│   ├── config.py              # API key configuration (set your Gemini key here)
│   ├── logo.svg
│   └── icons/
│       ├── 64.png
│       └── 128.png
│
├── appscript/                 # Google Docs Add-on
│   ├── Code.gs                # Apps Script backend — reads/writes document content
│   ├── Sidebar.html           # Sidebar UI rendered inside Google Docs
│   └── appscript.json         # Apps Script project manifest
│
├── videos/                    # Demo videos
│   ├── color.mp4
│   ├── google_docs.mp4
│   ├── overleaf_chat.mp4
│   ├── overleaf_edits.mp4
│   └── overleaf_review.mp4
│
├── requirements.txt           # Python dependencies for both backends
├── Dockerfile                 # Docker image with TeX Live + Python deps
├── docker-compose.yml         # Run both backends via Docker Compose
├── .gitignore
├── LICENSE
└── README.md
```

---

## Dependencies

### System Requirements
- **Python 3.11 or higher**
- **pdflatex** — required to compile `.tex` files to PDF. Install one of:
  - **TeX Live** (Linux/macOS): `sudo apt install texlive-full` or `brew install --cask mactex`
  - **MiKTeX** (Windows): Download from [miktex.org](https://miktex.org/download)
  - **Docker** (any OS): If `pdflatex` is not installed locally, the backend will automatically use `texlive/texlive:latest-small` via Docker. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and run `docker pull texlive/texlive:latest-small`.
- **Google Chrome** (or any Chromium-based browser) — for the browser extension
- **Google Account** — for the Google Docs Add-on

### Python Packages (`requirements.txt`)
```
fastapi>=0.100.0
uvicorn[standard]
pylatexenc>=2.10
python-multipart
pydantic>=2.0
google-generativeai>=0.4.0
python-docx>=1.0
```

### API Keys
- A **Google Gemini API key** is required for AI features (rephrasing, review, scoring, AI chat).
- Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/IdeaOverflow.git
cd IdeaOverflow
```

### 2. Create and Activate a Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Keys

Set the Gemini API key as an environment variable (both backends read from it automatically):
```bash
# Windows PowerShell
$env:GEMINI_API_KEY = "your-key-here"

# macOS / Linux
export GEMINI_API_KEY="your-key-here"
```

Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

### 5. Verify pdflatex is Installed
```bash
pdflatex --version
```
If `pdflatex` is not found, install a TeX distribution as described in [System Requirements](#dependencies) above, or install [Docker Desktop](https://www.docker.com/products/docker-desktop/) — the backend will automatically use the `texlive/texlive:latest-small` Docker image as a fallback.

---

## Running the Project

The project has **two independent backends** and **one static frontend**. You will typically run all three together.

### Start the Editor Backend
```bash
cd editor
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.  
Interactive API docs (Swagger UI): `http://localhost:8000/docs`

### Start the Plugin Backend
```bash
cd plugins
uvicorn main:app --reload --port 8001
```
The plugin API will be available at `http://localhost:8001`.

### Open the Editor UI
Open `http://localhost:8000` in your browser.  
> The frontend is served at the root URL by the editor backend.

### Load the Browser Extension (Overleaf Plugin)
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `plugins/` folder from this repository.
5. The IdeaOverflow icon will appear in your Chrome toolbar.
6. Open any Overleaf project — the sidebar will inject automatically.
> The extension sends requests to the plugin backend at `http://localhost:8001`. Make sure it is running.

### Set Up the Google Docs Add-on
1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Copy the contents of `appscript/Code.gs` into the script editor.
3. Create a new HTML file named `Sidebar` and paste the contents of `appscript/Sidebar.html`.
4. Click **Deploy → Test deployments** to run the add-on in a linked Google Doc.
5. In the Google Doc, go to **Extensions → IdeaOverflow → Open IdeaOverflow** to open the sidebar.
> The Apps Script backend makes outbound requests to your Gemini API key configured inside `Sidebar.html`.

---

## How It Works

1. **Write or Upload** — The user types content into the editor or uploads a `.docx` file.
2. **Select Target Conference** — The user selects a conference template (ACL, CVPR, NeurIPS, IEEE, etc.).
3. **Auto-Format** — The backend maps content to conference-specific LaTeX sections and generates a `.tex` file.
4. **Score & Review** — Gemini AI evaluates the document and returns:
   - A completeness, writing quality, technical depth, and structure score (1–10 each).
   - A section-by-section breakdown of what is present, fair, or missing.
   - A list of actionable recommendations.
5. **Rephrase** — Selected text can be sent to Gemini for academic-tone rewriting.
6. **Edit** — The user adjusts sections using the block editor (no LaTeX needed).
7. **Compile & Download** — The backend calls `pdflatex` and streams the compiled PDF back to the browser.

---

## Potential Use Cases
- Students writing research papers or lab reports that must follow a conference format.
- Researchers preparing first drafts for ACL, CVPR, NeurIPS, AAAI, EMNLP, or journal submissions.
- Academic advisors reviewing student work against target venue requirements.
- Teams collaboratively drafting structured technical documents.

---

## Future Enhancements
- Support for more conference and journal templates (ICLR, ICML, Springer LNCS, Elsevier).
- Citation and reference formatting checks (BibTeX integration).
- Section-wise word count and page limit enforcement.
- Figure and table caption validation.
- Google Docs plugin extended to support PDF download and scoring.
- User accounts and cloud-saved document history.

---

## Team

| Name | Roll No. |
|---|---|
| Deep Joshi | 24BCE152 |
| Hasti Vaghela | 24BCE154 |
| Het Agrawal | 24BCE156 |
| Man Patel | 24BCE155 |
| Ziyankhan Pathan | 24BCE146 |

---

## Conclusion
Idea OverFlow bridges the gap between raw ideas and conference-ready academic papers. By combining a block-based editor, AI-powered review and rephrasing, conference-specific LaTeX formatting, and platform plugins for Overleaf and Google Docs, it removes the friction of LaTeX, formatting rules, and structural guesswork — so researchers and students can focus entirely on the quality of their work.
