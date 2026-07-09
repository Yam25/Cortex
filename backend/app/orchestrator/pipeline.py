from app.agents.router import classify_intent
from app.agents.memory import store_memory
from app.schemas.request import QueryRequest
from app.schemas.response import QueryResponse


def run_pipeline(request: QueryRequest)-> QueryResponse:
    query = request.query
    router_response = classify_intent(query)

    match router_response.intent:
        case "retrieve":
            # TODO
            pass

        case "save":
           response = store_memory(query)
           return response

        case "both":
            # TODO
            pass

        case "chat":
            # TODO
            pass