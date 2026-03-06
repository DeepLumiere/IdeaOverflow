import os
import json
from google import genai
from google.genai import types
from config import GEMINI_API_KEY
api_key = GEMINI_API_KEY
client = genai.Client(api_key=api_key) if api_key else None
# Preset JSON configuration for conferences
CONFERENCE_PRESETS = {
    "ACL": {
        "name": "Association for Computational Linguistics (ACL)",
        "structure": "Abstract, Introduction, Background/Related Work, Methodology, Experiments, Results, Discussion, Conclusion, Limitations, Ethics Statement.",
        "topics": "NLP, Computational Linguistics, Dialogue, Semantics, Syntax, Machine Translation."
    },
    "EMNLP": {
        "name": "Empirical Methods in Natural Language Processing (EMNLP)",
        "structure": "Abstract, Introduction, Related Work, Data, Methodology, Experimental Setup, Results, Analysis/Discussion, Conclusion, Limitations.",
        "topics": "Empirical NLP, Text Mining, Information Extraction, Large Language Models, Evaluation."
    },
    "CVPR": {
        "name": "Computer Vision and Pattern Recognition (CVPR)",
        "structure": "Abstract, Introduction, Related Work, Approach/Method, Experiments, Conclusion. (Strict anonymity/formatting).",
        "topics": "Computer Vision, Image Processing, Object Detection, 3D Vision, Video Analysis."
    },
    "NeurIPS": {
        "name": "Neural Information Processing Systems (NeurIPS)",
        "structure": "Abstract, Introduction, Related Work, Method, Experiments, Broader Impact, Conclusion.",
        "topics": "Machine Learning, Deep Learning, Optimization, Theory, Neuroscience intersections."
    },
    "AAAI": {
        "name": "Association for the Advancement of Artificial Intelligence (AAAI)",
        "structure": "Abstract, Introduction, Related Work, Problem Formulation, Proposed Method, Experiments, Conclusion.",
        "topics": "General AI, Reasoning, Multi-agent Systems, Search, Machine Learning, Vision, NLP."
    }
}
JOURNAL_PRESETS = {
    "JMLR": {
        "name": "Journal of Machine Learning Research (JMLR)",
        "structure": "Abstract, Keywords, Introduction, Background/Related Work, Theoretical Framework/Algorithm, Experiments, Discussion, Conclusion, Acknowledgments, Appendix (Proofs).",
        "topics": "Machine Learning Theory, Statistical Learning, Algorithms, Deep Learning, Empirical Studies."
    },
    "TPAMI": {
        "name": "IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)",
        "structure": "Abstract, Index Terms, Introduction, Related Work, Proposed Methodology, Experimental Results, Ablation Study, Conclusion, Acknowledgment, References, Author Biographies.",
        "topics": "Computer Vision, Pattern Recognition, Machine Learning, Image Processing, Medical Image Analysis."
    },
    "TACL": {
        "name": "Transactions of the Association for Computational Linguistics (TACL)",
        "structure": "Abstract, Introduction, Background, Methodology, Experimental Setup, Results, Analysis/Discussion, Conclusion, Limitations, Ethics Statement.",
        "topics": "Computational Linguistics, Natural Language Processing, Dialogue Systems, Machine Translation, Semantics."
    },
    "AIJ": {
        "name": "Artificial Intelligence Journal (AIJ)",
        "structure": "Abstract, Keywords, Introduction, Literature Review, Formal Framework/Model, Experimental Evaluation, Discussion/Future Work, Conclusion.",
        "topics": "Knowledge Representation, Automated Reasoning, Cognitive Modeling, Multi-agent Systems, Heuristic Search."
    },
    "NATURE": {
        "name": "Nature (Main Journal)",
        "structure": "Summary Paragraph (Abstract), Main Text (Introduction, Results, Discussion combined), Methods, Data Availability, Code Availability, References, Acknowledgements.",
        "topics": "Multidisciplinary Science, Groundbreaking Research, Biology, Physics, Artificial Intelligence breakthroughs."
    }
}

async def ask_gemini(latex_code: str, query: str, action_type: str = "chat") -> str:
    if not api_key: return "Error: API key missing."
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
        # Get the selected conference data, default to a general fallback if not found
        conf_data = CONFERENCE_PRESETS.get(query) or JOURNAL_PRESETS.get(query, {
            "name": "General Academic Venue",
            "structure": "Standard academic structure (Abstract, Intro, Method, Results, Discussion, Conclusion)",
            "topics": "General Academic Topics"
        })

        system_prompt = (
            f"You are an expert peer reviewer for {conf_data['name']}. Review the following LaTeX document. "
            "Provide a structured critique addressing: 1) Clarity and Flow, 2) Methodology/Argumentation strength, "
            "and 3) LaTeX formatting or structural suggestions. Keep it professional and actionable.\n\n"
            f"CRITICAL REQUIREMENTS FOR THIS CONFERENCE:\n"
            f"- Required Structure: {conf_data['structure']}\n"
            f"- Topics of Interest: {conf_data['topics']}\n"
            "Evaluate if the paper adheres to these specific requirements.\n\n"
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
        async for chunk in await client.aio.models.generate_content_stream(
                model=model,
                contents=contents
        ):
            response_text += chunk.text
        return response_text.strip()
    except Exception as e:
        print(f"Backend Crash Error: {str(e)}")
        return f"Error: {str(e)}"