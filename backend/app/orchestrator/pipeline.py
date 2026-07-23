from app.agents.memory import store_memory
from app.agents.router import classify_intent
from app.agents.synthesis import generate_chat_response
from app.schemas.request import QueryRequest
from app.schemas.response import QueryResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)


def run_pipeline(request: QueryRequest) -> QueryResponse:
    query = request.query.strip()
    logger.info(
        "Pipeline started",
        extra={"event": "pipeline.start", "details": {"query_length": len(query)}},
    )

    router_response = classify_intent(query)
    intent = router_response.intent

    match intent:
        case "retrieve":
            return QueryResponse(response="Memory retrieval is not implemented yet.")

        case "save":
            return store_memory(query)

        case "both":
            return QueryResponse(
                response="Saving and answering from memory is not implemented yet."
            )

        case "chat":
            return QueryResponse(response=generate_chat_response(query))