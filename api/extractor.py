"""
Input Layer — Text Extraction Module
=====================================
Extracts raw text from uploaded documents.
Supported: PDF, DOCX, TXT, MD
"""

import os
import tempfile
from pathlib import Path


def extract_text(file_bytes: bytes, filename: str) -> dict:
    """
    Extract raw text from file bytes based on the file extension.

    Returns:
        {
            "status": "success",
            "filename": "paper.docx",
            "format": "docx",
            "raw_text": "Deep Learning for OCR\n\nAbstract\nThis paper..."
        }
    """
    ext = Path(filename).suffix.lower()

    extractors = {
        ".pdf": _extract_pdf,
        ".docx": _extract_docx,
        ".txt": _extract_txt,
        ".md": _extract_markdown,
        ".tex": _extract_txt,  # LaTeX is plain text
    }

    extractor = extractors.get(ext)
    if not extractor:
        return {
            "status": "error",
            "filename": filename,
            "format": ext.lstrip("."),
            "raw_text": "",
            "error": f"Unsupported format: {ext}. Supported: .pdf, .docx, .txt, .md, .tex",
        }

    try:
        raw_text = extractor(file_bytes)
        return {
            "status": "success",
            "filename": filename,
            "format": ext.lstrip("."),
            "raw_text": raw_text,
            "char_count": len(raw_text),
            "word_count": len(raw_text.split()),
        }
    except Exception as e:
        return {
            "status": "error",
            "filename": filename,
            "format": ext.lstrip("."),
            "raw_text": "",
            "error": str(e),
        }


# ── PDF Extraction ──────────────────────────────────────────────────

def _extract_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    import fitz  # PyMuPDF

    text_parts = []

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        doc = fitz.open(tmp_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text("text")
            if page_text.strip():
                text_parts.append(page_text)
        doc.close()
    finally:
        os.unlink(tmp_path)

    return "\n\n".join(text_parts)


# ── DOCX Extraction ────────────────────────────────────────────────

def _extract_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    from docx import Document
    import io

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)

    # Also extract text from tables
    for table in doc.tables:
        for row in table.rows:
            row_text = "\t".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                paragraphs.append(row_text)

    return "\n\n".join(paragraphs)


# ── TXT / LaTeX Extraction ─────────────────────────────────────────

def _extract_txt(file_bytes: bytes) -> str:
    """Extract text from plain text or LaTeX files."""
    # Try UTF-8 first, then fallback to latin-1
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1", errors="replace")


# ── Markdown Extraction ─────────────────────────────────────────────

def _extract_markdown(file_bytes: bytes) -> str:
    """Extract text from Markdown (returns raw Markdown text)."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1", errors="replace")

    return text
