from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ai_assistant

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LatexRequest(BaseModel):
    latex_code: str
    query: str = ""
    action_type: str = "chat" # Added action_type: 'chat', 'autocomplete', 'review', 'edit'

@app.post("/chat")
async def handle_ai_request(request: LatexRequest):
    response = await ai_assistant.ask_gemini(request.latex_code, request.query, request.action_type)
    return {"response": response}