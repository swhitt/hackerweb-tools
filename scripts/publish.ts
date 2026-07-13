#!/usr/bin/env bun
/**
 * Publish script for gist releases.
 *
 * Usage: bun run publish [--dry-run | --retry-gist]
 *
 * Steps:
 * 1. Require a completely clean working tree
 * 2. Run all validation checks without mutating release state
 * 3. Increment the build number and build the versioned userscript
 * 4. Commit and tag v{version}.{build}
 * 5. Atomically push that branch/tag and update the gist
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const CONFIG_PATH = resolve(ROOT, "config.ts");
const CHANGELOG_PATH = resolve(ROOT, "CHANGELOG.md");
const DIST_PATH = resolve(ROOT, "dist/hackerweb-tools.user.js");

const DRY_RUN = process.argv.includes("--dry-run");
const RETRY_GIST = process.argv.includes("--retry-gist");
const RELEASE_BRANCH = "main";
const EXPECTED_MATCHES = [
  "https://hackerweb.app/*",
  "https://news.ycombinator.com/*",
] as const;
const EXPECTED_GRANTS = [
  "GM_addStyle",
  "GM_addValueChangeListener",
  "GM_getValue",
  "GM_setValue",
] as const;

interface RunOptions {
  silent?: boolean;
  step?: string;
  trim?: boolean;
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

/** Run dynamic arguments without shell interpolation. */
function runFile(command: string, args: string[], opts?: RunOptions): string {
  try {
    const result = execFileSync(command, args, {
      cwd: ROOT,
      encoding: "utf-8",
    });
    if (!opts?.silent) log([command, ...args].join(" "));
    return opts?.trim === false ? result : result.trim();
  } catch (err) {
    const step = opts?.step ? ` during "${opts.step}"` : "";
    const stderr =
      err instanceof Error && "stderr" in err ? String(err.stderr) : "";
    throw new Error(
      `Command failed${step}: ${command} ${args.join(" ")}\n${stderr || (err instanceof Error ? err.message : String(err))}`,
      { cause: err }
    );
  }
}

function ask(question: string): string {
  return prompt(`\x1b[33m?\x1b[0m ${question}`) ?? "";
}

function readConfig(): {
  version: string;
  build: number;
  gistUser: string;
  gistId: string;
  gistFilename: string;
} {
  const content = readFileSync(CONFIG_PATH, "utf-8");

  const versionRe = /export const version = "([^"]+)"/;
  const buildRe = /export const build = (\d+)/;
  const gistUserRe = /user: "([^"]+)"/;
  const gistIdRe = /id: "([^"]+)"/;
  const gistFilenameRe = /filename: "([^"]+)"/;

  const version = versionRe.exec(content)?.[1];
  const buildStr = buildRe.exec(content)?.[1];
  const gistUser = gistUserRe.exec(content)?.[1];
  const gistId = gistIdRe.exec(content)?.[1];
  const gistFilename = gistFilenameRe.exec(content)?.[1];

  if (!version || !buildStr || !gistUser || !gistId || !gistFilename) {
    throw new Error("Could not parse config.ts");
  }

  return {
    version,
    build: parseInt(buildStr, 10),
    gistUser,
    gistId,
    gistFilename,
  };
}

type ReleaseConfig = ReturnType<typeof readConfig>;

function expectedUpdateUrl(config: ReleaseConfig): string {
  return `https://gist.githubusercontent.com/${config.gistUser}/${config.gistId}/raw/${config.gistFilename}`;
}

