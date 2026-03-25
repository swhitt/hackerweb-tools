# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Font size and line height display settings
- Bookmarks panel stores post title, author, and comment preview
- Bookmarks panel pagination (5 per page)
- Comfort mode setting (centered layout, larger fonts, better spacing)
- Shift+click toggle to collapse entire comment thread
- Left gutter click to collapse comments
- Hover highlighting for ancestor comment chain
- Publish script for automated gist releases (`bun run publish`)
- Chevron toggle indicators with CSS rotation animation
- Pre-commit hooks with lefthook (lint, format, typecheck)
- Auto-update support from GitHub gist

### Changed

- Display settings (max width, font size, line height) use number inputs
- Display settings apply reactively via CSS custom properties
- Bookmarks panel restyled to match settings panel, with dark mode
- Bookmarks panel updates live when starring/unstarring comments
- Bookmark star positioned inline with username
- Max content width targets `.view` elements instead of `body > section`
- Dark mode completely rewritten with better color palette
- Settings panel uses warm toned palette matching HN design
- Score threshold only highlights score number, no longer bolds titles
- Domain badges now uniform subtle style (removed per-site coloring)
- Settings panel reactively syncs dark mode via MutationObserver
- localStorage errors now logged for debugging

### Fixed

- Dark mode text illegible in settings panel inputs
- Bookmark data lost on page reload (now persisted to localStorage)

## [1.0.0] - 2026-01-31

### Added

- Collapsible comment threads on hackerweb.app with state persistence
- Quick links to HackerWeb and hckrnews on news.ycombinator.com
- Multi-site userscript architecture
- Vite build system with vite-plugin-monkey
- ESLint, Prettier, and TypeScript strict mode configuration
