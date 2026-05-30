# SDLCM Maturity Evaluator — Cortex Edition

Drop this folder into your project root and run one command to get a full maturity score.

## Usage

```bash
node evaluate/evaluate.mjs
```

No dependencies. Pure Node.js (v18+).

## What it checks

| Category        | Max | What it looks for |
|-----------------|-----|-------------------|
| build           | 10  | Build scripts, vite config, lock file |
| tests           | 15  | Test scripts, test files, vitest/jest config |
| lint_format     | 10  | .prettierrc, eslint config, lint/format scripts |
| security        | 15  | Secrets scanning, vuln scanning, non-root Docker, .env gitignored |
| automation      | 10  | CI steps: build, test, lint, security, packaging |
| release         | 15  | Semver tags, CHANGELOG, version in package.json, release workflow |
| architecture    | 10  | frontend/backend split, src/components, routes/services |
| documentation   | 5   | README setup+usage, ADRs, AI usage doc |
| observability   | 5   | /health endpoint, structured logging, Dockerfile |
| git_process     | 5   | Conventional commits, branch naming, issue refs, commitlint |

**Total: 100 points**

## Grading

| Grade | Score |
|-------|-------|
| A     | 80+   |
| B     | 65–79 |
| C     | 50–64 |
| D     | 35–49 |
| F     | <35   |

## Folder structure

```
evaluate/
  evaluate.mjs   ← main script (run this)
  README.md      ← this file
```
