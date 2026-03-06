from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from api import parser
from api import compiler
from api import ai_assistant
from api import extractor
from api import cleaner
from api import section_detector
from api import template_mapper
from api import citation_handler
from api import typst_generator
from api import typst_compiler
from api import schema_mapper
import os
import json
import logging
import TexSoup

try:
    from ai_cleaner import refine_ast as _ai_refine_ast
    _HAS_AI_CLEANER = True
except Exception:
    _HAS_AI_CLEANER = False

logger = logging.getLogger(__name__)

app = FastAPI(title="LaTeX Research Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, lock this down to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve the vanilla HTML/CSS/JS frontend ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend-html")

# Mount static assets (CSS, JS) under /css and /js paths
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")

# Serve generated JSON outputs
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")


class LatexRequest(BaseModel):
    latex_code: str


# ── Input Layer: File Upload & Text Extraction ──

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Accept a research document (PDF, DOCX, TXT, MD, LaTeX)
    and extract raw text from it.

    Returns:
        {
            "status": "success",
            "filename": "paper.docx",
            "format": "docx",
            "raw_text": "Deep Learning for OCR\n\nAbstract\nThis paper...",
            "char_count": 12345,
            "word_count": 2500
        }
    """
    # Validate file size (max 20 MB)
    MAX_SIZE = 20 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20 MB.")

    result = extractor.extract_text(contents, file.filename)

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Extraction failed"))

    return result


# ── Text Cleaning Layer ──

class CleanRequest(BaseModel):
    raw_text: str


@app.post("/clean")
async def clean_document(request: CleanRequest):
    """
    Accept raw extracted text and return cleaned text.
    Removes page numbers, headers/footers, duplicate whitespace,
    merges broken lines, and normalises headings.

    Returns:
        {
            "status": "success",
            "clean_text": "...",
            "original_length": 12345,
            "cleaned_length": 11000
        }
    """
    result = cleaner.clean_text(request.raw_text)

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Cleaning failed"))

    return result


# ── Section Detection Engine ──

class DetectRequest(BaseModel):
    clean_text: str


@app.post("/detect-sections")
async def detect_sections(request: DetectRequest):
    """
    Accept cleaned text and detect the logical sections of the paper.
    Returns a structured Document AST with title, authors, abstract,
    keywords, sections, and references.
    """
    result = section_detector.detect_sections(request.clean_text)

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Section detection failed"))

    return result


@app.post("/parse")
async def parse_latex(request: LatexRequest):
    try:
        ast_data = parser.extract_ast(request.latex_code)
        return {"status": "success", "ast": ast_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsing error: {str(e)}")


@app.post("/compile")
async def compile_latex(request: LatexRequest, background_tasks: BackgroundTasks):
    # Returns path to a temporary PDF. Background task cleans it up after sending.
    pdf_path, temp_dir = await compiler.generate_pdf(request.latex_code)

    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Compilation failed. Check LaTeX syntax.")

    # Schedule cleanup after response is sent
    background_tasks.add_task(compiler.cleanup_temp_dir, temp_dir)
    return FileResponse(pdf_path, media_type='application/pdf', filename="document.pdf")


@app.post("/chat")
async def chat_with_gemini(request: LatexRequest, query: str):
    response = await ai_assistant.ask_gemini(request.latex_code, query)
    return {"response": response}


# ── Citation Handling ──

class CitationRequest(BaseModel):
    references: str | list[str]
    style: str = "ieee"


@app.post("/format-citations")
async def format_citations(request: CitationRequest):
    """
    Accept raw reference strings and return formatted citations.
    Looks up metadata via Crossref API and formats in the requested style.
    Styles: ieee, acm, neurips, springer, elsevier
    """
    result = await citation_handler.format_citations(
        raw_references=request.references,
        style=request.style,
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Citation formatting failed"))
    return result


# ── Template Mapping Engine ──

class MapTemplateRequest(BaseModel):
    document: dict
    conference: str
    layout: str


@app.post("/map-template")
async def map_template(request: MapTemplateRequest):
    """
    Map a detected document AST into a Typst template.
    Accepts the document from /detect-sections, a conference name,
    and a layout choice. Returns Typst-compatible data + generated .typ source.
    """
    result = template_mapper.map_document(
        document=request.document,
        conference=request.conference,
        layout=request.layout,
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Mapping failed"))
    return result


@app.get("/templates")
async def list_templates():
    """List all available conference templates and layouts."""
    return {"templates": template_mapper.list_templates()}


# ── Typst Document Generator ──

class GenerateTypstRequest(BaseModel):
    document: dict | None = None
    conference: str = "ieee"
    layout: str = "single-column"
    mapped_data: dict | None = None
    formatted_references: list[dict] | None = None


@app.post("/generate-typst")
async def generate_typst(request: GenerateTypstRequest):
    """
    Generate a Typst .typ file from a document AST or pre-mapped data.
    Returns the generated Typst source code and writes it to disk.
    """
    result = typst_generator.generate(
        document=request.document,
        conference=request.conference,
        layout=request.layout,
        mapped_data=request.mapped_data,
        formatted_references=request.formatted_references,
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result.get("error", "Typst generation failed"))
    return {
        "status": result["status"],
        "typst_code": result["typst_code"],
        "conference": result["conference"],
        "layout": result["layout"],
    }


# ── Typst Compilation ──

class CompileTypstRequest(BaseModel):
    document: dict | None = None
    conference: str = "ieee"
    layout: str = "single-column"
    mapped_data: dict | None = None
    formatted_references: list[dict] | None = None


@app.post("/compile-typst")
async def compile_typst(request: CompileTypstRequest, background_tasks: BackgroundTasks):
    """
    Generate a Typst file from document data and compile it to PDF.
    Returns the compiled PDF as a downloadable file.
    """
    # Step 1: Generate the .typ file
    gen_result = typst_generator.generate(
        document=request.document,
        conference=request.conference,
        layout=request.layout,
        mapped_data=request.mapped_data,
        formatted_references=request.formatted_references,
    )
    if gen_result["status"] == "error":
        raise HTTPException(status_code=400, detail=gen_result.get("error", "Typst generation failed"))

    output_dir = gen_result["output_dir"]

    # Step 2: Compile .typ → PDF
    comp_result = await typst_compiler.compile_typst(output_dir)
    if comp_result["status"] == "error":
        typst_generator.cleanup(output_dir)
        raise HTTPException(status_code=500, detail=comp_result.get("error", "Typst compilation failed"))

    # Schedule cleanup after the response is sent
    background_tasks.add_task(typst_generator.cleanup, output_dir)
    return FileResponse(
        comp_result["pdf_path"],
        media_type="application/pdf",
        filename="paper_formatted.pdf",
    )


# ── Complete System Pipeline ──

@app.post("/pipeline")
async def run_pipeline(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    conference: str = Form("ieee"),
    layout: str = Form("single-column"),
):
    """
    Complete pipeline: Upload → Extract → Clean → Detect Sections →
    Template Mapping → Typst Generation → Typst Compilation → PDF.

    Accepts a multipart form with the file plus conference/layout choices.
    Returns the compiled PDF directly.
    """
    import traceback
    try:
        # ── 1. Upload & Extract ──
        MAX_SIZE = 20 * 1024 * 1024
        contents = await file.read()
        if len(contents) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum 20 MB.")

        extract_result = extractor.extract_text(contents, file.filename)
        if extract_result["status"] == "error":
            raise HTTPException(status_code=400, detail=extract_result.get("error", "Text extraction failed"))

        # ── 2. Clean ──
        clean_result = cleaner.clean_text(extract_result["raw_text"])
        if clean_result["status"] == "error":
            raise HTTPException(status_code=400, detail=clean_result.get("error", "Text cleaning failed"))

        # ── 3. Section Detection ──
        detect_result = section_detector.detect_sections(clean_result["clean_text"])
        if detect_result["status"] == "error":
            raise HTTPException(status_code=400, detail=detect_result.get("error", "Section detection failed"))

        document_ast = detect_result["document"]

        # ── 3.5. AI Front-Matter Cleaning (title + authors) ──
        if _HAS_AI_CLEANER:
            try:
                import asyncio
                document_ast = await asyncio.to_thread(_ai_refine_ast, document_ast)
            except Exception as e:
                logger.warning("AI cleaner skipped: %s", e)

        # ── 4. Schema JSON generation (AST → paper-schema.json format) ──
        schema_result = schema_mapper.map_and_generate(document_ast, save=True)

        # ── 5–7. Template Mapping + Typst Generation + Compilation ──
        gen_result = typst_generator.generate(
            document=document_ast,
            conference=conference,
            layout=layout,
        )
        if gen_result["status"] == "error":
            raise HTTPException(status_code=400, detail=gen_result.get("error", "Typst generation failed"))

        output_dir = gen_result["output_dir"]

        comp_result = await typst_compiler.compile_typst(output_dir)
        if comp_result["status"] == "error":
            typst_generator.cleanup(output_dir)
            raise HTTPException(status_code=500, detail=comp_result.get("error", "Typst compilation failed"))

        # Copy PDF to outputs/ so it can be downloaded alongside the JSON
        import shutil
        pdf_out = os.path.join(OUTPUTS_DIR, "paper_formatted.pdf")
        shutil.copy2(comp_result["pdf_path"], pdf_out)
        background_tasks.add_task(typst_generator.cleanup, output_dir)

        return JSONResponse({
            "status": "success",
            "schema_json": schema_result.get("data"),
            "json_url": "/outputs/paper.json",
            "pdf_url": "/outputs/paper_formatted.pdf",
            "validation_errors": schema_result.get("validation_errors"),
        })
    except HTTPException:
        raise
    except Exception as e:
        import traceback as tb
        err = tb.format_exc()
        print(f"PIPELINE ERROR: {err}", flush=True)
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {repr(e)}\n{err}")


# ── Schema JSON Pipeline (AST → Schema JSON) ──

class SchemaMapRequest(BaseModel):
    document: dict


@app.post("/schema-json")
async def schema_json(request: SchemaMapRequest):
    """
    Accept a document AST (from /detect-sections) and return the
    validated schema JSON plus a downloadable file URL.
    Steps: mapping → normalisation → validation → file generation.
    """
    result = schema_mapper.map_and_generate(request.document, save=True)
    if result["status"] == "error":
        raise HTTPException(status_code=422, detail=result.get("validation_errors", "Schema mapping failed"))
    return result


@app.post("/api/debug-json")
async def debug_json(request: SchemaMapRequest):
    """
    Debug endpoint — returns the mapped + normalised schema JSON
    without saving a file. Useful during development.
    """
    result = schema_mapper.map_and_generate(request.document, save=False)
    return result


# ── Manuscript JSON endpoints ──


@app.get("/manuscript")
async def get_manuscript():
    """Return the manuscript data from typst/paper.json."""
    path = os.path.join(BASE_DIR, "typst", "paper.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load manuscript: {str(e)}")


@app.get("/manuscript/schema")
async def get_manuscript_schema():
    """Return the manuscript schema from typst/paper-schema.json."""
    path = os.path.join(BASE_DIR, "typst", "paper-schema.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load schema: {str(e)}")


# ── SPA Catch-all: Serve index.html for all unmatched GET requests ──

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the SPA index.html for all non-API routes."""
    # Check if a static file exists in frontend-html (e.g., favicon, images)
    file_path = os.path.join(FRONTEND_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Otherwise serve the SPA entry point
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))