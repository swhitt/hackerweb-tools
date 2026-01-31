# HackerWeb Tools

Enhancements for Hacker News and HackerWeb.

## Features

| Feature | Site | Description |
|---------|------|-------------|
| Collapsible comments | hackerweb.app | Collapse/expand comment threads with state persistence |
| Quick links | news.ycombinator.com | Links to HackerWeb and hckrnews |

## Setup

```sh
bun install
```

## Build

```sh
bun run build          # Build script
bun run build:watch    # Rebuild on changes
```

Output: `dist/hackerweb-tools.user.js`

## Install in Browser

### Tampermonkey / Violentmonkey

1. Open the extension dashboard
2. Create a new script
3. Paste the contents of `dist/hackerweb-tools.user.js`
4. Save

### Development (auto-reload)

For faster iteration, point the extension to your local build:

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
