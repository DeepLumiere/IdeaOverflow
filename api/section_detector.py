"""
Section Detection Engine
=========================
Takes cleaned text and detects the logical structure of a research paper.
Produces a structured Document AST:

    {
        "title": "...",
        "authors": ["..."],
        "abstract": "...",
        "keywords": ["..."],
        "sections": [
            {"heading": "Introduction", "content": "..."},
            {"heading": "Methodology", "content": "..."}
        ],
        "references": "..."
    }

Detection uses rule-based regex matching with heuristic fallbacks.
"""

import re
from typing import Optional


# ════════════════════════════════════════════════════════════════════
#  Known section heading patterns (case-insensitive)
# ════════════════════════════════════════════════════════════════════

# Ordered roughly by typical appearance in a paper
KNOWN_SECTIONS = [
    "abstract",
    "keywords",
    "introduction",
    "related work",
    "literature review",
    "background",
    "preliminary",
    "preliminaries",
    "problem statement",
    "problem definition",
    "motivation",
    "methodology",
    "methods",
    "method",
    "proposed method",
    "proposed approach",
    "approach",
    "model",
    "system design",
    "system architecture",
    "architecture",
    "implementation",
    "experimental setup",
    "experiments",
    "experiment",
    "evaluation",
    "results",
    "results and discussion",
    "discussion",
    "analysis",
    "ablation study",
    "ablation",
    "limitations",
    "future work",
    "conclusion",
    "conclusions",
    "conclusion and future work",
    "conclusions and future work",
    "summary",
    "acknowledgment",
    "acknowledgments",
    "acknowledgement",
    "acknowledgements",
    "references",
    "bibliography",
    "appendix",
    "appendices",
    "supplementary material",
]

# Heading pattern: optional numbering + known heading text
# Matches: "1. Introduction", "I. Introduction", "3) Methodology", "ABSTRACT", etc.
_NUM_PREFIX = r"(?:(?:section\s+)?\d+[\.\)]\s*|[IVXLC]+[\.\)]\s*|section\s+\d+:\s*)?"
_HEADING_RE = re.compile(
    r"^\s*" + _NUM_PREFIX + r"(" + "|".join(re.escape(s) for s in KNOWN_SECTIONS) + r")\s*$",
    re.IGNORECASE | re.MULTILINE,
)


def detect_sections(clean_text: str) -> dict:
    """
    Detect sections in cleaned text and return a structured document AST.

    Returns:
        {
            "status": "success",
            "document": {
                "title": "...",
                "authors": [...],
                "abstract": "...",
                "keywords": [...],
                "sections": [{"heading": "...", "content": "..."}],
                "references": "..."
            }
        }
    """
    if not clean_text or not clean_text.strip():
        return {
            "status": "error",
            "document": None,
            "error": "No text provided for section detection.",
        }

    lines = clean_text.strip().split("\n")

    # ── Step 1: Find all heading positions ──────────────────────────
    heading_positions = _find_headings(lines)

    # ── Step 2: Extract title (text before first heading) ───────────
    title = _extract_title(lines, heading_positions)

    # ── Step 3: Extract authors (heuristic: lines after title, before first section)
    authors = _extract_authors(lines, heading_positions)

    # ── Step 4: Split text into sections ────────────────────────────
    raw_sections = _split_into_sections(lines, heading_positions)

    # ── Step 5: Separate abstract, keywords, references from body sections
    abstract = ""
    keywords = []
    references = ""
    body_sections = []

    for sec in raw_sections:
        heading_lower = sec["heading"].lower()
        if heading_lower == "abstract":
            abstract = sec["content"]
        elif heading_lower == "keywords":
            keywords = _parse_keywords(sec["content"])
        elif heading_lower in ("references", "bibliography"):
            references = sec["content"]
        else:
            body_sections.append(sec)

    document = {
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "keywords": keywords,
        "sections": body_sections,
        "references": references,
    }

    return {
        "status": "success",
        "document": document,
        "section_count": len(body_sections),
    }


# ════════════════════════════════════════════════════════════════════
#  Internal helpers
# ════════════════════════════════════════════════════════════════════


