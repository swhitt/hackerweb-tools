# Userscripts

A collection of userscripts for Hacker News and HackerWeb.

## Scripts

| Script | Target Site | Description |
|--------|-------------|-------------|
| hackerweb-collapse | hackerweb.app | Collapsible comment threads with state persistence |
| hn-links | news.ycombinator.com | Quick links to HackerWeb and hckrnews |

## Setup

```sh
bun install
```

## Build

```sh
bun run build          # Build all scripts
bun run build:watch    # Rebuild on changes
```

Output: `dist/*.user.js`

## Install in Browser

### Tampermonkey / Violentmonkey

1. Open the extension dashboard
2. Create a new script
3. Paste the contents of `dist/<script>.user.js`
4. Save

### Development (auto-reload)

For faster iteration, point the extension to your local build:

1. Enable "Allow access to file URLs" in extension settings
2. Create a new script with just a `@require` directive:
   ```js
   // ==UserScript==
   // @name        Local Dev - HN Links
   // @match       https://news.ycombinator.com/*
   // @require     file:///path/to/dist/hn-links.user.js
   // ==/UserScript==
   ```
3. Run `bun run build:watch`
4. Refresh the page to pick up changes
