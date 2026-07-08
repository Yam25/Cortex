# Cortex Backend

Backend for **Cortex** — a personal second brain for software engineers.

---

## Overview

This workspace contains the FastAPI backend for Cortex.

It will power API endpoints for storing notes, retrieving project context, and supporting AI-powered search and memory workflows.

Backend development is currently in early setup.

---

## Tech stack

- FastAPI
- Python
- Ruff

---

## Environment setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Run locally

Start development server:

```bash
uvicorn main:app --reload
```

---

## Lint and checks

Run Ruff:

```bash
ruff check .
```

Format:

```bash
ruff format .
```

---

## Project structure

```text
backend/
├── main.py
└── README.md
```

---

## Status

Current phase:

- FastAPI scaffolded
- Ruff configured
- backend structure in progress

Next:

- API route structure
- request / response models
- service layer
- tests