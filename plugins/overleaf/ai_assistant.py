
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

async def ask_gemini(latex_code: str, query: str, action_type: str = "chat") -> str:
    api_key = GEMINI_API_KEY
    if not api_key or api_key == "GEMINI_API_KEY": 
        return "Error: GEMINI_API_KEY not configured. Please set it in config.py or as environment variable."

    client = genai.Client(api_key=api_key)
    model = "gemini-2.5-flash"
    # Dynamic Prompting based on the feature used
    if action_type == "autocomplete":
        system_prompt = (
            "You are an AI autocomplete engine for an academic paper. "
            "Read the following LaTeX paragraph and generate ONLY the next logical sentence to continue the thought. "
            "Do not include commentary, markdown formatting, or quotes. Just the raw text.\n\n"
            f"--- CURRENT PARAGRAPH ---\n{latex_code}\n--- END PARAGRAPH ---"
        )
    elif action_type == "review":
        system_prompt = (
            "You are an expert peer reviewer. Review the following LaTeX document. "
            "Provide a structured critique addressing: 1) Clarity and Flow, 2) Methodology/Argumentation strength, "
            "and 3) LaTeX formatting or structural suggestions. Keep it professional and actionable.\n\n"
            f"--- DOCUMENT ---\n{latex_code}\n--- END DOCUMENT ---"
        )
    elif action_type == "edit":
        system_prompt = (
            "You are an expert academic editor. Rewrite the following highlighted LaTeX section based on the user's instructions. "
            "Return ONLY the rewritten LaTeX code, ensuring packages and citations remain intact.\n\n"
            f"--- SECTION TO EDIT ---\n{latex_code}\n--- END SECTION ---\n\n"
            f"Instructions: {query}"
        )
    else:
        system_prompt = (
            "You are an expert LaTeX assistant. Use this document context to answer the user.\n"
            f"--- CONTEXT START ---\n{latex_code}\n--- CONTEXT END ---\n"
            f"User Question: {query}"
        )

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=system_prompt)])]

    try:
        response_text = ""
        # Removed the advanced configs that were crashing the free-tier model
        async for chunk in await client.aio.models.generate_content_stream(
                model=model,
                contents=contents
        ):
            response_text += chunk.text
        return response_text.strip()
    except Exception as e:
        # If it fails, print the actual error to the backend console so we can read it!
        print(f"Backend Crash Error: {str(e)}")
        return f"Error: {str(e)}"