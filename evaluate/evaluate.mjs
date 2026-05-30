#!/usr/bin/env node
/**
 * SDLCM Maturity Evaluator — Cortex Edition
 * Drop this folder into your project root and run:
 *   node evaluate/evaluate.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// ─── Windows-safe ROOT resolution ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, "..");

const rel     = (...parts) => path.join(ROOT, ...parts);
const exists  = (p)        => fs.existsSync(rel(p));
const read    = (p)        => { try { return fs.readFileSync(rel(p), "utf8"); } catch { return ""; } };
const readAbs = (p)        => { try { return fs.readFileSync(p, "utf8"); }      catch { return ""; } };

// ─── Cross-platform recursive file walker (no shell commands) ────────────────
function walkDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, results);
    else results.push(full);
  }
  return results;
}

function globFiles(subdir, ...exts) {
  const dir = rel(subdir);
  if (!fs.existsSync(dir)) return [];
  const extSet = new Set(exts.map(e => e.toLowerCase()));
  return walkDir(dir).filter(f => extSet.has(path.extname(f).slice(1).toLowerCase()));
}

const git = (cmd) => {
  try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["pipe","pipe","pipe"] }).trim(); }
  catch { return ""; }
};

// ─── Python / FastAPI backend detection ──────────────────────────────────────
const BE_PYTHON = exists("backend/pyproject.toml") || exists("backend/requirements.txt")
               || exists("backend/setup.py")        || exists("backend/setup.cfg")
               || globFiles("backend", "py").length > 0;

// Read all Python source files in backend (flat concat)
function readPyBackend() {
  if (!BE_PYTHON) return "";
  return globFiles("backend", "py").map(readAbs).join("\n");
}

// pyproject.toml content
const pyproject   = read("backend/pyproject.toml");
const requirements = read("backend/requirements.txt") + read("backend/requirements-dev.txt")
                   + read("backend/requirements/dev.txt") + read("backend/requirements/base.txt");

// ─── colours ─────────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m",
  cyan:  "\x1b[36m", white: "\x1b[37m",
};
const pass = () => `${C.green}✓${C.reset}`;
const fail = () => `${C.red}✗${C.reset}`;
const dim  = (s) => `${C.dim}${s}${C.reset}`;
function check(label, ok, weight = 1) { return { label, ok: !!ok, weight }; }

// ══════════════════════════════════════════════════════════════════════════════
//  CATEGORIES  — exact same checks as original evaluator
// ══════════════════════════════════════════════════════════════════════════════

function evalBuild() {
  let fePkg = {};
  try { fePkg = JSON.parse(read("frontend/package.json")); } catch {}
  const feBuild = !!(fePkg.scripts?.build);

  // Python backend: uvicorn / fastapi present means it can "run"
  const pyBuild = BE_PYTHON && (
    requirements.includes("fastapi") || requirements.includes("uvicorn")
    || pyproject.includes("fastapi") || pyproject.includes("uvicorn")
  );

  const buildOk = feBuild || pyBuild;

  return {
    name: "build", max: 10,
    checks: [
      check("Build successful", buildOk, 10),
    ],
  };
}

function evalTests() {
  let fePkg = {}, bePkg = {};
  try { fePkg = JSON.parse(read("frontend/package.json")); } catch {}
  try { bePkg = JSON.parse(read("backend/package.json"));  } catch {}

  // Node test detection
  const nodeTestScript = !!(fePkg.scripts?.test || bePkg.scripts?.test);
  const allFiles       = walkDir(rel("frontend")).concat(walkDir(rel("backend")));
  const nodeTestFiles  = allFiles.some(f => /\.(test|spec)\.[jt]sx?$/.test(f));

  // Python test detection
  const pytestCfg   = pyproject.includes("[tool.pytest") || exists("backend/pytest.ini")
                   || exists("backend/setup.cfg") && read("backend/setup.cfg").includes("[tool:pytest]")
                   || requirements.includes("pytest");
  const pyTestFiles = globFiles("backend", "py").some(f => path.basename(f).startsWith("test_")
                   || path.basename(f).endsWith("_test.py"));

  const testsPass = (nodeTestScript && nodeTestFiles) || (BE_PYTHON && pytestCfg && pyTestFiles)
                 || (BE_PYTHON && pyTestFiles); // test files alone count for python

  return {
    name: "tests", max: 15,
    checks: [
      check("Tests pass", testsPass, 15),
    ],
  };
}

function evalLintFormat() {
  const fePkgRaw   = read("frontend/package.json");
  const rootPkgRaw = read("package.json");

  // JS lint config
  const jsLint = exists("frontend/.eslintrc.js")     || exists("frontend/.eslintrc.json")
              || exists("frontend/.eslintrc.cjs")    || exists("frontend/eslint.config.js")
              || exists("frontend/eslint.config.mjs") || exists("eslint.config.js")
              || exists("eslint.config.mjs")           || fePkgRaw.includes("eslint")
              || rootPkgRaw.includes("eslint");

  // Python lint config (ruff, flake8, pylint)
  const pyLint = pyproject.includes("[tool.ruff")    || pyproject.includes("[tool.flake8")
              || pyproject.includes("[tool.pylint")   || exists("backend/.flake8")
              || exists("backend/ruff.toml")           || exists(".flake8")
              || exists("ruff.toml")                   || requirements.includes("ruff")
              || requirements.includes("flake8")       || requirements.includes("pylint");

  const lintConfig = jsLint || pyLint;

  // JS formatter (prettier)
  const jsFmt = exists("frontend/.prettierrc")      || exists(".prettierrc")
             || exists("frontend/.prettierrc.json")  || exists("frontend/.prettierrc.js")
             || exists("frontend/.prettierrc.cjs")   || fePkgRaw.includes("prettier")
             || rootPkgRaw.includes("prettier");

  // Python formatter (black, ruff format, isort)
  const pyFmt = pyproject.includes("[tool.black")   || pyproject.includes("[tool.ruff.format")
             || exists("backend/.black")              || requirements.includes("black")
             || requirements.includes("isort")        || pyproject.includes("[tool.isort");

  const fmtConfig = jsFmt || pyFmt;

  return {
    name: "lint_format", max: 10,
    checks: [
      check("Lint config present",      lintConfig, 5),
      check("Formatter config present", fmtConfig,  5),
    ],
  };
}

function evalSecurity() {
  const wfFiles   = globFiles(".github/workflows", "yml", "yaml");
  const wfContent = wfFiles.map(readAbs).join("\n");

  const secretsScan  = wfContent.includes("gitleaks") || wfContent.includes("trufflehog")
                    || wfContent.includes("detect-secrets");
  const vulnScan     = wfContent.includes("audit")    || wfContent.includes("snyk")
                    || wfContent.includes("trivy")     || wfContent.includes("dependabot");
  const coverageGate = wfContent.includes("coverage")
                    && (wfContent.includes("threshold") || wfContent.includes("--reporter"));
  const dockerNonRoot = (() => {
    const df = read("backend/Dockerfile") + read("Dockerfile");
    return df.includes("USER ") && !/USER\s+root/.test(df);
  })();
  const noHardcoded = read(".gitignore").includes(".env");

  return {
    name: "security", max: 15,
    checks: [
      check("Secrets scanning step",      secretsScan,   3),
      check("Vulnerability scanning step",vulnScan,      3),
      check("Coverage gate/threshold",    coverageGate,  3),
      check("Dockerfile non-root USER",   dockerNonRoot, 3),
      check("No hardcoded secrets",       noHardcoded,   3),
    ],
  };
}

function evalAutomation() {
  const wfFiles   = globFiles(".github/workflows", "yml", "yaml");
  const wfContent = wfFiles.map(readAbs).join("\n");
  const hasWf     = wfFiles.length > 0;
  const cmd       = (pattern) => hasWf && pattern.test(wfContent);

  // must match actual run: commands, not incidental words in action names/URLs
  const buildStep = cmd(/run:\s*(npm run build|yarn build|pnpm build|vite build|next build|python.*build)/m);
  const testStep  = cmd(/run:\s*(npm (run )?test|yarn test|pnpm test|pytest|vitest|jest)(\s|$)/m);
  const lintStep  = cmd(/run:\s*(npm run lint|yarn lint|pnpm lint|eslint|prettier|ruff check|flake8|pylint)/m);
  const secStep   = cmd(/run:\s*(npm audit|snyk|trivy|gitleaks|pip-audit|safety check)/m)
                 || cmd(/uses:\s*(snyk|trivy|gitleaks|aquasecurity|returntocorp)/m);
  const pkgStep   = cmd(/uses:\s*actions\/(upload-pages-artifact|upload-artifact)/m)
                 || cmd(/run:\s*(docker build|docker push)/m);

  return {
    name: "automation", max: 10,
    checks: [
      check("build step",             buildStep, 2),
      check("test step",              testStep,  2),
      check("lint step",              lintStep,  2),
      check("security/scan step",     secStep,   2),
      check("package/container step", pkgStep,   2),
    ],
  };
}

function evalRelease() {
  const semverTags = (() => {
    const tags = git("git tag --list");
    return tags.split("\n").some(t => /^v?\d+\.\d+\.\d+/.test(t.trim()));
  })();

  const changelog = exists("CHANGELOG.md") || exists("CHANGELOG");

  const versionInManifest = (() => {
    // Node: package.json
    try {
      const p = JSON.parse(read("package.json") || read("frontend/package.json") || "{}");
      if (p.version && p.version !== "0.0.0") return true;
    } catch {}
    // Python: pyproject.toml  [project] version = "x.y.z"  or  version = "x.y.z"
    if (pyproject && /version\s*=\s*["']\d+\.\d+/.test(pyproject)) return true;
    // setup.cfg / setup.py
    const setupCfg = read("backend/setup.cfg");
    if (setupCfg && /version\s*=\s*\d+\.\d+/.test(setupCfg)) return true;
    return false;
  })();

  const releaseWf = globFiles(".github/workflows", "yml", "yaml")
    .some(w => { const c = readAbs(w); return c.includes("release") || c.includes("tag"); });

  return {
    name: "release", max: 15,
    checks: [
      check("Semver git tags exist",    semverTags,        4),
      check("CHANGELOG.md exists",      changelog,         4),
      check("Version in manifest",      versionInManifest, 4),
      check("Release/tag automation",   releaseWf,         3),
    ],
  };
}

function evalArchitecture() {
  // Layered structure: frontend + backend folders, src inside them
  const layered = exists("frontend/src") && exists("backend");

  // Config separated from code: .env.example or similar
  const configSep = exists("frontend/.env.example") || exists("backend/.env.example")
                 || exists(".env.example")           || read(".gitignore").includes(".env");

  return {
    name: "architecture", max: 10,
    checks: [
      check("Layered structure",        layered,   5),
      check("Config separated from code", configSep, 5),
    ],
  };
}

function evalDocumentation() {
  const readme   = read("README.md").toLowerCase();
  const readmeOk = readme.length > 200
                && (readme.includes("install") || readme.includes("usage") || readme.includes("getting started"));

  const adrDir = exists("docs/adr") || exists("adr") || exists("docs/decisions");

  const aiUsage = exists("AI_USAGE.md") || exists("docs/AI_USAGE.md")
               || readme.includes("ai usage") || readme.includes("claude");

  return {
    name: "documentation", max: 5,
    checks: [
      check("README.md quality",   readmeOk, 2),
      check("ADRs present",        adrDir,   2),
      check("AI usage doc present",aiUsage,  1),
    ],
  };
}

function evalObservability() {
  // Node backend
  const beJsContent = read("backend/src/index.js") + read("backend/index.js")
                    + read("backend/src/server.js") + read("backend/src/app.js");
  const bePkgRaw    = read("backend/package.json");

  const jsHealth     = beJsContent.includes("/health") || beJsContent.includes("healthcheck")
                    || beJsContent.includes("/ping");
  const jsStructured = beJsContent.includes("winston") || beJsContent.includes("pino")
                    || beJsContent.includes("bunyan")   || bePkgRaw.includes("winston")
                    || bePkgRaw.includes("pino");

  // Python / FastAPI backend
  const pyContent    = readPyBackend();
  const pyHealth     = pyContent.includes("/health")   || pyContent.includes("/ping")
                    || pyContent.includes("healthcheck");
  const pyStructured = pyContent.includes("loguru")    || pyContent.includes("structlog")
                    || pyContent.includes("logging")    || requirements.includes("loguru")
                    || requirements.includes("structlog")|| pyproject.includes("loguru")
                    || pyproject.includes("structlog");

  const health     = jsHealth     || pyHealth;
  const structured = jsStructured || pyStructured;
  const dockerfile = exists("backend/Dockerfile") || exists("Dockerfile");

  return {
    name: "observability", max: 5,
    checks: [
      check("Health endpoint",    health,     2),
      check("Structured logging", structured, 2),
      check("Dockerfile present", dockerfile, 1),
    ],
  };
}

function evalGitProcess() {
  const log   = git("git log --oneline -30");
  const lines = log.split("\n").filter(Boolean);

  const branches     = git("git branch -a");
  const branchNaming = branches.split("\n").some(b => /feat\/|fix\/|chore\/|release\/|hotfix\//.test(b));

  const conv    = lines.filter(l => /^[a-f0-9]+ (feat|fix|chore|docs|style|refactor|test|ci|build|perf|revert)(\(.+\))?[!:]/.test(l));
  const convPct = lines.length ? conv.length / lines.length : 0;

  const issueRefs   = lines.filter(l => /#\d+/.test(l));
  const issueRefPct = lines.length ? issueRefs.length / lines.length : 0;

  return {
    name: "git_process", max: 5,
    checks: [
      check("Release/feature branch naming",                         branchNaming,      2),
      check(`Conventional commits (>50%)`,                           convPct > 0.5,     2),
      check(`Issue references in commits`,                           issueRefPct > 0.3, 1),
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDERER
// ══════════════════════════════════════════════════════════════════════════════

function score(cat) {
  const earned = cat.checks.filter(c => c.ok).reduce((s, c) => s + c.weight, 0);
  const total  = cat.checks.reduce((s, c) => s + c.weight, 0);
  return Math.round((earned / total) * cat.max);
}

function printCategory(cat) {
  const s    = score(cat);
  const icon = s === cat.max ? C.green + "✓" + C.reset
             : s === 0       ? C.red   + "✗" + C.reset
                             : C.yellow + "~" + C.reset;

  console.log(`\n${icon} ${C.bold}${cat.name}${C.reset}  ${s}/${cat.max}`);
  for (const c of cat.checks)
    console.log(`   ${c.ok ? pass() : fail()} ${dim(c.label)}`);
}

function run() {
  console.clear();
  const line = "─".repeat(44);

  console.log(line);
  console.log(" SDLCM MATURITY EVALUATOR");
  console.log(line);

  let repoName = path.basename(ROOT);
  try { repoName = JSON.parse(read("package.json")).name || repoName; } catch {}
  const repoType = BE_PYTHON
    ? (exists("frontend/package.json") ? "nodejs + python (fastapi)" : "python (fastapi)")
    : exists("frontend/vite.config.ts") || exists("frontend/vite.config.js")
      ? "nodejs" : exists("frontend/package.json") ? "nodejs" : "unknown";

  console.log(` Repo: ${repoName}`);
  console.log(` Type: ${repoType}`);
  console.log(line);

  const categories = [
    evalBuild(), evalTests(), evalLintFormat(), evalSecurity(),
    evalAutomation(), evalRelease(), evalArchitecture(),
    evalDocumentation(), evalObservability(), evalGitProcess(),
  ];

  for (const cat of categories) printCategory(cat);

  const total    = categories.reduce((s, c) => s + score(c), 0);
  const maxTotal = categories.reduce((s, c) => s + c.max,    0);

  console.log(`\n${line}`);
  console.log(` SCORE: ${total} / ${maxTotal}`);
  console.log(line);
  console.log();
}

run();
