import os
from google import genai
from google.genai import types


async def ask_gemini(latex_code: str, query: str) -> str:
    """
    Sends the user query along with the LaTeX document context to Gemini.
    Uses the async client to prevent blocking the FastAPI event loop.
    """
    # Ensure the API key is set in the environment
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY environment variable is not set."

    # Initialize the client. We will use the async (aio) methods for FastAPI.
    client = genai.Client(api_key=api_key)
    model = "gemini-3-flash-preview"

    # Construct a prompt that forces the AI to base its answer on the researcher's document
    system_prompt = (
        "You are an expert LaTeX and research assistant. "
        "Use the following LaTeX document context to answer the user's question. "
        "If the answer isn't in the context, use your search tools to find relevant academic information.\n\n"
        f"--- LATEX CONTEXT START ---\n{latex_code}\n--- LATEX CONTEXT END ---\n\n"
        f"User Question: {query}"
    )

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=system_prompt)],
        ),
    ]

    # Incorporating your specific Search and Thinking configuration
    tools = [
        types.Tool(googleSearch=types.GoogleSearch()),
    ]

    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        tools=tools,
    )

    try:
        # Use aio (async io) to generate content stream
        response_text = ""
        async for chunk in await client.aio.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
        ):
            response_text += chunk.text

        return response_text

    except Exception as e:
        return f"An error occurred while communicating with Gemini: {str(e)}"