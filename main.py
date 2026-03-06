from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from api import parser
from api import compiler
from api import ai_assistant
import os
import TexSoup

app = FastAPI(title="LaTeX Research Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, lock this down to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)


class LatexRequest(BaseModel):
    latex_code: str


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