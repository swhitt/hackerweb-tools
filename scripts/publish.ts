#!/usr/bin/env bun
/**
 * Publish script for gist releases.
 *
 * Usage: bun run publish [--dry-run]
 *
 * Steps:
 * 1. Increment build number in config.ts
 * 2. Build the userscript
 * 3. Run all checks (typecheck, lint, tests)
 * 4. Commit with tag v{version}-{build}
 * 5. Push to GitHub and update gist
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const CONFIG_PATH = resolve(ROOT, "config.ts");
const CHANGELOG_PATH = resolve(ROOT, "CHANGELOG.md");
const DIST_PATH = resolve(ROOT, "dist/hackerweb-tools.user.js");

const DRY_RUN = process.argv.includes("--dry-run");

function log(msg: string) {
  console.log(`\x1b[36m→\x1b[0m ${msg}`);
}

function success(msg: string) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

function error(msg: string) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
}

function run(cmd: string, opts?: { silent?: boolean; step?: string }): string {
  if (DRY_RUN && !cmd.startsWith("git status") && !cmd.startsWith("cat")) {
    log(`[dry-run] Would run: ${cmd}`);
    return "";
  }
  try {
    const result = execSync(cmd, { cwd: ROOT, encoding: "utf-8" });
    if (!opts?.silent) {
      log(cmd);
    }
    return result.trim();
  } catch (err) {
    const step = opts?.step ? ` during "${opts.step}"` : "";
    const stderr =
      err instanceof Error && "stderr" in err ? String(err.stderr) : "";
    throw new Error(
      `Command failed${step}: ${cmd}\n${stderr || (err instanceof Error ? err.message : String(err))}`
    );
  }
}

function ask(question: string): string {
  return prompt(`\x1b[33m?\x1b[0m ${question}`) ?? "";
}

function readConfig(): { version: string; build: number; gistId: string } {
  const content = readFileSync(CONFIG_PATH, "utf-8");

  const versionRe = /export const version = "([^"]+)"/;
  const buildRe = /export const build = (\d+)/;
  const gistIdRe = /id: "([^"]+)"/;

  const version = versionRe.exec(content)?.[1];
  const buildStr = buildRe.exec(content)?.[1];
  const gistId = gistIdRe.exec(content)?.[1];

  if (!version || !buildStr || !gistId) {
    throw new Error("Could not parse config.ts");
  }

  return { version, build: parseInt(buildStr, 10), gistId };
}

function updateBuild(newBuild: number): void {
  let content = readFileSync(CONFIG_PATH, "utf-8");
  content = content.replace(
    /export const build = \d+/,
    `export const build = ${newBuild}`
  );
  if (!DRY_RUN) {
    writeFileSync(CONFIG_PATH, content);
  }
}

function getUnreleasedChanges(): string {
  const content = readFileSync(CHANGELOG_PATH, "utf-8");
  const unreleasedRe = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/;
  return unreleasedRe.exec(content)?.[1]?.trim() ?? "";
}

function main() {
  console.log("\n\x1b[1m📦 HackerWeb Tools Publisher\x1b[0m\n");

  if (DRY_RUN) {
    console.log("\x1b[33m⚠ DRY RUN MODE - no changes will be made\x1b[0m\n");
  }

  // Require clean working tree
  const status = run("git status --porcelain", { silent: true });
  const unstagedChanges = status
    .split("\n")
    .filter((line) => line.startsWith(" M") || line.startsWith("??"));
  if (unstagedChanges.length > 0) {
    error("Working tree has unstaged changes. Commit or stash first.");
    console.log(unstagedChanges.join("\n"));
    process.exit(1);
  }

  const config = readConfig();
  const newBuild = config.build + 1;
  const fullVersion = `${config.version}.${newBuild}`;
  const tag = `v${fullVersion}`;

  log(`Current: v${config.version}.${config.build}`);
  log(`New:     ${tag}`);
  console.log();

  const unreleased = getUnreleasedChanges();
  if (unreleased) {
    console.log("\x1b[2mUnreleased changes:\x1b[0m");
    console.log(unreleased);
    console.log();
  }

  if (!DRY_RUN) {
    const answer = ask("Publish this version? [y/N]");
    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  log("Incrementing build number...");
  updateBuild(newBuild);
  success(`Updated config.ts: build = ${newBuild}`);

  log("Building userscript...");
  run("bun run build", { step: "building userscript" });
  success("Built dist/hackerweb-tools.user.js");

  log("Running checks...");
  run("bun run typecheck", { step: "typecheck" });
  run("bun run lint", { step: "lint" });
  run("bun run test:run", { step: "tests" });
  success("All checks passed");

  log("Committing...");
  run("git add config.ts", { step: "staging files" });
  run(`git commit -m "Release ${tag}"`, { step: "committing" });
  success(`Committed: Release ${tag}`);

  log("Tagging...");
  run(`git tag -a ${tag} -m "Release ${tag}"`, { step: "creating tag" });
  success(`Tagged: ${tag}`);

  log("Pushing to GitHub...");
  run("git push", { step: "pushing to GitHub" });
  run("git push --tags", { step: "pushing tags" });
  success("Pushed to origin");

  log("Updating gist...");
  run(`gh gist edit ${config.gistId} ${DIST_PATH}`, { step: "updating gist" });
  success("Gist updated");

  console.log(`\n\x1b[32m✓ Published ${tag}\x1b[0m\n`);
  console.log(`Gist: https://gist.github.com/${config.gistId}`);
}

try {
  main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  error(message);
  process.exit(1);
}
