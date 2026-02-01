# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Shift+click toggle to collapse entire comment thread
- Left gutter click to collapse comments
- Hover highlighting for ancestor comment chain
- Publish script for automated gist releases (`bun run publish`)
- Chevron toggle indicators with CSS rotation animation
- Pre-commit hooks with lefthook (lint, format, typecheck)
- Auto-update support from GitHub gist

### Changed

- Wider content column on HackerWeb for better readability
- localStorage errors now logged for debugging

## [1.0.0] - 2026-01-31

### Added

- Collapsible comment threads on hackerweb.app with state persistence
- Quick links to HackerWeb and hckrnews on news.ycombinator.com
- Multi-site userscript architecture
- Vite build system with vite-plugin-monkey
- ESLint, Prettier, and TypeScript strict mode configuration
