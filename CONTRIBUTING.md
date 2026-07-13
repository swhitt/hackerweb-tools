# Contributing to HackerWeb Tools

## Development Setup

```sh
bun install
bun run hooks:install # optional; skip when using a custom core.hooksPath
bun run build:watch
```

## Testing Locally

1. Enable "Allow access to file URLs" in your userscript extension (Tampermonkey/Violentmonkey)
2. Create a dev script pointing to your local build:

```js
// ==UserScript==
// @name        Local Dev - HackerWeb Tools
// @match       https://hackerweb.app/*
// @match       https://news.ycombinator.com/*
// @require     file:///path/to/dist/hackerweb-tools.user.js
// ==/UserScript==
```

3. Refresh the page to pick up changes (the `build:watch` rebuilds automatically)

## Code Style

- **ESLint**: `bun run lint` (fix with `bun run lint:fix`)
- **Prettier**: `bun run format:check` (fix with `bun run format`)
- **TypeScript**: Strict mode enabled; run `bun run typecheck`

After `bun run hooks:install`, Lefthook runs lint, format, and type checks on
commit. Hook installation is explicit so dependency installs remain reliable
for contributors who manage Git hooks globally.

## Adding a New Site Feature

1. Create a directory: `src/sites/<sitename>/features/<featurename>/`
2. Add feature files:
   - `index.ts` - exports `init()` function
   - `ui.ts` - DOM manipulation
   - `styles.ts` - CSS styles (optional)
   - `state.ts` - state management (optional)
3. Import and call `init()` in `src/sites/<sitename>/index.ts`
4. Add `@match` pattern to `vite/config.ts` if targeting a new domain

Example structure:

```
src/sites/mysite/
  index.ts
  features/
    my-feature/
      index.ts
      ui.ts
      styles.ts
```

## Running Tests

```sh
bun run test        # Watch mode
bun run test:run    # Single run
```

## Releasing

The userscript version comes only from `config.ts`; `package.json` is private
toolchain metadata and has no release version. From a clean `main` branch:

```sh
bun run publish:dry
bun run publish
```

The publisher validates the repository and gist, creates the release commit and
tag, atomically pushes both, then updates and verifies the install gist. If the
push succeeds but the gist step fails, resume that same release with
`bun run publish --retry-gist` instead of incrementing the build again.

## PR Checklist

- [ ] Code passes `bun run lint` and `bun run format:check`
- [ ] TypeScript compiles without errors (`bun run typecheck`)
- [ ] Tests pass (`bun run test:run`)
- [ ] Production userscript builds (`bun run build`)
- [ ] Tested manually in browser with Tampermonkey/Violentmonkey
- [ ] Updated README if adding new features
