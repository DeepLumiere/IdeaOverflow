"""
Template Mapping Engine
========================
Maps the parsed document structure (AST from section detection)
into the Typst-compatible JSON data model that templates consume.

Pipeline position:
    Section Detection → **Template Mapper** → Typst Generation / Compilation

Mapping rules:
    document.title      → template  title
    document.authors    → template  authors (name + affiliation)
    document.abstract   → template  content[0] (section with "Abstract")
    document.sections   → template  content   (section blocks)
    document.references → template  references (parsed citation list)
"""

import os
import re

# ── Paths ──
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(BASE_DIR, "typst", "templates")

# ── Valid conferences & layouts ──
CONFERENCES = ("ieee", "acm", "neurips", "springer", "elsevier")
LAYOUTS = ("single-column", "double-column")


def list_templates() -> list[dict]:
    """Return all available conference + layout combinations."""
    templates = []
    for conf in CONFERENCES:
        for layout in LAYOUTS:
            path = os.path.join(TEMPLATES_DIR, conf, f"{layout}.typ")
            templates.append({
                "conference": conf,
                "layout": layout,
                "available": os.path.isfile(path),
            })
    return templates


def get_template_path(conference: str, layout: str) -> str:
    """Resolve the .typ file path for a given conference + layout."""
    conference = conference.lower().strip()
    layout = layout.lower().strip()

    if conference not in CONFERENCES:
        raise ValueError(
            f"Unknown conference '{conference}'. "
            f"Choose from: {', '.join(CONFERENCES)}"
        )
    if layout not in LAYOUTS:
        raise ValueError(
            f"Unknown layout '{layout}'. "
            f"Choose from: {', '.join(LAYOUTS)}"
        )

    path = os.path.join(TEMPLATES_DIR, conference, f"{layout}.typ")
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Template file not found: {path}")
    return path


# ════════════════════════════════════════════════════════════════════
#  Core mapping:  Section-detector AST  →  Typst-template data model
# ════════════════════════════════════════════════════════════════════

def map_document(document: dict, conference: str, layout: str) -> dict:
    """
    Convert a section-detector document AST into the Typst data model
    that the templates' ``render(data)`` function expects.

    Parameters
    ----------
    document : dict
        The ``"document"`` value from ``/detect-sections`` response.
        Keys: title, authors (list[str]), abstract, keywords,
              sections (list[{heading, content}]), references (str)
    conference : str
        One of: ieee, acm, neurips, springer, elsevier
    layout : str
        One of: single-column, double-column

    Returns
    -------
    dict
        {
          "status": "success",
          "conference": "ieee",
          "layout": "single-column",
          "template_path": "typst/templates/ieee/single-column.typ",
          "data": { ... Typst-compatible JSON ... },
          "typst_code": "... generated .typ source ..."
        }
    """
    if not document:
        return {"status": "error", "error": "No document provided."}

    # Validate template exists
    try:
        template_path = get_template_path(conference, layout)
    except (ValueError, FileNotFoundError) as e:
        return {"status": "error", "error": str(e)}

    # ── Map authors ──
    raw_authors = document.get("authors", [])
    authors = _map_authors(raw_authors)

    # ── Map content blocks ──
    content = []

    # Abstract → first section block
    abstract_text = (document.get("abstract") or "").strip()
    if abstract_text:
        content.append({
            "type": "section",
            "title": "Abstract",
            "content": _text_to_paragraphs(abstract_text),
        })

    # Body sections (prefer nested hierarchy when available)
    nested_sections = document.get("nested_sections") or []
    if nested_sections:
        content.extend(_map_nested_sections(nested_sections))
    else:
        for section in document.get("sections", []):
            heading = section.get("heading", "Untitled")
            body = (section.get("content") or "").strip()
            content.append({
                "type": "section",
                "title": heading,
                "content": _text_to_paragraphs(body),
            })

    # ── Map references ──
    references = _parse_references(document.get("references", ""))

    # ── Assemble Typst data model ──
    typst_data = {
        "title": document.get("title", "Untitled"),
        "authors": authors,
        "content": content,
        "references": references,
    }

    # ── Generate the .typ source file ──
    typst_code = _generate_typst_source(typst_data, conference, layout)

    rel_template = os.path.relpath(template_path, BASE_DIR).replace("\\", "/")

    return {
        "status": "success",
        "conference": conference.lower(),
        "layout": layout.lower(),
        "template_path": rel_template,
        "data": typst_data,
        "typst_code": typst_code,
    }


# ════════════════════════════════════════════════════════════════════
#  Internal helpers
# ════════════════════════════════════════════════════════════════════

def _map_authors(raw_authors: list) -> list[dict]:
    """
    Convert author strings into {name, affiliation} dicts.
    If authors are already dicts, pass them through.
    """
    mapped = []
    for author in raw_authors:
        if isinstance(author, dict):
            mapped.append({
                "name": author.get("name", "Unknown"),
                "affiliation": author.get("affiliation", ""),
            })
        elif isinstance(author, str):
            mapped.append({
                "name": author.strip(),
                "affiliation": "",
            })
    # Ensure at least one author placeholder
    if not mapped:
        mapped.append({"name": "Author", "affiliation": ""})
    return mapped


