# Release Rules

## Versioning

- Version format: `{version}-{build}` (e.g., `0.0.1-3`)
- `version`: Bump for releases with breaking changes or major features
- `build`: Increment for each gist push within a version

## Publishing

Use `bun run publish` for releases. The script:

1. Increments build number in `config.ts`
2. Builds the userscript
3. Commits with tag `v{version}-{build}`
4. Pushes to GitHub with tags
5. Updates the gist

Use `bun run publish:dry` to preview without making changes.

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

- Release commits are auto-generated: `Release v0.0.1-3`
- Don't manually create release commits
- Pre-release work should be committed separately
