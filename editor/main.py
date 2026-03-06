# main.py
import re
import html
import logging

from fastapi import FastAPI, HTTPException, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from google import genai
import tempfile
import subprocess
import shutil
import glob
import os
import json
import docx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LaTeX Studio API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini — keep your own key here
client = genai.Client(api_key="API_KEY")

# ─── Gemini model to use ────────────────────────────────────────────────────
GEMINI_MODEL = "gemini-2.5-flash"   # was "gemini-3-flash" which doesn't exist

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class EditorBlock(BaseModel):
    type: str
    data: dict

class CompileRequest(BaseModel):
    template: str
    title: str
    author: str
    affiliation: str
    blocks: list[EditorBlock]

    @field_validator("template")
    @classmethod
    def validate_template(cls, v: str) -> str:
        allowed = {"standard", "acl", "cvpr"}
        if v not in allowed:
            raise ValueError(f"template must be one of {allowed}")
        return v

    @field_validator("title", "author", "affiliation")
    @classmethod
    def strip_fields(cls, v: str) -> str:
        return v.strip()

    @field_validator("blocks")
    @classmethod
    def validate_blocks(cls, v: list) -> list:
        if len(v) > 500:
            raise ValueError("Too many blocks (max 500)")
        return v


# ─── LaTeX Sanitisation ───────────────────────────────────────────────────────

# Characters that must be escaped in plain LaTeX text.
# Order matters: process backslash FIRST to avoid double-escaping.
_LATEX_ESCAPES = [
    ("\\", "\\textbackslash{}"),
    ("&", "\\&"),
    ("%", "\\%"),
    ("$", "\\$"),
    ("#", "\\#"),
    ("_", "\\_"),
    ("{", "\\{"),
    ("}", "\\}"),
    ("~", "\\textasciitilde{}"),
    ("^", "\\textasciicircum{}"),

    ("“", "``"),
    ("”", "''"),
    ("‘", "`"),
    ("’", "'"),

    ("–", "--"),
    ("—", "---"),
    ("−", "-"),
    ("…", "\\ldots{}"),

    ("\u00A0", " "),

    ("×", "$\\times$"),
    ("÷", "$\\div$"),
    ("±", "$\\pm$"),
    ("≤", "$\\leq$"),
    ("≥", "$\\geq$"),
    ("≈", "$\\approx$"),
    ("≠", "$\\neq$"),

    ("•", "\\textbullet{}"),

    ("°", "$^{\\circ}$"),

    ("©", "\\textcopyright{}"),
    ("®", "\\textregistered{}"),
    ("™", "\\texttrademark{}"),

    ("ﬁ", "fi"),
    ("ﬂ", "fl"),
    ("ﬀ", "ff"),
    ("ﬃ", "ffi"),
    ("ﬄ", "ffl"),
    ("α", "$\\alpha$"),
    ("β", "$\\beta$"),
    ("γ", "$\\gamma$"),
    ("δ", "$\\delta$"),
    ("Δ", "$\\Delta$"),
    ("ε", "$\\epsilon$"),
    ("θ", "$\\theta$"),
    ("λ", "$\\lambda$"),
    ("μ", "$\\mu$"),
    ("π", "$\\pi$"),
    ("σ", "$\\sigma$"),
    ("ω", "$\\omega$"),
    ("∼", "$\\sim$"),
    ("Ω", "$\\Omega$"),
]

_UNICODE_REPLACEMENTS: dict[str, str] = {
    "\u201c": "``",      # left double quote
    "\u201d": "''",      # right double quote
    "\u2018": "`",       # left single quote
    "\u2019": "'",       # right single quote
    "\u2013": "--",      # en dash
    "\u2014": "---",     # em dash
    "\u2026": "\\dots",  # ellipsis
    "\u00a0": " ",       # non-breaking space
    "\u2212": "-",       # minus sign
}

def sanitize_latex(text: str) -> str:
    """Escape plain text so it's safe inside a LaTeX document."""
    # 1. Unicode replacements first (before escape processing)
    for char, replacement in _UNICODE_REPLACEMENTS.items():
        text = text.replace(char, replacement)
    # 2. Structural escapes
    for char, replacement in _LATEX_ESCAPES:
        text = text.replace(char, replacement)
    return text


def clean_html(raw: str) -> str:
    """Strip HTML tags and unescape HTML entities from Editor.js rich text."""
    raw = raw.replace("&nbsp;", " ")
    raw = html.unescape(raw)                        # &amp; → &, &lt; → <, …
    raw = re.sub(r"<br\s*/?>", "\n", raw)           # <br> → newline
    raw = re.sub(r"<[^>]+>", "", raw)               # strip remaining tags
    return raw.strip()