function assertEqual(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`);
  }
}

function assertStringSet(
  actual: readonly string[],
  expected: readonly string[],
  label: string
): void {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  if (JSON.stringify(actualSorted) !== JSON.stringify(expectedSorted)) {
    throw new Error(
      `${label} mismatch: expected ${expectedSorted.join(", ")}, got ${actualSorted.join(", ")}`
    );
  }
}

/** Fail closed if the generated userscript has unexpected release metadata. */
function verifyBuiltArtifact(
  config: ReleaseConfig,
  expectedVersion: string
): void {
  const artifact = readFileSync(DIST_PATH, "utf-8");
  const headerEnd = artifact.indexOf("// ==/UserScript==");
  if (!artifact.startsWith("// ==UserScript==") || headerEnd < 0) {
    throw new Error("Built artifact has no valid userscript metadata block");
  }

  const metadata = new Map<string, string[]>();
  const header = artifact.slice(0, headerEnd);
  for (const line of header.split("\n")) {
    const match = /^\/\/ @(\S+)\s+(.+)$/.exec(line);
    if (!match?.[1] || !match[2]) continue;
    const values = metadata.get(match[1]) ?? [];
    values.push(match[2].trim());
    metadata.set(match[1], values);
  }

  const singleValue = (key: string): string => {
    const values = metadata.get(key) ?? [];
    if (values.length !== 1 || !values[0]) {
      throw new Error(`Built artifact must contain exactly one @${key}`);
    }
    return values[0];
  };

  const updateUrl = expectedUpdateUrl(config);
  assertEqual(singleValue("version"), expectedVersion, "@version");
  assertEqual(singleValue("updateURL"), updateUrl, "@updateURL");
  assertEqual(singleValue("downloadURL"), updateUrl, "@downloadURL");
  assertEqual(singleValue("run-at"), "document-end", "@run-at");
  assertStringSet(metadata.get("match") ?? [], EXPECTED_MATCHES, "@match");
  assertStringSet(metadata.get("grant") ?? [], EXPECTED_GRANTS, "@grant");

  if (!/^\/\/ @noframes\s*$/m.test(header)) {
    throw new Error("Built artifact must contain @noframes");
  }
}

function preflightGist(config: ReleaseConfig): void {
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
}

function updateAndVerifyGist(config: ReleaseConfig): void {
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

  const localArtifact = readFileSync(DIST_PATH, "utf-8");
  const remoteArtifact = runFile(
    "gh",
    ["gist", "view", config.gistId, "--filename", config.gistFilename, "--raw"],
    { silent: true, step: "verifying gist contents", trim: false }
  );
  assertEqual(remoteArtifact, localArtifact, "Published gist artifact");
}

function retryGist(config: ReleaseConfig, branch: string): void {
  const fullVersion = `${config.version}.${config.build}`;
  const tag = `v${fullVersion}`;
  const head = runFile("git", ["rev-parse", "HEAD"], { silent: true });
  const remoteHead = runFile("git", ["rev-parse", `origin/${branch}`], {
    silent: true,
  });
  assertEqual(head, remoteHead, `${branch} and origin/${branch}`);

  const taggedCommit = runFile("git", ["rev-list", "-n", "1", tag], {
    silent: true,
    step: "checking the local release tag",
  });
  assertEqual(taggedCommit, head, `${tag} target`);

  const remoteTagLine = runFile(
    "git",
    ["ls-remote", "origin", `refs/tags/${tag}^{}`],
    { silent: true, step: "checking the remote release tag" }
  );
  const remoteTaggedCommit = remoteTagLine.split(/\s+/)[0] ?? "";
  assertEqual(remoteTaggedCommit, head, `origin ${tag} target`);

  log(`Rebuilding ${tag} for gist recovery...`);
  runFile("bun", ["run", "build"], { step: "building userscript" });
  verifyBuiltArtifact(config, fullVersion);
  success(`Verified local ${tag} artifact and remote release state`);

  const answer = ask(`Retry gist upload for ${tag}? [y/N]`);
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    return;
  }

  updateAndVerifyGist(config);
  success(`Gist updated and verified for ${tag}`);
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

  if (DRY_RUN && RETRY_GIST) {
    throw new Error("Choose either --dry-run or --retry-gist, not both");
  }

  if (DRY_RUN) {
    console.log(
      "\x1b[33m⚠ DRY RUN MODE - release metadata and remotes will not change\x1b[0m\n"
    );
  }

  // Require clean working tree
  const status = runFile("git", ["status", "--porcelain"], { silent: true });
  if (status) {
    error("Working tree is not clean. Commit or stash every change first.");
    console.log(status);
    process.exit(1);
  }

  const config = readConfig();
  const newBuild = config.build + 1;
  const fullVersion = `${config.version}.${newBuild}`;
  const tag = `v${fullVersion}`;
  const branch = runFile("git", ["branch", "--show-current"], {
    silent: true,
  });

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

  preflightGist(config);

  if (RETRY_GIST) {
    retryGist(config, branch);
    return;
  }

  const localTag = runFile("git", ["tag", "--list", tag], { silent: true });
  if (localTag) throw new Error(`Local tag already exists: ${tag}`);

  const remoteTag = runFile(
    "git",
    ["ls-remote", "--tags", "origin", `refs/tags/${tag}`],
    { silent: true, step: "checking the proposed release tag" }
  );
  if (remoteTag) throw new Error(`Remote tag already exists: ${tag}`);

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
  runFile("bun", ["run", "deps:audit"], { step: "dependency audit" });
  runFile("bun", ["run", "typecheck"], { step: "typecheck" });
  runFile("bun", ["run", "lint"], { step: "lint" });
  runFile("bun", ["run", "format:check"], { step: "format check" });
  runFile("bun", ["run", "test:run"], { step: "tests" });
  runFile("bun", ["run", "build"], { step: "build" });
  verifyBuiltArtifact(config, `${config.version}.${config.build}`);
  success("Audit, typecheck, lint, format, tests, and build passed");

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
  runFile("bun", ["run", "build"], { step: "building userscript" });
  verifyBuiltArtifact(config, fullVersion);
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
  updateAndVerifyGist(config);
  success("Gist updated and verified");

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
