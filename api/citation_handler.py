"""
Citation Handling Engine
=========================
Extracts raw references from the document model, looks them up
via the Crossref API to retrieve proper metadata, and formats
them into conference-specific citation styles.

Supported citation styles:
    IEEE, ACM, APA (NeurIPS), Springer (LNCS numbered), Elsevier (numbered)

Pipeline position:
    Section Detection → **Citation Handler** → Template Mapper → Typst Generation
"""

import re
import logging
from urllib.parse import quote_plus
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ── Timeout for external API calls ──
API_TIMEOUT = 10.0  # seconds

# ════════════════════════════════════════════════════════════════════
#  Public API
# ════════════════════════════════════════════════════════════════════


async def format_citations(
    raw_references: str | list[str],
    style: str = "ieee",
) -> dict:
    """
    Accept raw reference strings, resolve metadata via Crossref,
    and return formatted citations in the requested style.

    Parameters
    ----------
    raw_references : str or list[str]
        Either a newline-separated block of references or a list of
        individual reference strings.
    style : str
        Citation style: ieee | acm | neurips | springer | elsevier

    Returns
    -------
    dict
        {
          "status": "success",
          "style": "ieee",
          "references": [
             {"id": "ref1", "citation": "[1] A. Vaswani et al., ..."},
             ...
          ],
          "unresolved": ["raw text that couldn't be looked up"]
        }
    """
    style = style.lower().strip()
    if style not in FORMATTERS:
        return {
            "status": "error",
            "error": f"Unknown style '{style}'. Choose from: {', '.join(FORMATTERS)}",
        }

    # Normalise input to a list of raw strings
    if isinstance(raw_references, str):
        raw_list = _split_raw_references(raw_references)
    else:
        raw_list = [r.strip() for r in raw_references if r.strip()]

    if not raw_list:
        return {
            "status": "success",
            "style": style,
            "references": [],
            "unresolved": [],
        }

    references = []
    unresolved = []
    formatter = FORMATTERS[style]

    async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
        for idx, raw in enumerate(raw_list, 1):
            ref_id = f"ref{idx}"

            # Try to look up via Crossref
            metadata = await _lookup_crossref(client, raw)

            if metadata:
                citation_text = formatter(metadata, idx)
                references.append({"id": ref_id, "citation": citation_text})
            else:
                # Fallback: use the raw text with numbering
                fallback = _fallback_format(raw, idx, style)
                references.append({"id": ref_id, "citation": fallback})
                unresolved.append(raw)

    return {
        "status": "success",
        "style": style,
        "references": references,
        "unresolved": unresolved,
    }


# ════════════════════════════════════════════════════════════════════
#  Crossref API lookup
# ════════════════════════════════════════════════════════════════════

CROSSREF_API = "https://api.crossref.org/works"


async def _lookup_crossref(client: httpx.AsyncClient, raw_ref: str) -> Optional[dict]:
    """
    Query Crossref with a raw reference string and return parsed metadata.
    Returns None if the lookup fails or no good match is found.
    """
    # Clean the query — strip numbering prefixes like [1], 1., etc.
    query = re.sub(r"^\[?\d+\]?[\.\)\s]*", "", raw_ref).strip()
    if not query:
        return None

    try:
        resp = await client.get(
            CROSSREF_API,
            params={
                "query.bibliographic": query,
                "rows": 1,
                "select": "title,author,container-title,published-print,published-online,DOI,type",
            },
            headers={"User-Agent": "IdeaOverflow/1.0 (citation-handler)"},
        )
        if resp.status_code != 200:
            logger.warning("Crossref returned %d for query: %s", resp.status_code, query[:80])
            return None

        data = resp.json()
        items = data.get("message", {}).get("items", [])
        if not items:
            return None

        item = items[0]

        # Extract metadata
        title = ""
        titles = item.get("title", [])
        if titles:
            title = titles[0]

        authors = []
        for a in item.get("author", []):
            given = a.get("given", "")
            family = a.get("family", "")
            authors.append({"given": given, "family": family})

        venue = ""
        containers = item.get("container-title", [])
        if containers:
            venue = containers[0]

        year = ""
        pub = item.get("published-print") or item.get("published-online")
        if pub and pub.get("date-parts"):
            parts = pub["date-parts"][0]
            if parts:
                year = str(parts[0])

        doi = item.get("DOI", "")

        if not title:
            return None

        return {
            "title": title,
            "authors": authors,
            "venue": venue,
            "year": year,
            "doi": doi,
        }

    except Exception as e:
        logger.warning("Crossref lookup failed: %s", e)
        return None


# ════════════════════════════════════════════════════════════════════
#  Citation formatters — one per style
# ════════════════════════════════════════════════════════════════════


def _format_authors_initials(authors: list[dict], max_authors: int = 3) -> str:
    """Format as 'A. B. Vaswani, C. D. Shazeer, ..., et al.'"""
    if not authors:
        return ""

    formatted = []
    for a in authors[:max_authors]:
        given = a.get("given", "")
        family = a.get("family", "")
        initials = ". ".join(g[0] for g in given.split() if g) + "." if given else ""
        formatted.append(f"{initials} {family}".strip())

    result = ", ".join(formatted)
    if len(authors) > max_authors:
        result += " et al."
    return result