# ─── Templates ───────────────────────────────────────────────────────────────

ACL_TEMPLATE = r"""\documentclass[11pt]{article}
\usepackage{acl}
\usepackage{times}
\usepackage{latexsym}
\usepackage{cite}
\usepackage{amsmath,amssymb}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{booktabs}
\usepackage{array}
\usepackage{longtable}
\usepackage{microtype}
\begin{document}

\title{[[TITLE]]}
\author{
	[[AUTHOR]] \\
	[[AFFILIATION]]
}
\maketitle
\begin{abstract}
	Generated abstract from editor content.
\end{abstract}

%%BODY%%

\bibliographystyle{acl_natbib}
\end{document}
"""

CVPR_TEMPLATE = r"""\documentclass[10pt,twocolumn,letterpaper]{article}
\usepackage{cvpr}
\usepackage{times}
\usepackage{epsfig}
\usepackage{graphicx}
\usepackage{amsmath,amssymb}
\usepackage{cite}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{booktabs}
\usepackage{array}
\usepackage{longtable}
\begin{document}

\title{[[TITLE]]}
\author{[[AUTHOR]] \\ [[AFFILIATION]]}
\maketitle

%%BODY%%

\end{document}
"""

STANDARD_TEMPLATE = r"""\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb}
\usepackage{booktabs}
\usepackage{array}
\usepackage{longtable}
\usepackage{microtype}
\usepackage{geometry}
\geometry{margin=1in}
\title{[[TITLE]]}
\author{[[AUTHOR]] \\ \small [[AFFILIATION]]}
\date{\today}
\begin{document}
\maketitle
%%BODY%%
\end{document}
"""

TEMPLATES = {
    "acl": ACL_TEMPLATE,
    "cvpr": CVPR_TEMPLATE,
    "standard": STANDARD_TEMPLATE,
}


# ─── DOCX helpers ─────────────────────────────────────────────────────────────

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n\n".join(          # double newline → paragraph boundary
        para.text for para in doc.paragraphs if para.text.strip()
    )


# ─── Chunked-conversion helpers ───────────────────────────────────────────────

CHUNK_CHARS = 7_000          # characters sent to Gemini per call
CONTEXT_BLOCKS = 2           # tail blocks fed as context to each continuation chunk

_BLOCK_RULES = """\
Block conversion rules (STRICT):
- "header"    → section / subsection headings  (level: 1 = section, 2 = subsection, 3 = subsubsection)
- "paragraph" → regular prose
- "code"      → any LaTeX math, equation, table, or verbatim environment already in LaTeX
- "list"      → bullet / numbered lists  (style: "unordered" or "ordered"; items: array of strings)

RETURN ONLY VALID JSON — no markdown fences, no commentary outside the JSON object."""

_FIRST_SCHEMA = """\
{
  "title": "string",
  "author": "string",
  "affiliation": "string",
  "blocks": [ {"type": "paragraph", "data": {"text": "..."}} ]
}"""

_CONT_SCHEMA = """\
{
  "blocks": [ {"type": "paragraph", "data": {"text": "..."}} ]
}"""


def _split_chunks(text: str, size: int = CHUNK_CHARS) -> list[str]:
    """Split text at paragraph boundaries so no chunk exceeds `size` chars."""
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
    chunks: list[str] = []
    buf: list[str] = []
    buf_len = 0
    for para in paragraphs:
        para_len = len(para) + 2          # +2 for the "\n\n" separator
        if buf and buf_len + para_len > size:
            chunks.append("\n\n".join(buf))
            buf, buf_len = [para], para_len
        else:
            buf.append(para)
            buf_len += para_len
    if buf:
        chunks.append("\n\n".join(buf))
    return chunks


