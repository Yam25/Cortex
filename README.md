# Cortex

Personal second brain for software engineers. Chat with your notes, retrieve decisions, and build searchable long-term memory with local-first AI.

## Overview

Cortex is a full-stack monorepo for building a searchable AI-powered knowledge system for developers.

It combines a React frontend and FastAPI backend with shared tooling and automation from a single repository.

## Repository Structure

```text
cortex/
├── .github/        # CI/CD workflows
├── .husky/         # Git hooks
├── backend/        # FastAPI API
├── frontend/       # React + Vite app
├── evaluate/       # Experiments / evaluation
├── scripts/        # Shared scripts
├── package.json
└── README.md
```

## Monorepo Tooling

This repository uses:

- **npm workspaces** for shared scripts and dependency management
- **Husky** for pre-commit validation
- **GitHub Actions** for CI/CD

Husky runs checks before commit, including:

- frontend lint / format
- backend validation

## Development

Workspace scripts are managed from the repository root.

See service-specific documentation:

- `[frontend/README.md](./frontend/README.md)`
- `[backend/README.md](./backend/README.md)`

## Status

Currently in active development.