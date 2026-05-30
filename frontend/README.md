# Cortex Frontend

Frontend for **Cortex** — a personal second brain for software engineers.

---

## Phase 1 (current)

Phase 1 is a **UI shell** with local-only behavior. No backend or API yet.

### Repo and tooling

- React + Vite app in this workspace
- **ESLint** and **Prettier** (`lint`, `format`, `format:check` scripts)
- Root monorepo uses **npm workspaces**; **Husky** runs `npm run check` on commit (frontend lint/format + backend placeholder check)

Install from the **repo root** (`Cortex/`), not only this folder:

```bash
npm install
```

### Layout


| Area             | What’s there                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Left sidebar** | Cortex branding, collapse control, **New Chat** button, profile footer (static)          |
| **Center chat**  | Header (“New Chat”), welcome placeholder, message list with mock bot reply, input + send |


Sidebar can be collapsed and reopened from the chat header.

---

## Tech stack

- React 19
- Vite
- JavaScript
- Font Awesome (icons via CDN in `index.html`)

---

## Run locally

From repo root:

```bash
npm run dev
```

Or from this folder after root install:

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

From repo root:

```bash
npm run lint
npm run format
npm run format:check
npm run check
```

From this folder (same scripts, local workspace):

```bash
npm run lint
npm run format
npm run format:check
```

---

## Project structure

```text
src/
├── App.jsx          # Layout: sidebar + chat panel
├── App.css
├── index.css        # Theme / CSS variables
├── main.jsx
└── components/
    ├── LeftPanel.jsx
    ├── LeftPanel.css
    ├── ChatPanel.jsx
    └── ChatPanel.css

docs/
├── Sidebar.mdx      # Left sidebar (LeftPanel) docs
└── ChatPanel.mdx    # Center chat panel docs
```

### Component docs (MDX)

| Doc | Component |
| ----- | ----------- |
| [docs/Sidebar.mdx](./docs/Sidebar.mdx) | `LeftPanel` — branding, collapse, New Chat, profile |
| [docs/ChatPanel.mdx](./docs/ChatPanel.mdx) | Center chat — messages, input, session remount |

---

Part of the Cortex monorepo. See the root `README.md` and `package.json` for workspace-wide scripts and Husky setup.