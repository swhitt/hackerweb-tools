#!/usr/bin/env bun
/**
 * Publish script for gist releases.
 *
 * Usage: bun run publish [--dry-run]
 *
 * Steps:
 * 1. Increment build number in config.ts
 * 2. Build the userscript
 * 3. Commit with tag v{version}-{build}
 * 4. Push to GitHub and update gist
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

function run(cmd: string, opts?: { silent?: boolean }): string {
  if (DRY_RUN && !cmd.startsWith("git status") && !cmd.startsWith("cat")) {
    log(`[dry-run] Would run: ${cmd}`);
    return "";
  }
  const result = execSync(cmd, { cwd: ROOT, encoding: "utf-8" });
  if (!opts?.silent) {
    log(cmd);
  }
  return result.trim();
}

function ask(question: string): string {
  return prompt(`\x1b[33m?\x1b[0m ${question}`) ?? "";
}

// Read and parse config
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

// Update build number in config
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

// Get unreleased changes from CHANGELOG
function getUnreleasedChanges(): string {
  const content = readFileSync(CHANGELOG_PATH, "utf-8");
  const unreleasedRe = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/;
  return unreleasedRe.exec(content)?.[1]?.trim() ?? "";
}

// Main
function main() {
  console.log("\n\x1b[1m📦 HackerWeb Tools Publisher\x1b[0m\n");

  if (DRY_RUN) {
    console.log("\x1b[33m⚠ DRY RUN MODE - no changes will be made\x1b[0m\n");
  }

  // Check for clean working tree (allow staged changes)
  const status = run("git status --porcelain", { silent: true });
  const unstagedChanges = status
    .split("\n")
    .filter((line) => line.startsWith(" M") || line.startsWith("??"));
  if (unstagedChanges.length > 0) {
    error("Working tree has unstaged changes. Commit or stash first.");
    console.log(unstagedChanges.join("\n"));
    process.exit(1);
  }

  // Read current config
  const config = readConfig();
  const newBuild = config.build + 1;
  const fullVersion = `${config.version}-${newBuild}`;
  const tag = `v${fullVersion}`;

  log(`Current: v${config.version}-${config.build}`);
  log(`New:     ${tag}`);
  console.log();

  // Show unreleased changes
  const unreleased = getUnreleasedChanges();
  if (unreleased) {
    console.log("\x1b[2mUnreleased changes:\x1b[0m");
    console.log(unreleased);
    console.log();
  }

  // Confirm
  if (!DRY_RUN) {
    const answer = ask("Publish this version? [y/N]");
    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  // 1. Increment build number
  log("Incrementing build number...");
  updateBuild(newBuild);
  success(`Updated config.ts: build = ${newBuild}`);

  // 2. Build
  log("Building userscript...");
  run("bun run build");
  success("Built dist/hackerweb-tools.user.js");

  // 3. Stage and commit
  log("Committing...");
  run("git add config.ts dist/hackerweb-tools.user.js");
  run(`git commit -m "Release ${tag}"`);
  success(`Committed: Release ${tag}`);

  // 4. Tag
  log("Tagging...");
  run(`git tag -a ${tag} -m "Release ${tag}"`);
  success(`Tagged: ${tag}`);

  // 5. Push to GitHub
  log("Pushing to GitHub...");
  run("git push");
  run("git push --tags");
  success("Pushed to origin");

  // 6. Update gist
  log("Updating gist...");
  run(`gh gist edit ${config.gistId} ${DIST_PATH}`);
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
