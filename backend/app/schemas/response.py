from typing import Literal

from pydantic import BaseModel, Field

Intent = Literal["retrieve", "save", "both", "chat"]


class RouterResponse(BaseModel):
    intent: Intent = Field(..., description="The intent of the query")


class QueryResponse(BaseModel):
    response: str = Field(..., description="The response to the query")