#!/usr/bin/env bun
/**
 * Publish script for gist releases.
 *
 * Usage: bun run publish [--dry-run]
 *
 * Steps:
 * 1. Require a completely clean working tree
 * 2. Run all validation checks without mutating release state
 * 3. Increment the build number and build the versioned userscript
 * 4. Commit and tag v{version}.{build}
 * 5. Atomically push that branch/tag and update the gist
 */

import { readFileSync, writeFileSync } from "fs";
import { execFileSync, execSync } from "child_process";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const CONFIG_PATH = resolve(ROOT, "config.ts");
const CHANGELOG_PATH = resolve(ROOT, "CHANGELOG.md");
const DIST_PATH = resolve(ROOT, "dist/hackerweb-tools.user.js");

const DRY_RUN = process.argv.includes("--dry-run");
const RELEASE_BRANCH = "main";

interface RunOptions {
  silent?: boolean;
  step?: string;
}

function log(msg: string) {
  console.log(`\x1b[36m→\x1b[0m ${msg}`);
}

function success(msg: string) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

function error(msg: string) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
}

function run(cmd: string, opts?: RunOptions): string {
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

/** Run dynamic arguments without shell interpolation. */
function runFile(command: string, args: string[], opts?: RunOptions): string {
  try {
    const result = execFileSync(command, args, {
      cwd: ROOT,
      encoding: "utf-8",
    });
    if (!opts?.silent) log([command, ...args].join(" "));
    return result.trim();
  } catch (err) {
    const step = opts?.step ? ` during "${opts.step}"` : "";
    const stderr =
      err instanceof Error && "stderr" in err ? String(err.stderr) : "";
    throw new Error(
      `Command failed${step}: ${command} ${args.join(" ")}\n${stderr || (err instanceof Error ? err.message : String(err))}`
    );
  }
}

function ask(question: string): string {
  return prompt(`\x1b[33m?\x1b[0m ${question}`) ?? "";
}

function readConfig(): {
  version: string;
  build: number;
  gistId: string;
  gistFilename: string;
} {
  const content = readFileSync(CONFIG_PATH, "utf-8");

  const versionRe = /export const version = "([^"]+)"/;
  const buildRe = /export const build = (\d+)/;
  const gistIdRe = /id: "([^"]+)"/;
  const gistFilenameRe = /filename: "([^"]+)"/;

  const version = versionRe.exec(content)?.[1];
  const buildStr = buildRe.exec(content)?.[1];
  const gistId = gistIdRe.exec(content)?.[1];
  const gistFilename = gistFilenameRe.exec(content)?.[1];

  if (!version || !buildStr || !gistId || !gistFilename) {
    throw new Error("Could not parse config.ts");
  }

  return {
    version,
    build: parseInt(buildStr, 10),
    gistId,
    gistFilename,
  };
}

function updateBuild(newBuild: number): void {
  let content = readFileSync(CONFIG_PATH, "utf-8");
  content = content.replace(
    /export const build = \d+/,
    `export const build = ${newBuild}`
  );
  writeFileSync(CONFIG_PATH, content);
}

function getUnreleasedChanges(): string {
  const content = readFileSync(CHANGELOG_PATH, "utf-8");
  const unreleasedRe = /## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/;
  return unreleasedRe.exec(content)?.[1]?.trim() ?? "";
}

