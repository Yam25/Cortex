# Cortex Frontend

Frontend for **Cortex** — a personal second brain for software engineers.

---

## Overview

This workspace contains the React frontend for Cortex.

It provides the main UI for chatting with notes, browsing stored context, and interacting with the Cortex experience.

---

## Repo and tooling

This workspace uses:

- React + Vite
- JavaScript
- ESLint
- Prettier

The root repository uses:

- npm workspaces
- Husky pre-commit hooks

Install dependencies from the repo root:

```bash
npm install
```

---

## Tech stack

- React 19
- Vite
- JavaScript
- Font Awesome (icons via CDN in `index.html`)

---

## Run locally

From the repo root:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Lint and format

From the repo root:

```bash
npm run lint
npm run format
npm run format:check
npm run check
```

---

## Project structure

```text
src/
├── App.jsx
├── App.css
├── index.css
├── main.jsx
└── components/
    ├── LeftPanel.jsx
    ├── LeftPanel.css
    ├── ChatPanel.jsx
    └── ChatPanel.css

docs/
├── Sidebar.mdx
└── ChatPanel.mdx
```

---

## Component docs

- [docs/Sidebar.mdx](./docs/Sidebar.mdx) — sidebar UI
- [docs/ChatPanel.mdx](./docs/ChatPanel.mdx) — chat interface

---

Part of the Cortex monorepo. See the root `README.md` for workspace-wide tooling and project structure.