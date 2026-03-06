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
    "index terms",
    "introduction",
    "contributions",
    "main contributions",
    "related work",
    "literature review",
    "background",
    "materials and methods",
    "materials",
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
    "findings",
    "results and discussion",
    "discussion and results",
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
_NUM_PREFIX = r"(?:(?:section\s+)?\d+(?:\.\d+)*[\.\)]?\s*|[IVXLC]+[\.\)]\s*|section\s+\d+:\s*)?"
_HEADING_RE = re.compile(
    r"^\s*" + _NUM_PREFIX + r"(" + "|".join(re.escape(s) for s in KNOWN_SECTIONS) + r")(?:\s*[:.])?\s*$",
    re.IGNORECASE | re.MULTILINE,
)

# Numbered heading pattern for arbitrary headings: "1.2 My Custom Heading"
_NUMBERED_HEADING_RE = re.compile(
    r"^\s*(\d+(?:\.\d+)*)(?:[\.)])?\s+([A-Z][A-Za-z0-9\s,&:'()\-/]{2,100})(?:\s*[:.])?\s*$"
)

_ROMAN_HEADING_RE = re.compile(
    r"^\s*([IVXLC]+)(?:[\.)])\s+([A-Z][A-Za-z0-9\s,&:'()\-/]{2,100})(?:\s*[:.])?\s*$"
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

    # ── Step 6: Nest subsections under parent sections ──────────────
    nested_sections = _nest_sections(body_sections)
    # Flat sections (for backward compatibility with schema_mapper)
    flat_sections = [{"heading": s["heading"], "content": s["content"]} for s in body_sections]

    document = {
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "keywords": keywords,
        "sections": flat_sections,
        "nested_sections": nested_sections,
        "references": references,
    }

    return {
        "status": "success",
        "document": document,
        "section_count": len(flat_sections),
    }


# ════════════════════════════════════════════════════════════════════
#  Internal helpers
# ════════════════════════════════════════════════════════════════════


def _find_headings(lines: list[str]) -> list[tuple[int, str, int]]:
    """
    Find lines that match known section headings.
    Returns list of (line_index, normalised_heading_name, level).
    Level: 1 = section, 2 = subsection, 3 = subsubsection.
    """
    headings = []
    seen_explicit_heading = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue

        m = _HEADING_RE.match(stripped)
        if m:
            heading_text = m.group(1).strip().title()
            headings.append((i, heading_text, _extract_numeric_level(stripped)))
            seen_explicit_heading = True
            continue

        # Heuristic fallback: short ALL-CAPS line that matches known headings
        if stripped.isupper() and stripped.lower().rstrip(":.") in [s.lower() for s in KNOWN_SECTIONS]:
            headings.append((i, stripped.title(), 1))
            seen_explicit_heading = True
            continue

        # Numbered heading with level detection: "1 Intro" (level 1), "1.2 Foo" (level 2)
        num_m = _NUMBERED_HEADING_RE.match(stripped)
        if num_m:
            number_part = num_m.group(1)
            heading_text = num_m.group(2).strip().rstrip(":.")
            level = len(number_part.split("."))
            headings.append((i, heading_text, min(level, 3)))
            seen_explicit_heading = True
            continue

        # Roman numbered headings: "II. Related Work"
        roman_m = _ROMAN_HEADING_RE.match(stripped)
        if roman_m:
            heading_text = roman_m.group(2).strip().rstrip(":.")
            headings.append((i, heading_text, 1))
            seen_explicit_heading = True
            continue

        # Heuristic: Markdown-style heading (## Heading)
        md_match = re.match(r"^#{1,4}\s+(.+)$", stripped)
        if md_match:
            heading_candidate = md_match.group(1).strip()
            level = len(md_match.group(0)) - len(md_match.group(0).lstrip("#"))
            if heading_candidate.lower() in [s.lower() for s in KNOWN_SECTIONS]:
                headings.append((i, heading_candidate.title(), min(level, 3)))
                seen_explicit_heading = True
                continue
            headings.append((i, heading_candidate, min(level, 3)))
            seen_explicit_heading = True

        # Last-resort heuristic for short heading-like lines.
        if seen_explicit_heading and _looks_like_title_case_heading(stripped):
            headings.append((i, stripped.rstrip(":."), 1))

    return headings


def _looks_like_title_case_heading(line: str) -> bool:
    """
    Heuristic for unlabeled heading lines often seen in PDFs.
    Keeps precision by requiring short, title-like lines and excluding
    sentence-like endings.
    """
    candidate = line.strip()
    if not candidate:
        return False

    # Prevent paragraph sentences from being classified as headings.
    if candidate.endswith((".", "?", "!", ";")):
        return False

    words = candidate.split()
    if len(words) < 2 or len(words) > 10:
        return False
    if len(candidate) > 90:
        return False

    # Require title/uppercase style and avoid lines with too many commas.
    starts_upper = candidate[0].isupper()
    uppercase_line = candidate.isupper()
    if not (starts_upper or uppercase_line):
        return False
    if candidate.count(",") > 1:
        return False

    # Require title-like capitalization for most words.
    linker_words = {
        "and", "or", "of", "for", "to", "in", "on", "with", "via", "the", "a", "an", "by", "from", "at"
    }
    alpha_words = [w.strip("()[]{}:;,.!?\"'") for w in words if any(ch.isalpha() for ch in w)]
    if not alpha_words:
        return False

    title_like = 0
    for w in alpha_words:
        lw = w.lower()
        if lw in linker_words:
            title_like += 1
            continue
        if w[0].isupper() or w.isupper():
            title_like += 1

    if title_like / max(len(alpha_words), 1) < 0.8:
        return False

    # Exclude obvious non-headings.
    lowered = candidate.lower()
    if lowered.startswith(("fig", "table", "copyright", "doi", "www.")):
        return False

    return True


def _extract_numeric_level(line: str) -> int:
    """Infer heading level from leading numeric heading notation."""
    m = re.match(r"^\s*(?:section\s+)?(\d+(?:\.\d+)*)(?:[\.)])?\s+", line, flags=re.IGNORECASE)
    if not m:
        return 1
    return min(len(m.group(1).split(".")), 3)


def _extract_title(lines: list[str], headings: list[tuple]) -> str:
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


def _extract_authors(lines: list[str], headings: list[tuple]) -> list[str]:
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


def _split_into_sections(lines: list[str], headings: list[tuple]) -> list[dict]:
    """
    Split the document into sections based on detected heading positions.
    Returns flat list with a 'level' key for each entry.
    """
    if not headings:
        content = "\n".join(lines).strip()
        return [{"heading": "Body", "content": content, "level": 1}] if content else []

    sections = []
    for idx, (line_idx, heading, level) in enumerate(headings):
        start = line_idx + 1
        end = headings[idx + 1][0] if idx + 1 < len(headings) else len(lines)

        content_lines = lines[start:end]
        content = "\n".join(content_lines).strip()
        sections.append({"heading": heading, "content": content, "level": level})

    return sections


def _nest_sections(flat_sections: list[dict]) -> list[dict]:
    """
    Convert flat sections with 'level' into nested structure:
    [{"heading": ..., "content": ..., "subsections": [{"heading": ..., "content": ..., "subsections": [...]}]}]
    Level-1 items become top-level, level-2 nest under the preceding level-1, etc.
    """
    nested: list[dict] = []
    current_l1: dict | None = None
    current_l2: dict | None = None

    for sec in flat_sections:
        level = sec.get("level", 1)
        entry = {"heading": sec["heading"], "content": sec["content"]}

        if level == 1:
            entry["subsections"] = []
            nested.append(entry)
            current_l1 = entry
            current_l2 = None
        elif level == 2 and current_l1 is not None:
            entry["subsections"] = []
            current_l1["subsections"].append(entry)
            current_l2 = entry
        elif level >= 3 and current_l2 is not None:
            current_l2["subsections"].append(entry)
        else:
            # Orphan subsection — promote to top level
            entry["subsections"] = []
            nested.append(entry)
            if level == 1:
                current_l1 = entry
                current_l2 = None

    return nested


def _parse_keywords(text: str) -> list[str]:
    """Parse a keywords string into a list."""
    if not text.strip():
        return []
    # Keywords are typically comma or semicolon separated
    parts = re.split(r"[,;]\s*", text.strip())
    return [kw.strip() for kw in parts if kw.strip()]
