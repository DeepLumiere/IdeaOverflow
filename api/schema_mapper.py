"""
Schema Mapper
=============
Transforms the Section Detector AST into the paper-schema.json format,
normalises missing fields, validates against the JSON Schema, and
writes the result to a downloadable JSON file.

Pipeline:
    AST → Schema Mapping → Field Normalisation → Validation → JSON File
"""

import json
import os
from pathlib import Path

import jsonschema

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "typst" / "paper-schema.json"
OUTPUTS_DIR = BASE_DIR / "outputs"


def _load_schema() -> dict:
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Step 1: Schema Mapping ─────────────────────────────────────────

def _map_ast_to_schema(ast: dict) -> dict:
    """
    Map AST field names to schema field names.
    Key mapping: keywords → index_terms, authors enriched with extra fields.
    """
    authors = []
    for a in (ast.get("authors") or []):
        if isinstance(a, str):
            authors.append({
                "name": a,
                "department": "",
                "organization": "",
                "location": "",
                "email": "",
            })
        elif isinstance(a, dict):
            authors.append({
                "name": a.get("name", ""),
                "department": a.get("department", ""),
                "organization": a.get("organization", a.get("affiliation", "")),
                "location": a.get("location", ""),
                "email": a.get("email", ""),
            })

    sections = []
    for s in (ast.get("sections") or []):
        sections.append({
            "heading": s.get("heading", ""),
            "content": s.get("content", ""),
        })

    return {
        "title": ast.get("title", ""),
        "abstract": ast.get("abstract", ""),
        "index_terms": ast.get("keywords") or ast.get("index_terms") or [],
        "authors": authors,
        "sections": sections,
    }


# ── Step 2: Field Normalisation ────────────────────────────────────

def _normalise(schema_obj: dict) -> dict:
    """Ensure every required / optional field has a sensible default."""
    schema_obj.setdefault("title", "")
    schema_obj.setdefault("abstract", "")
    schema_obj.setdefault("index_terms", [])
    schema_obj.setdefault("authors", [])
    schema_obj.setdefault("sections", [])

    for author in schema_obj["authors"]:
        author.setdefault("department", "")
        author.setdefault("organization", "")
        author.setdefault("location", "")
        author.setdefault("email", "")

    return schema_obj


# ── Step 3: JSON Schema Validation ─────────────────────────────────

def _validate(schema_obj: dict) -> list[str]:
    """
    Validate against paper-schema.json.
    Returns a list of error messages (empty if valid).
    """
    schema = _load_schema()
    validator = jsonschema.Draft7Validator(schema)
    errors = sorted(validator.iter_errors(schema_obj), key=lambda e: list(e.absolute_path))
    return [f"{'.'.join(str(p) for p in e.absolute_path) or '(root)'}: {e.message}" for e in errors]


# ── Step 4: JSON File Generation ───────────────────────────────────

def _write_json(schema_obj: dict, filename: str = "paper.json") -> str:
    """Write the validated JSON to the outputs directory. Returns the file path."""
    OUTPUTS_DIR.mkdir(exist_ok=True)
    out_path = OUTPUTS_DIR / filename
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(schema_obj, f, indent=2, ensure_ascii=False)
    return str(out_path)


# ── Public API ─────────────────────────────────────────────────────

def map_and_generate(ast: dict, *, save: bool = True) -> dict:
    """
    Full pipeline: map → normalise → validate → (optionally) save JSON file.

    Returns:
        {
            "status": "success" | "error",
            "data": { ...schema json },
            "json_url": "/outputs/paper.json",   # only when save=True
            "validation_errors": [...]            # only when validation fails
        }
    """
    # Step 1 – mapping
    schema_obj = _map_ast_to_schema(ast)

    # Step 2 – normalisation
    schema_obj = _normalise(schema_obj)

    # Step 3 – validation
    errors = _validate(schema_obj)
    if errors:
        return {
            "status": "error",
            "data": schema_obj,
            "validation_errors": errors,
        }

    # Step 4 – file generation
    if save:
        _write_json(schema_obj)
        return {
            "status": "success",
            "data": schema_obj,
            "json_url": "/outputs/paper.json",
        }

    return {
        "status": "success",
        "data": schema_obj,
    }
