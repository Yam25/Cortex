from fastapi import APIRouter
from app.schemas.request import QueryRequest
from app.orchestrator.pipeline import run_pipeline


router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/query")
def query(request: QueryRequest):
    return run_pipeline(request)
