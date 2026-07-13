# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- One shared Saved library for stories and comments across Hacker News and
  HackerWeb, with search, type filters, sorting, JSON import/export, and legacy
  bookmark migration
- Remembered Dark, Light, and System theme choices, with Dark as the default
- Searchable Settings panel with enabled-feature summary
- Responsive full-screen settings sheet for small screens
- Dialog semantics, focus trapping, labelled controls, and live announcements
- Explicit saved/reload state for page-level feature changes
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

- Saved now uses one versioned userscript-storage document and the existing
  Tools drawer instead of separate origin-local keys, a second floating button,
  and a second panel
- HackerWeb dark mode now uses explicit colors instead of whole-page inversion;
  progress, copy feedback, favicons, settings, and Saved remain theme-correct
- Settings are grouped accurately by HackerWeb, Hacker News, and shared scope
- Settings features and counts are scoped to the current site/origin
- Comfort mode is enabled by default on Hacker News; copy-comment links are
  disabled by default on HackerWeb, keeping four default-enabled features
- HackerWeb readability and thread-rail styles are scoped to the active comments
  view
- Settings use a new warm-paper and graphite visual system
- Public feature documentation and userscript metadata reflect the full product
- Comment timestamp displays on same row as username
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

- Time grouping now handles current Hacker News timestamps without breaking table layout
- Time grouping targets the real HN item list and stays themed in dark mode
- Low story-score highlighting uses a reachable default threshold
- Explicit negative score preferences migrate without unexpectedly enabling dimming
- The HackerWeb story-link toggle now enables and disables its injected links live
- OP badges enhance HackerWeb's current native original-poster marker
- Closed settings are inert and restore focus and page overflow correctly
- Release dry-runs now execute every validation gate and report truthfully
- Publishing rejects all dirty-tree states and pushes only the intended branch/tag
- Publishing preflights branch synchronization, tag availability, GitHub auth, and gist ownership
- CI uses the repository's pinned Bun version and frozen lockfile
- Pre-commit lint and format jobs no longer race while rewriting staged files
- Dark mode text illegible in settings panel inputs
- Bookmark data lost on page reload (now persisted to localStorage)

## [1.0.0] - 2026-01-31

### Added

- Collapsible comment threads on hackerweb.app with state persistence
- Quick links to HackerWeb and hckrnews on news.ycombinator.com
- Multi-site userscript architecture
- Vite build system with vite-plugin-monkey
- ESLint, Prettier, and TypeScript strict mode configuration
