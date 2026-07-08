from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(
        ..., description="User query", min_length=1, max_length=500
    )
