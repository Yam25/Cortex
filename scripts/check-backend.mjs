import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const backendDir = join(process.cwd(), "backend");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(backendDir)) {
  console.log("No backend folder — skipping backend checks.");
  process.exit(0);
}

const hasPackageJson = existsSync(join(backendDir, "package.json"));
const hasPyproject = existsSync(join(backendDir, "pyproject.toml"));

if (!hasPackageJson && !hasPyproject) {
  console.log(
    "Backend folder has no package.json or pyproject.toml — skipping backend checks.",
  );
  process.exit(0);
}

if (hasPackageJson) {
  console.log("Running backend npm checks...");
  run("npm", ["run", "lint"], backendDir);
  run("npm", ["run", "format:check"], backendDir);
  process.exit(0);
}

if (existsSync(join(backendDir, "pyproject.toml"))) {
  console.log("Running backend ruff checks...");
  run("ruff", ["check", "."], backendDir);
  run("ruff", ["format", "--check", "."], backendDir);
  process.exit(0);
}
