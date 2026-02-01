# Contributing to HackerWeb Tools

## Development Setup

```sh
bun install
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

Lefthook runs lint and format checks automatically on commit.

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

## PR Checklist

- [ ] Code passes `bun run lint` and `bun run format:check`
- [ ] TypeScript compiles without errors (`bun run typecheck`)
- [ ] Tests pass (`bun run test:run`)
- [ ] Tested manually in browser with Tampermonkey/Violentmonkey
- [ ] Updated README if adding new features
