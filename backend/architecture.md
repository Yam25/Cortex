# Cortex — Backend Architecture Decisions

## What is Cortex

A personal second brain for a software engineer. You feed it notes, architectural decisions, design patterns, code snippets, articles, and thoughts. You talk to it later. It retrieves from your own knowledge, answers in your own context, and remembers what you tell it.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| API | FastAPI + Python | Async support, clean structure, fast to build |
| LLM | Groq | Free tier, fast inference, generous for personal use |
| Embeddings |  | Runs locally, free, your notes never leave your machine |
| Vector DB | ChromaDB | Local, persists to disk, zero ops, Python native |
| History + Cache | Redis via Docker | Persisted to local volume, survives container restarts |

---

## Why No Agent Framework

Cortex V1 is built in raw Python with zero agent frameworks (no LangChain, no LangGraph).

The reason is intentional — this project exists to deeply understand multi-agent orchestration, RAG, token optimization, and prompt engineering. Frameworks abstract exactly the things we want to learn. When something breaks in a framework you debug the framework, not your logic.

V1 raw Python → understand every token, every flow, every decision.
V2 LangGraph → rebuild the orchestration layer knowing exactly what the framework is abstracting. Better LangGraph code because we built it from scratch first.

---

## Folder Structure

```
cortex/
├── app/
│   ├── api/
│   │   └── router.py               # FastAPI routes only, no agent logic here
│   ├── agents/
│   │   ├── base.py                 # Base agent class all agents inherit from
│   │   ├── router.py               # Router agent — classifies intent
│   │   ├── memory.py               # Memory agent — saves knowledge
│   │   ├── retrieval.py            # Retrieval agent — fetches from ChromaDB
│   │   └── synthesis.py            # Synthesis agent — writes final answer
│   ├── orchestrator/
│   │   └── pipeline.py             # Owns the agent flow, called by FastAPI
│   ├── prompts/
│   │   ├── router.py               # Router system prompt
│   │   ├── memory.py               # Memory system prompt
│   │   ├── retrieval.py            # Retrieval system prompt
│   │   └── synthesis.py            # Synthesis system prompt
│   ├── services/
│   │   ├── groq.py                 # Groq client + model definitions
│   │   ├── chroma.py               # ChromaDB client
│   │   └── redis.py                # Redis client
│   ├── schemas/
│   │   ├── request.py              # Input models
│   │   └── response.py             # Output models
│   └── core/
│       └── config.py               # Settings, env vars
├── docker-compose.yml
└── .env
```

---

## Agent Architecture

### The Base Agent

All agents inherit from a single base class. The base agent holds one shared Groq client (initialized once from the services layer), handles the LLM call in one place, and enforces that every agent implements a `run()` method.

This means if we want to add logging, token counting, error handling, or swap a model — we do it in one place and every agent picks it up. No repetition across agent files.

Every agent that needs an LLM call uses the base. Retrieval agent is the exception — it talks directly to ChromaDB and makes no LLM call at all.

### Model Definitions

All models are defined in `services/groq.py` as a named dictionary — `fast`, `smart`, `mid`. Each agent picks a tier by name, not by hardcoded model string.

If Groq releases a better model tomorrow or we want to swap, we change one line in the services file. Every agent picks it up automatically without touching agent code.

**Model tiers and why:**

| Agent | Model Tier | Reason |
|---|---|---|
| Router | fast | Classification only, needs speed not intelligence |
| Memory | fast | Extracting and structuring info, straightforward task |
| Retrieval | none | No LLM call, pure vector search |
| Synthesis | smart | Final answer the user reads, needs to actually be good |

### Prompts as Separate Files

Each agent has its own prompt file in the `prompts/` folder. Agent files import their prompt from there.

This keeps agent logic clean and prompts easy to find and tune without touching agent code. Prompt engineering happens in `prompts/`, agent orchestration happens in `agents/`. Separated by concern.

---

## The Four Agents

### Router Agent
Classifies what the user wants. Takes the current message only — no history needed, intent lives in the message itself. Returns one of four intents: `retrieve`, `save`, `both`, `chat`. Uses the fast model, max tokens capped very low because the response is just a small JSON object. Temperature set to zero — classification must be deterministic.

### Memory Agent
Called when the user is teaching Cortex something. Takes the message and conversation history (needs context to understand what topic is being discussed). Runs the ingestion pipeline as a tool — chunks the content, embeds it via Ollama, stores it in ChromaDB. Uses the fast model.

### Retrieval Agent
Called when the user is asking a question. Queries ChromaDB with the user message, fetches the most relevant chunks, returns them ranked. No LLM call. Pure vector search. The quality of retrieval directly determines the quality of the final answer.

### Synthesis Agent
Always called last. Takes the user message, retrieved chunks (if any), and conversation history from Redis. Writes the final answer with citations back to the user's own notes. This is the only agent the user actually sees. Uses the smart model.

---

## The Orchestrator

`orchestrator/pipeline.py` owns the entire agent flow. FastAPI routes call one method — `pipeline.run(message, session_id)` — and get back a response. The route knows nothing about agents.

The orchestrator reads the router's intent and decides what runs next:

- `retrieve` → retrieval agent → synthesis
- `save` → memory agent → synthesis
- `both` → retrieval and memory run in parallel (asyncio) → synthesis
- `chat` → synthesis directly, no retrieval, no saving

This separation means FastAPI handles HTTP concerns and the orchestrator handles intelligence concerns. Clean boundary.

---

## Conversation History

Redis stores all conversation history. Every chat turn is saved at the API layer after synthesis completes — not inside any agent. Agents are stateless. The FastAPI layer feeds them history from Redis as input context and saves turns after they respond.

Redis runs in Docker with AOF persistence enabled and data mounted to a local volume folder. Container can be destroyed and rebuilt — data survives because it lives on disk, not in the container.

---

## Token Optimization Principles

Token optimization is a first-class concern across the whole system, not an afterthought.

- Router gets current message only, max tokens capped at 20. Cheapest possible call on every message.
- Each agent has its own `max_tokens` set appropriately for its job. Synthesis gets the most, router gets the least.
- Conversation history passed to agents is trimmed — last N turns only, not full history.
- Repeated queries hit Redis cache before hitting Groq. Same question twice does not make two LLM calls.
- Retrieval returns a limited number of chunks — enough context, not everything.

---

