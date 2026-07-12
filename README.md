# HackerWeb Tools

A userscript that adds thread controls, display options, keyboard navigation,
saved comments, and other optional tools to
[Hacker News](https://news.ycombinator.com/) and
[HackerWeb](https://hackerweb.app/).

HackerWeb Tools is an independent userscript and is not affiliated with Y
Combinator or the Hacker News/HackerWeb projects.

## Install

**[Install HackerWeb Tools](https://gist.githubusercontent.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6/raw/hackerweb-tools.user.js)**

Requires [Tampermonkey](https://www.tampermonkey.net/) or
[Violentmonkey](https://violentmonkey.github.io/). Updates are delivered through
the same userscript URL.

## Settings

Open **Tools** or press `,` on either supported site. Settings let you:

- Search every feature and control with `/`
- See how many tools are enabled for the current site
- Tune HackerWeb width, typography, and collapse behavior
- Tune Hacker News story-score signals
- Pause all configured enhancements on the current site
- Reset all settings to their defaults

Settings stay in page-local browser storage. Because Hacker News and HackerWeb
are different origins, configure each one from its own site; shared tools are
available on both but their preferences do not cross between them. The drawer is
keyboard accessible, traps focus while open, closes with `Escape`, and becomes a
full-screen sheet on small screens.

Preferences save immediately. Reload after disabling a page-level feature to
ensure that previously injected elements and listeners are removed.

## Features

Four features start enabled. All other features are disabled by default and can
be enabled in Settings.

### HackerWeb

| Feature                | Default | What it does                                                                                      |
| ---------------------- | :-----: | ------------------------------------------------------------------------------------------------- |
| Thread collapsing      |   On    | Collapse a branch from its toggle, the left gutter, or with Shift-click; collapsed state persists |
| OP badge               |   On    | Makes comments from the original poster easy to spot                                              |
| Copy comment links     |   Off   | Copies the matching HN permalink when you click a comment timestamp                               |
| New-comment highlight  |   Off   | Marks comments added since your previous visit                                                    |
| Auto-collapse by depth |   Off   | Starts deeply nested discussions collapsed at a configurable depth                                |

HackerWeb readability styles are scoped to the active comments view. They add
visible thread rails and ancestor highlighting, plus configurable content width,
font size, line height, and gutter target size.

### Hacker News

| Feature               | Default | What it does                                                            |
| --------------------- | :-----: | ----------------------------------------------------------------------- |
| HackerWeb story links |   On    | Adds a `[hweb]` shortcut beside every story                             |
| Hide read stories     |   Off   | Tracks opened stories and adds a read-story filter                      |
| Story score signals   |   Off   | Emphasizes high scores and fades stories below a configurable threshold |
| Time grouping         |   Off   | Separates stories into useful age bands                                 |
| Story favicons        |   Off   | Adds site favicons beside stories using Google's favicon service        |
| Comfort mode          |   On    | Centers the page and increases reading size and spacing                 |

An `hckrnews` shortcut is also added to the Hacker News header.

### Both sites

| Feature             | Default | What it does                                              |
| ------------------- | :-----: | --------------------------------------------------------- |
| Keyboard navigation |   Off   | Adds vim-style navigation for stories and comment threads |
| Dark-mode sync      |   Off   | Follows the operating-system light/dark preference        |
| Reading progress    |   Off   | Shows a minimal page-progress indicator                   |
| Comment bookmarks   |   Off   | Saves comments with their story, author, and preview text |

With keyboard navigation enabled, press `?` for the shortcuts available on the
current site. `j` and `k` move through the current story or comment list.

## Development

The project is a strict TypeScript userscript built with Bun, Vite, and
`vite-plugin-monkey`.

```sh
bun install
bun run typecheck
bun run lint
bun run format:check
bun run test:run
bun run build
```

### Local testing

1. Enable **Allow access to file URLs** in your userscript extension.
2. Create a development userscript that points at the local build:

   ```js
   // ==UserScript==
   // @name        Local Dev - HackerWeb Tools
   // @match       https://hackerweb.app/*
   // @match       https://news.ycombinator.com/*
   // @require     file:///absolute/path/to/dist/hackerweb-tools.user.js
   // ==/UserScript==
   ```

3. Run `bun run build:watch` and refresh the target page after changes.

See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture conventions and the PR
checklist.

### Publishing

```sh
bun run publish:dry    # Inspect the proposed release
bun run publish        # Validate, tag, push, and update the install gist
```

Publishing requires push access to this repository and an authenticated `gh`
session with access to the configured gist.

---

**[Install](https://gist.githubusercontent.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6/raw/hackerweb-tools.user.js)** ·
**[View the gist](https://gist.github.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6)** ·
**[View on GitHub](https://github.com/swhitt/hackerweb-tools)**