function main() {
  console.log("\n\x1b[1m📦 HackerWeb Tools Publisher\x1b[0m\n");

  if (DRY_RUN) {
    console.log(
      "\x1b[33m⚠ DRY RUN MODE - release metadata and remotes will not change\x1b[0m\n"
    );
  }

  // Require clean working tree
  const status = run("git status --porcelain", { silent: true });
  if (status) {
    error("Working tree is not clean. Commit or stash every change first.");
    console.log(status);
    process.exit(1);
  }

  const config = readConfig();
  const newBuild = config.build + 1;
  const fullVersion = `${config.version}.${newBuild}`;
  const tag = `v${fullVersion}`;
  const branch = run("git branch --show-current", { silent: true });

  if (branch !== RELEASE_BRANCH) {
    throw new Error(
      `Releases must run from ${RELEASE_BRANCH}; current branch is ${branch || "detached HEAD"}`
    );
  }

  runFile("git", ["fetch", "--quiet", "origin", branch], {
    silent: true,
    step: "refreshing the release branch",
  });
  runFile("git", ["merge-base", "--is-ancestor", `origin/${branch}`, "HEAD"], {
    silent: true,
    step: "checking release branch synchronization",
  });

  const localTag = runFile("git", ["tag", "--list", tag], { silent: true });
  if (localTag) throw new Error(`Local tag already exists: ${tag}`);

  const remoteTag = runFile(
    "git",
    ["ls-remote", "--tags", "origin", `refs/tags/${tag}`],
    { silent: true, step: "checking the proposed release tag" }
  );
  if (remoteTag) throw new Error(`Remote tag already exists: ${tag}`);

  runFile("gh", ["auth", "status"], {
    silent: true,
    step: "checking GitHub CLI authentication",
  });
  const authenticatedUser = runFile("gh", ["api", "user", "--jq", ".login"], {
    silent: true,
    step: "checking the authenticated GitHub user",
  });
  const gistOwner = runFile(
    "gh",
    ["api", `/gists/${config.gistId}`, "--jq", ".owner.login"],
    { silent: true, step: "checking gist ownership" }
  );
  if (authenticatedUser.toLowerCase() !== gistOwner.toLowerCase()) {
    throw new Error(
      `Authenticated GitHub user ${authenticatedUser} does not own gist ${config.gistId} (${gistOwner})`
    );
  }
  const gistFiles = runFile("gh", ["gist", "view", config.gistId, "--files"], {
    silent: true,
    step: "checking the release gist filename",
  });
  if (!gistFiles.split("\n").includes(config.gistFilename)) {
    throw new Error(
      `Gist ${config.gistId} does not contain ${config.gistFilename}`
    );
  }

  log(`Current: v${config.version}.${config.build}`);
  log(`New:     ${tag}`);
  console.log();

  const unreleased = getUnreleasedChanges();
  if (unreleased) {
    console.log("\x1b[2mUnreleased changes:\x1b[0m");
    console.log(unreleased);
    console.log();
  }

  log("Running release checks...");
  run("bun run typecheck", { step: "typecheck" });
  run("bun run lint", { step: "lint" });
  run("bun run format:check", { step: "format check" });
  run("bun run test:run", { step: "tests" });
  run("bun run build", { step: "build" });
  success("Typecheck, lint, format, tests, and build passed");

  if (DRY_RUN) {
    console.log(
      `\n\x1b[32m✓ ${tag} is ready to publish; no tracked release state was changed.\x1b[0m\n`
    );
    return;
  }

  const answer = ask("Publish this version? [y/N]");
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    process.exit(0);
  }

  log("Incrementing build number...");
  updateBuild(newBuild);
  success(`Updated config.ts: build = ${newBuild}`);

  log("Building userscript...");
  run("bun run build", { step: "building userscript" });
  success("Built dist/hackerweb-tools.user.js");

  log("Committing...");
  runFile("git", ["add", "config.ts"], { step: "staging files" });
  runFile("git", ["commit", "-m", `Release ${tag}`], {
    step: "committing",
  });
  success(`Committed: Release ${tag}`);

  log("Tagging...");
  runFile("git", ["tag", "-a", tag, "-m", `Release ${tag}`], {
    step: "creating tag",
  });
  success(`Tagged: ${tag}`);

  log("Pushing to GitHub...");
  runFile("git", ["push", "--atomic", "origin", branch, tag], {
    step: "pushing release commit and tag",
  });
  success(`Pushed ${branch} and ${tag} to origin`);

  log("Updating gist...");
  runFile(
    "gh",
    [
      "gist",
      "edit",
      config.gistId,
      "--filename",
      config.gistFilename,
      DIST_PATH,
    ],
    { step: "updating gist" }
  );
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