def _call_gemini(prompt: str) -> dict:
    """Call Gemini, strip fences, parse JSON.  Raises HTTPException on failure."""
    try:
        resp = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        raw = resp.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```\s*$", "", raw)
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Gemini non-JSON (%s): %.300s", exc, raw)
        raise HTTPException(status_code=500,
            detail=f"AI returned invalid JSON on chunk: {exc}")
    except Exception as exc:
        logger.error("Gemini error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


def _process_chunks(chunks: list[str]) -> dict:
    """
    Process every chunk sequentially and return a merged Editor.js document.
    Chunk 0  → extract metadata + blocks (schema: _FIRST_SCHEMA)
    Chunk N  → extract blocks only, fed last CONTEXT_BLOCKS for continuity
    """
    total = len(chunks)
    logger.info("Processing document in %d chunk(s)", total)

    # ── Chunk 0: metadata + first batch of blocks ──────────────────────────
    first_prompt = f"""\
You are converting an academic document into Editor.js JSON blocks.
This is chunk 1 of {total}.

{_BLOCK_RULES}

SCHEMA:
{_FIRST_SCHEMA}

Document text (chunk 1/{total}):
{chunks[0]}
"""
    result = _call_gemini(first_prompt)
    all_blocks: list[dict] = result.get("blocks", [])
    metadata = {
        "title":       result.get("title", ""),
        "author":      result.get("author", ""),
        "affiliation": result.get("affiliation", ""),
    }
    logger.info("Chunk 1/%d → %d blocks, metadata=%s", total, len(all_blocks), metadata)

    # ── Chunks 1…N: continuation ───────────────────────────────────────────
    for idx, chunk_text in enumerate(chunks[1:], start=2):
        context_tail = all_blocks[-CONTEXT_BLOCKS:] if len(all_blocks) >= CONTEXT_BLOCKS else all_blocks
        context_json = json.dumps(context_tail, ensure_ascii=False)

        cont_prompt = f"""\
You are converting an academic document into Editor.js JSON blocks.
This is chunk {idx} of {total} — continue from where the previous chunk ended.

The last {len(context_tail)} block(s) already produced (for continuity — do NOT repeat them):
{context_json}

{_BLOCK_RULES}

SCHEMA for this response (blocks only — metadata already captured):
{_CONT_SCHEMA}

Document text (chunk {idx}/{total}):
{chunk_text}
"""
        cont_result = _call_gemini(cont_prompt)
        new_blocks = cont_result.get("blocks", [])
        all_blocks.extend(new_blocks)
        logger.info("Chunk %d/%d → +%d blocks (total %d)", idx, total, len(new_blocks), len(all_blocks))

    return {**metadata, "blocks": all_blocks, "chunks_processed": total}


# ─── LaTeX construction ───────────────────────────────────────────────────────

def _list_items_to_latex(items: list, ordered: bool, depth: int = 0) -> str:
    """Recursively convert Editor.js list items to LaTeX enumerate/itemize."""
    env = "enumerate" if ordered else "itemize"
    indent = "  " * depth
    lines = [f"{indent}\\begin{{{env}}}"]
    for item in items:
        if isinstance(item, dict):
            text = sanitize_latex(clean_html(item.get("content", "")))
            lines.append(f"{indent}  \\item {text}")
            nested = item.get("items", [])
            if nested:
                lines.append(_list_items_to_latex(nested, ordered, depth + 1))
        else:
            # Flat string (older Editor.js list format)
            lines.append(f"{indent}  \\item {sanitize_latex(clean_html(str(item)))}")
    lines.append(f"{indent}\\end{{{env}}}")
    return "\n".join(lines)


def _table_to_latex(table_data: dict) -> str:
    """Convert an Editor.js table block to a LaTeX table using booktabs."""
    content = table_data.get("content", [])
    with_headings: bool = table_data.get("withHeadings", False)

    rows = [r for r in content if isinstance(r, list)]
    if not rows:
        return ""

    cols = max(len(r) for r in rows)
    if cols == 0:
        return ""

    col_spec = " ".join(["l"] * cols)

    lines = [
        "",
        "\\begin{table}[htbp]",
        "  \\centering",
        f"  \\begin{{tabular}}{{{col_spec}}}",
        "  \\toprule",
    ]

    for i, row in enumerate(rows):
        padded = list(row) + [""] * (cols - len(row))
        if i == 0 and with_headings:
            cells = " & ".join(
                "\\textbf{" + sanitize_latex(clean_html(str(c))) + "}"
                for c in padded
            )
        else:
            cells = " & ".join(sanitize_latex(clean_html(str(c))) for c in padded)
        lines.append(f"  {cells} \\\\")
        if i == 0 and with_headings:
            lines.append("  \\midrule")

    lines += ["  \\bottomrule", "  \\end{tabular}", "\\end{table}", ""]
    return "\n".join(lines)


def construct_latex(request: CompileRequest) -> str:
    body_parts: list[str] = []

    for block in request.blocks:
        btype = block.type
        data = block.data

        if btype == "paragraph":
            raw = data.get("text", "")
            text = sanitize_latex(clean_html(raw))
            if text:
                body_parts.append(f"{text}\n")

        elif btype == "header":
            level = int(data.get("level", 2))
            text = sanitize_latex(clean_html(data.get("text", "")))
            cmd = {1: "section", 2: "subsection", 3: "subsubsection"}.get(level, "subsubsection")
            if text:
                body_parts.append(f"\\{cmd}{{{text}}}\n")

        elif btype == "code":
            # Raw LaTeX — not sanitised; user is expected to write valid LaTeX here.
            code = data.get("code", "").strip()
            if code:
                body_parts.append(f"{code}\n")

        elif btype == "list":
            style = data.get("style", "unordered")
            ordered = style == "ordered"
            items = data.get("items", [])
            if items:
                body_parts.append(_list_items_to_latex(items, ordered) + "\n")

        elif btype == "table":
            tex_table = _table_to_latex(data)
            if tex_table:
                body_parts.append(tex_table + "\n")

        else:
            logger.warning("Unsupported block type ignored: %s", btype)

    body = "\n".join(body_parts)

    # Select template, inject metadata, inject body
    tpl = TEMPLATES.get(request.template, STANDARD_TEMPLATE)
    result = (
        tpl
        .replace("[[TITLE]]",       sanitize_latex(request.title))
        .replace("[[AUTHOR]]",      sanitize_latex(request.author))
        .replace("[[AFFILIATION]]", sanitize_latex(request.affiliation))
        .replace("%%BODY%%",        body)
    )
    return result


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_and_modularize(file: UploadFile = File(...)):
    """
    Convert a .docx file into Editor.js blocks using chunked Gemini processing.
    Long documents are split into ~7 000-char chunks and processed sequentially
    so the entire document is always converted, never silently truncated.
    """
    if not (file.filename or "").endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are supported.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        raw_text = extract_text_from_docx(tmp_path)
    except Exception as e:
        logger.error("Failed to extract docx: %s", e)
        raise HTTPException(status_code=422, detail=f"Could not parse document: {e}")
    finally:
        os.remove(tmp_path)

    raw_text = raw_text.strip()
    if not raw_text:
        raise HTTPException(status_code=422, detail="The uploaded document appears to be empty.")

    chunks = _split_chunks(raw_text)
    logger.info("Document %.0f chars → %d chunk(s)", len(raw_text), len(chunks))

    # _process_chunks is synchronous (Gemini SDK is sync); run in thread pool
    # so we don't block the event loop on large documents.
    import asyncio
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _process_chunks, chunks)
    return result


@app.post("/api/latex")
def get_latex_source(request: CompileRequest) -> dict:
    """Return the generated LaTeX source without compiling — useful for debugging."""
    try:
        return {"source": construct_latex(request)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compile")
def compile_latex(request: CompileRequest):
    tex_content = construct_latex(request)
    logger.info("Compiling %.0f chars of LaTeX (template=%s)", len(tex_content), request.template)

    with tempfile.TemporaryDirectory() as temp_dir:
        tex_path = os.path.join(temp_dir, "main.tex")
        pdf_path = os.path.join(temp_dir, "main.pdf")

        # Copy local style/bib files
        current_dir = os.getcwd()
        for ext in ("*.sty", "*.cls", "*.bib", "*.bst"):
            for fp in glob.glob(os.path.join(current_dir, ext)):
                shutil.copy(fp, temp_dir)

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(tex_content)

        latex_cmd = [
            "pdflatex",
            "-interaction=nonstopmode",
            "-halt-on-error",
            "main.tex",
        ]

        def run_pass(pass_num: int):
            try:
                return subprocess.run(
                    latex_cmd,
                    cwd=temp_dir,
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    timeout=60,
                )
            except subprocess.TimeoutExpired:
                raise HTTPException(
                    status_code=504,
                    detail=f"LaTeX compilation timed out (pass {pass_num}).",
                )
            except subprocess.CalledProcessError as e:
                log_output = e.stdout.decode("utf-8", errors="ignore")
                log_lines = log_output.splitlines()

                # Collect error blocks: the ! line + next 4 context lines
                error_chunks: list[str] = []
                for idx, line in enumerate(log_lines):
                    if line.startswith("!"):
                        chunk = log_lines[idx : idx + 5]
                        error_chunks.append("\n".join(chunk))

                if error_chunks:
                    short_error = "\n\n".join(error_chunks)
                else:
                    # Fall back to last 20 lines of log
                    short_error = "\n".join(log_lines[-20:]) or "Unknown LaTeX error."

                raise HTTPException(
                    status_code=400,
                    detail=f"LaTeX Compiler Error (pass {pass_num}):\n{short_error}",
                )

        # Two passes — needed for correct cross-references, TOC, etc.
        run_pass(1)
        run_pass(2)

        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF generation failed silently.")

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

    logger.info("PDF compiled successfully (%.0f bytes)", len(pdf_bytes))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"X-PDF-Size": str(len(pdf_bytes))},
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "model": GEMINI_MODEL}