"""
Text Cleaning Layer
====================
Takes raw extracted text and removes noise:
  - page numbers
  - headers / footers
  - duplicate whitespace
  - broken lines (mid-sentence line breaks)
Normalises headings for downstream section detection.
"""

import re


def clean_text(raw_text: str) -> dict:
    """
    Clean raw extracted text and return a result dict.

    Returns:
        {
            "status": "success",
            "clean_text": "...",
            "original_length": 12345,
            "cleaned_length": 11000
        }
    """
    if not raw_text or not raw_text.strip():
        return {
            "status": "error",
            "clean_text": "",
            "original_length": 0,
            "cleaned_length": 0,
            "error": "No text provided for cleaning.",
        }

    original_length = len(raw_text)
    text = raw_text

    # ── 1. Remove page numbers ─────────────────────────────────────
    text = _remove_page_numbers(text)

    # ── 2. Remove common headers / footers ─────────────────────────
    text = _remove_headers_footers(text)

    # ── 3. Merge broken lines ──────────────────────────────────────
    text = _merge_broken_lines(text)

    # ── 4. Normalize headings ──────────────────────────────────────
    text = _normalize_headings(text)

    # ── 5. Remove duplicate whitespace ─────────────────────────────
    text = _remove_duplicate_whitespace(text)

    # Final trim
    text = text.strip()

    return {
        "status": "success",
        "clean_text": text,
        "original_length": original_length,
        "cleaned_length": len(text),
    }


# ════════════════════════════════════════════════════════════════════
#  Cleaning helpers
# ════════════════════════════════════════════════════════════════════


def _remove_page_numbers(text: str) -> str:
    """Remove standalone page numbers (e.g. '  3  ', '- 12 -', 'Page 5')."""
    # Lines that are just a number (with optional whitespace / dashes)
    text = re.sub(r"(?m)^\s*[-–—]?\s*\d{1,4}\s*[-–—]?\s*$", "", text)
    # "Page N" or "page N of M" lines
    text = re.sub(r"(?mi)^\s*page\s+\d+(\s+of\s+\d+)?\s*$", "", text)
    return text


def _remove_headers_footers(text: str) -> str:
    """Remove common header/footer patterns found in extracted PDFs."""
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        stripped = line.strip()
        # Skip lines that look like running headers (all caps, very short)
        if stripped and len(stripped) < 80 and stripped.isupper() and not any(
            kw in stripped
            for kw in [
                "ABSTRACT",
                "INTRODUCTION",
                "CONCLUSION",
                "METHODOLOGY",
                "RESULTS",
                "DISCUSSION",
                "REFERENCES",
                "RELATED WORK",
                "BACKGROUND",
                "EXPERIMENTS",
                "ACKNOWLEDGMENT",
                "APPENDIX",
            ]
        ):
            # Heuristic: short all-caps lines that aren't known section headings
            # are likely running headers — but only if they are suspiciously short
            if len(stripped) < 20:
                continue
        cleaned.append(line)
    return "\n".join(cleaned)


def _merge_broken_lines(text: str) -> str:
    """
    Merge lines that were broken mid-sentence by PDF extraction.
    A line is considered "broken" if it ends with a lowercase letter
    or comma and the next line starts with a lowercase letter.
    """
    lines = text.split("\n")
    merged = []
    i = 0
    while i < len(lines):
        current = lines[i]
        # Check if this line should be merged with the next one
        while (
            i + 1 < len(lines)
            and current.rstrip()  # current line isn't empty
            and lines[i + 1].strip()  # next line isn't empty
            and _should_merge(current.rstrip(), lines[i + 1].strip())
        ):
            # Join without newline (add a space if needed)
            current = current.rstrip() + " " + lines[i + 1].strip()
            i += 1
        merged.append(current)
        i += 1
    return "\n".join(merged)


def _should_merge(current_line: str, next_line: str) -> bool:
    """Decide if two lines should be merged (broken mid-sentence)."""
    if not current_line or not next_line:
        return False
    # If current line ends with a hyphen (word break), merge
    if current_line.endswith("-") and next_line[0].islower():
        return True
    # If current line ends mid-word/sentence (lowercase, comma, semicolon)
    # and next line starts with a lowercase letter
    if current_line[-1] in "abcdefghijklmnopqrstuvwxyz,;:" and next_line[0].islower():
        return True
    return False


def _normalize_headings(text: str) -> str:
    """
    Normalise section headings to a consistent format.
    Handles numbered headings like '1. Introduction', 'I. Introduction',
    'Section 1: Introduction', as well as ALL-CAPS headings.
    """
    known_headings = [
        "abstract",
        "introduction",
        "related work",
        "literature review",
        "background",
        "methodology",
        "methods",
        "method",
        "proposed method",
        "proposed approach",
        "approach",
        "experiments",
        "experimental setup",
        "experimental results",
        "results",
        "results and discussion",
        "discussion",
        "conclusion",
        "conclusions",
        "future work",
        "acknowledgment",
        "acknowledgments",
        "acknowledgement",
        "acknowledgements",
        "references",
        "bibliography",
        "appendix",
    ]

    lines = text.split("\n")
    normalised = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            normalised.append(line)
            continue

        # Remove leading numbering: "1.", "1)", "I.", "II.", "Section 1:", etc.
        heading_candidate = re.sub(
            r"^(?:section\s+)?\d+[\.\)]\s*", "", stripped, flags=re.IGNORECASE
        )
        heading_candidate = re.sub(
            r"^(?:section\s+)?[IVXLC]+[\.\)]\s*", "", heading_candidate
        )
        heading_candidate = re.sub(
            r"^(?:section\s+\d+:\s*)", "", heading_candidate, flags=re.IGNORECASE
        )

        # Check if it matches a known heading (case-insensitive)
        if heading_candidate.lower() in known_headings:
            # Title-case the heading
            normalised.append(heading_candidate.title())
        elif stripped.isupper() and stripped.lower() in known_headings:
            normalised.append(stripped.title())
        else:
            normalised.append(line)

    return "\n".join(normalised)


def _remove_duplicate_whitespace(text: str) -> str:
    """Collapse multiple spaces to one and multiple blank lines to at most two."""
    # Multiple spaces → single space (per line)
    text = re.sub(r"[^\S\n]+", " ", text)
    # More than 2 consecutive newlines → exactly 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text
