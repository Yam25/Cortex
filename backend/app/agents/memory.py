from app.schemas.response import QueryResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)


def store_memory(query: str) -> QueryResponse:
    logger.info(
        "Storing memory",
        extra={"event": "memory.store", "details": {"query_length": len(query)}},
    )
    # TODO: persist to vector store / database
    return QueryResponse(response="I've saved that to your memory.")