def _text_to_paragraphs(text: str) -> list[dict]:
    """
    Split a block of text into paragraph content items.
    Blank-line-separated chunks become individual paragraphs.
    """
    if not text:
        return []

    paragraphs = []
    chunks = re.split(r"\n\s*\n", text.strip())
    for chunk in chunks:
        clean = " ".join(chunk.split())
        if clean:
            paragraphs.append({"type": "paragraph", "text": clean})
    return paragraphs


def _map_nested_sections(nested_sections: list[dict]) -> list[dict]:
    """Map detector nested_sections into Typst section/subsection blocks."""
    mapped: list[dict] = []

    for sec in nested_sections:
        section_block = {
            "type": "section",
            "title": sec.get("heading", "Untitled"),
            "content": _text_to_paragraphs((sec.get("content") or "").strip()),
        }

        for sub in sec.get("subsections", []) or []:
            subsection_block = {
                "type": "subsection",
                "title": sub.get("heading", "Untitled"),
                "content": _text_to_paragraphs((sub.get("content") or "").strip()),
            }

            for subsub in sub.get("subsections", []) or []:
                subsub_block = {
                    "type": "subsubsection",
                    "title": subsub.get("heading", "Untitled"),
                    "content": _text_to_paragraphs((subsub.get("content") or "").strip()),
                }
                subsection_block["content"].append(subsub_block)

            section_block["content"].append(subsection_block)

        mapped.append(section_block)

    return mapped


def _parse_references(raw_references: str) -> list[dict]:
    """
    Parse a raw references block into structured citation entries.
    Handles numbered references like [1], [2] or 1. 2. etc.
    """
    if not raw_references or not raw_references.strip():
        return []

    references = []
    lines = raw_references.strip().split("\n")

    # Try to split by numbered patterns: [1], [2], ... or 1. 2. ...
    current_ref = ""
    ref_id = 0

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if line starts a new reference
        # Matches: [1] ..., 1. ..., 1) ..., [1]. ...
        num_match = re.match(r"^\[?(\d+)\]?[\.\)\s]\s*(.*)$", stripped)
        if num_match:
            # Save previous reference
            if current_ref:
                ref_id += 1
                references.append({
                    "id": f"ref{ref_id}",
                    "citation": current_ref.strip(),
                })
            current_ref = num_match.group(2)
        else:
            # Continuation of current reference
            current_ref += " " + stripped

    # Don't forget the last one
    if current_ref:
        ref_id += 1
        references.append({
            "id": f"ref{ref_id}",
            "citation": current_ref.strip(),
        })

    # If no numbered pattern found, treat each non-empty line as a reference
    if not references:
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped:
                references.append({
                    "id": f"ref{i}",
                    "citation": stripped,
                })

    return references


def _escape_typst(text: str) -> str:
    """Escape special Typst characters in plain text strings."""
    text = text.replace("\\", "\\\\")
    text = text.replace('"', '\\"')
    return text


def _generate_typst_source(data: dict, conference: str, layout: str) -> str:
    """
    Generate a complete .typ source file that imports the template
    and calls render(data) with the mapped JSON data inlined.
    """
    lines = []

    # Header comment
    lines.append(f'// Auto-generated Typst document — {conference.upper()} {layout}')
    lines.append(f'// Template: templates/{conference}/{layout}.typ')
    lines.append("")

    # Import the template
    rel_import = f"templates/{conference}/{layout}.typ"
    lines.append(f'#import "{rel_import}": render')
    lines.append("")

    # Build the data literal
    lines.append("#render((")

    # Title
    lines.append(f'  title: "{_escape_typst(data["title"])}",')
    lines.append("")

    # Authors
    lines.append("  authors: (")
    for author in data["authors"]:
        name = _escape_typst(author["name"])
        affil = _escape_typst(author.get("affiliation", ""))
        lines.append(f'    (name: "{name}", affiliation: "{affil}"),')
    lines.append("  ),")
    lines.append("")

    # Content blocks
    lines.append("  content: (")
    for block in data["content"]:
        _render_content_block(block, lines, indent=4)
    lines.append("  ),")
    lines.append("")

    # References
    if data.get("references"):
        lines.append("  references: (")
        for ref in data["references"]:
            ref_id = _escape_typst(ref["id"])
            citation = _escape_typst(ref["citation"])
            lines.append(f'    (id: "{ref_id}", citation: "{citation}"),')
        lines.append("  ),")
    else:
        lines.append("  references: (),")

    lines.append("))")
    lines.append("")

    return "\n".join(lines)


def _render_content_block(block: dict, lines: list, indent: int = 4) -> None:
    """Recursively render a content block into Typst source lines."""
    pad = " " * indent
    block_type = block.get("type", "paragraph")

    if block_type in ("section", "subsection", "subsubsection"):
        title = _escape_typst(block.get("title", ""))
        lines.append(f'{pad}(type: "{block_type}", title: "{title}", content: (')
        for child in block.get("content", []):
            _render_content_block(child, lines, indent + 2)
        lines.append(f"{pad})),")

    elif block_type == "paragraph":
        text = _escape_typst(block.get("text", ""))
        lines.append(f'{pad}(type: "paragraph", text: "{text}"),')

    elif block_type == "equation":
        math = _escape_typst(block.get("math", ""))
        lines.append(f'{pad}(type: "equation", math: "{math}"),')
