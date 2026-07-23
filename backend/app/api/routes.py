from fastapi import APIRouter

from app.orchestrator.pipeline import run_pipeline
from app.schemas.request import QueryRequest
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/query")
def query(request: QueryRequest):
    preview = request.query[:120] + ("..." if len(request.query) > 120 else "")
    logger.info(
        "Query request received",
        extra={"event": "api.query", "details": {"query_preview": preview}},
    )

    result = run_pipeline(request)

    logger.info(
        "Query request completed",
        extra={
            "event": "api.query.done",
            "details": {"response_length": len(result.response)},
        },
    )
    return result
