# HackerWeb Tools

Enhancements for Hacker News and HackerWeb.

## Install

**[Click to Install](https://gist.githubusercontent.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6/raw/hackerweb-tools.user.js)** (requires [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/))

## Features

### HackerWeb (hackerweb.app)

- **Collapsible comments** - Click the toggle or left gutter to collapse threads
- **Shift+click** - Collapse an entire thread from any comment
- **Hover highlighting** - See the ancestor chain when hovering over comments
- **State persistence** - Collapsed comments stay collapsed across sessions
- **Wider content** - More readable column width

### Hacker News (news.ycombinator.com)

- **Quick links** - Jump to HackerWeb or hckrnews from any story

## What are HackerWeb and hckrnews?

If you're new to the Hacker News ecosystem, these are two excellent alternative frontends:

- **[HackerWeb](https://hackerweb.app/)** - A fast, clean mobile-friendly interface for reading HN. Great for focused reading without distractions.
- **[hckrnews](https://hckrnews.com/)** - Shows HN stories organized by day with scores, making it easy to catch up on what you missed.

Both are read-only interfaces to the same Hacker News content.

---

## Development

```sh
bun install
bun run build          # Build userscript
bun run build:watch    # Rebuild on changes
```

### Local Testing

1. Enable "Allow access to file URLs" in extension settings
2. Create a new script with just a `@require` directive:
   ```js
   // ==UserScript==
   // @name        Local Dev - HackerWeb Tools
   // @match       https://hackerweb.app/*
   // @match       https://news.ycombinator.com/*
   // @require     file:///path/to/dist/hackerweb-tools.user.js
   // ==/UserScript==
   ```
3. Run `bun run build:watch`
4. Refresh the page to pick up changes

### Publishing

```sh
bun run publish        # Increment build, commit, tag, push, update gist
bun run publish:dry    # Preview without changes
```

---

**[View on Gist](https://gist.github.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6)** · **[View on GitHub](https://github.com/swhitt/hackerweb-tools)**
