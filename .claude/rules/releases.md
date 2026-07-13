# Release Rules

## Versioning

- Userscript version format: `{version}.{build}` (e.g., `0.0.1.3`)
- `version`: Bump for releases with breaking changes or major features
- `build`: Increment for each gist push within a version
- `config.ts` is the sole source of truth for the distributed userscript
  version; `package.json` is private toolchain metadata and has no release
  version

## Publishing

Use `bun run publish` for releases. The script:

1. Requires a clean `main` worktree and preflights GitHub/gist access
2. Runs the dependency audit, typecheck, lint, format, tests, and a production
   build
3. Increments the build number in `config.ts` and rebuilds the userscript
4. Commits and tags `v{version}.{build}`
5. Atomically pushes `main` and the tag to GitHub
6. Updates and verifies the gist artifact

Use `bun run publish:dry` to preview without making changes.

If the GitHub push succeeds but the gist update fails, do not create another
release. Run `bun run publish --retry-gist`; it rebuilds the current tagged
release, verifies local and remote release state, and retries only the gist.

## CHANGELOG

Keep entries in `## [Unreleased]` section:

- **Compact**: One line per change
- **Accurate**: Describe what changed, not implementation details
- **Categorized**: Use Added, Changed, Fixed, Removed headers

Example:

```markdown
## [Unreleased]

### Added

- Shift+click to collapse entire thread

### Fixed

- localStorage errors now logged for debugging
```

## Commits

- Release commits are auto-generated: `Release v0.0.1.3`
- Don't manually create release commits
- Pre-release work should be committed separately
