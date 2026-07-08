from fastapi import APIRouter
from app.schemas.request import QueryRequest
from app.agents.router import classify_intent


router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/chat")
def query(request: QueryRequest):
    return classify_intent(request.query)
