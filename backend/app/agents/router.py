from app.prompts.router_prompt import ROUTER_SYSTEM_PROMPT
from app.schemas.response import RouterResponse
from app.services.gemini import client


def classify_intent(query: str) -> RouterResponse:
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=query,
        config={
            "system_instruction": ROUTER_SYSTEM_PROMPT,
            "temperature": 0,
            "max_output_tokens": 50,
            "response_mime_type": "application/json",
            "response_schema": RouterResponse,
            "thinking_config": {
                "thinking_budget": 0
            }
        },
    )
    return response.parsed