def _find_headings(lines: list[str]) -> list[tuple[int, str]]:
    """
    Find lines that match known section headings.
    Returns list of (line_index, normalised_heading_name).
    """
    headings = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue

        m = _HEADING_RE.match(stripped)
        if m:
            # Normalise the heading to title case
            heading_text = m.group(1).strip().title()
            headings.append((i, heading_text))
            continue

        # Heuristic fallback: short ALL-CAPS line that matches known headings
        if stripped.isupper() and stripped.lower() in [s.lower() for s in KNOWN_SECTIONS]:
            headings.append((i, stripped.title()))
            continue

        # Heuristic: Markdown-style heading (## Heading)
        md_match = re.match(r"^#{1,4}\s+(.+)$", stripped)
        if md_match:
            heading_candidate = md_match.group(1).strip()
            if heading_candidate.lower() in [s.lower() for s in KNOWN_SECTIONS]:
                headings.append((i, heading_candidate.title()))
                continue
            # Even if not a known heading, treat markdown headings as section breaks
            headings.append((i, heading_candidate))

    return headings


def _extract_title(lines: list[str], headings: list[tuple[int, str]]) -> str:
    """
    Extract the title: non-empty lines before the first heading.
    Usually the first substantial line(s) of the document.
    """
    first_heading_idx = headings[0][0] if headings else len(lines)

    title_lines = []
    for i in range(min(first_heading_idx, len(lines))):
        stripped = lines[i].strip()
        if stripped:
            title_lines.append(stripped)
        elif title_lines:
            # Stop at first blank line after collecting some text
            break

    return " ".join(title_lines) if title_lines else ""


def _extract_authors(lines: list[str], headings: list[tuple[int, str]]) -> list[str]:
    """
    Heuristic: authors appear after title, before the first known heading.
    Look for lines that look like names (short, no sentence structure).
    """
    first_heading_idx = headings[0][0] if headings else len(lines)

    # Find where title ends
    title_end = 0
    found_title = False
    for i in range(first_heading_idx):
        stripped = lines[i].strip()
        if stripped and not found_title:
            found_title = True
        elif not stripped and found_title:
            title_end = i + 1
            break

    authors = []
    for i in range(title_end, first_heading_idx):
        stripped = lines[i].strip()
        if not stripped:
            continue
        # Heuristics: author lines are typically short, contain commas or "and"
        # and don't look like sentences (no period at end, relatively short)
        if len(stripped) < 100 and not stripped.endswith("."):
            # Split by comma, semicolon, or " and "
            parts = re.split(r"[,;]\s*|\s+and\s+", stripped)
            for part in parts:
                part = part.strip()
                if part and len(part) > 2 and not part.lower().startswith(("university", "dept", "department", "institute", "school", "college", "faculty")):
                    # Basic name check: has at least 2 words, each capitalized
                    words = part.split()
                    if 1 <= len(words) <= 5 and all(w[0].isupper() or w in ("de", "van", "von", "di", "el", "al") for w in words if w):
                        authors.append(part)

    return authors


def _split_into_sections(lines: list[str], headings: list[tuple[int, str]]) -> list[dict]:
    """
    Split the document into sections based on detected heading positions.
    """
    if not headings:
        # No headings found — return entire text as a single section
        content = "\n".join(lines).strip()
        return [{"heading": "Body", "content": content}] if content else []

    sections = []
    for idx, (line_idx, heading) in enumerate(headings):
        # Content runs from the line after this heading to the line before the next heading
        start = line_idx + 1
        end = headings[idx + 1][0] if idx + 1 < len(headings) else len(lines)

        content_lines = lines[start:end]
        content = "\n".join(content_lines).strip()
        sections.append({"heading": heading, "content": content})

    return sections


def _parse_keywords(text: str) -> list[str]:
    """Parse a keywords string into a list."""
    if not text.strip():
        return []
    # Keywords are typically comma or semicolon separated
    parts = re.split(r"[,;]\s*", text.strip())
    return [kw.strip() for kw in parts if kw.strip()]