def _format_authors_full(authors: list[dict], max_authors: int = 3) -> str:
    """Format as 'Vaswani, A., Shazeer, N., ..., et al.'"""
    if not authors:
        return ""

    formatted = []
    for a in authors[:max_authors]:
        given = a.get("given", "")
        family = a.get("family", "")
        initials = ". ".join(g[0] for g in given.split() if g) + "." if given else ""
        formatted.append(f"{family}, {initials}".strip(", "))

    result = ", ".join(formatted)
    if len(authors) > max_authors:
        result += ", et al."
    return result


def _ieee_format(meta: dict, num: int) -> str:
    """
    IEEE style: [1] A. B. Author, C. D. Author, "Title," Venue, year.
    """
    authors = _format_authors_initials(meta["authors"])
    title = meta["title"]
    venue = meta["venue"]
    year = meta["year"]

    parts = [f'[{num}]']
    if authors:
        parts.append(f'{authors},')
    parts.append(f'"{title},"')
    if venue:
        parts.append(f'_{venue}_,')
    if year:
        parts.append(f'{year}.')
    else:
        # End the last part with a period
        if parts:
            parts[-1] = parts[-1].rstrip(",") + "."

    return " ".join(parts)


def _acm_format(meta: dict, num: int) -> str:
    """
    ACM style: [1] Author, A., Author, B. Year. Title. Venue.
    """
    authors = _format_authors_full(meta["authors"])
    title = meta["title"]
    venue = meta["venue"]
    year = meta["year"]

    parts = [f'[{num}]']
    if authors:
        parts.append(f'{authors}.')
    if year:
        parts.append(f'{year}.')
    parts.append(f'{title}.')
    if venue:
        parts.append(f'_{venue}_.')

    return " ".join(parts)


def _neurips_format(meta: dict, num: int) -> str:
    """
    NeurIPS / APA-like: Author, A., Author, B. (Year). Title. Venue.
    """
    authors = _format_authors_full(meta["authors"])
    title = meta["title"]
    venue = meta["venue"]
    year = meta["year"]

    parts = [f'[{num}]']
    if authors:
        parts.append(authors)
    if year:
        parts.append(f'({year}).')
    else:
        if parts[-1] and not parts[-1].endswith("."):
            parts[-1] += "."
    parts.append(f'{title}.')
    if venue:
        parts.append(f'_{venue}_.')

    return " ".join(parts)


def _springer_format(meta: dict, num: int) -> str:
    """
    Springer LNCS: num. Author, A., Author, B.: Title. Venue (Year)
    """
    authors = _format_authors_full(meta["authors"])
    title = meta["title"]
    venue = meta["venue"]
    year = meta["year"]

    parts = [f'{num}.']
    if authors:
        parts.append(f'{authors}:')
    parts.append(f'{title}.')
    if venue and year:
        parts.append(f'_{venue}_ ({year}).')
    elif venue:
        parts.append(f'_{venue}_.')
    elif year:
        parts.append(f'({year}).')

    return " ".join(parts)


def _elsevier_format(meta: dict, num: int) -> str:
    """
    Elsevier numbered: [1] Author A, Author B. Title. Venue. Year.
    """
    authors = _format_authors_initials(meta["authors"], max_authors=5)
    title = meta["title"]
    venue = meta["venue"]
    year = meta["year"]

    parts = [f'[{num}]']
    if authors:
        parts.append(f'{authors}.')
    parts.append(f'{title}.')
    if venue:
        parts.append(f'_{venue}_.')
    if year:
        parts.append(f'{year}.')

    return " ".join(parts)


# ── Formatter registry ──
FORMATTERS = {
    "ieee": _ieee_format,
    "acm": _acm_format,
    "neurips": _neurips_format,
    "springer": _springer_format,
    "elsevier": _elsevier_format,
}


# ════════════════════════════════════════════════════════════════════
#  Fallback formatting (when Crossref lookup fails)
# ════════════════════════════════════════════════════════════════════

def _fallback_format(raw: str, num: int, style: str) -> str:
    """Format a raw reference string with simple numbering when lookup fails."""
    # Strip any existing numbering prefix
    cleaned = re.sub(r"^\[?\d+\]?[\.\)\s]*", "", raw).strip()

    if style in ("ieee", "acm", "elsevier"):
        return f"[{num}] {cleaned}"
    elif style == "springer":
        return f"{num}. {cleaned}"
    else:
        return f"[{num}] {cleaned}"


# ════════════════════════════════════════════════════════════════════
#  Helper: split a raw references block into individual entries
# ════════════════════════════════════════════════════════════════════

def _split_raw_references(text: str) -> list[str]:
    """
    Split a raw references text block into individual reference strings.
    Handles numbered [1], 1., 1) patterns, and plain newline-separated entries.
    """
    if not text or not text.strip():
        return []

    lines = text.strip().split("\n")

    # Try splitting by numbered patterns
    entries = []
    current = ""

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if re.match(r"^\[?\d+\]?[\.\)\s]", stripped):
            if current:
                entries.append(current.strip())
            current = stripped
        else:
            current += " " + stripped

    if current:
        entries.append(current.strip())

    # If no numbered patterns found, treat each non-empty line as a reference
    if not entries:
        entries = [l.strip() for l in lines if l.strip()]

    return entries
