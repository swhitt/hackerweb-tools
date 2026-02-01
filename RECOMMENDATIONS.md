# HackerWeb Tools - Improvement Recommendations

Aggregated analysis from parallel code review agents.

---

## Executive Summary

The codebase is well-organized with modern tooling (Bun, Vite, TypeScript strict mode). Main gaps are: **test coverage**, **CI/CD**, **contributor docs**, and **accessibility**.

### Quick Wins (< 1 hour each)

1. Add LICENSE file
2. Add Husky pre-commit hooks
3. Create GitHub Actions CI
4. Add keyboard navigation to toggles
5. Improve hover/focus states

---

## Priority 1: Critical

### Code Quality

| Issue                                      | Impact | Effort |
| ------------------------------------------ | ------ | ------ |
| Extract shared `injectStyles()` utility    | High   | Low    |
| Standardize DOM query helpers (`qs`/`qsa`) | Medium | Medium |
| MutationObserver cleanup (memory leak)     | Medium | Low    |

### Tooling

| Issue                      | Impact | Effort  |
| -------------------------- | ------ | ------- |
| Add GitHub Actions CI      | High   | Low     |
| Add Husky pre-commit hooks | High   | Low     |
| Add LICENSE file           | High   | Trivial |

### UX/Accessibility

| Issue                             | Impact | Effort |
| --------------------------------- | ------ | ------ |
| Keyboard navigation (Enter/Space) | High   | Low    |
| Custom focus indicators           | High   | Low    |
| Improved ARIA labels              | Medium | Low    |

---

## Priority 2: Important

### Code Quality

| Issue                                      | Impact | Effort |
| ------------------------------------------ | ------ | ------ |
| Fix unsafe `event.target as Element` casts | Medium | Low    |
| Add test coverage for UI functions         | High   | High   |
| Extract shared MutationObserver factory    | Low    | Low    |

### Tooling

| Issue                              | Impact | Effort  |
| ---------------------------------- | ------ | ------- |
| Add `test:ui` script for Vitest UI | Medium | Trivial |
| Add `.prettierignore`              | Low    | Trivial |
| Enable source maps for debugging   | Medium | Low     |

### UX/UI

| Issue                                | Impact | Effort |
| ------------------------------------ | ------ | ------ |
| Hover state transitions/animations   | Medium | Low    |
| Increase touch targets (44x44px min) | Medium | Low    |
| Stronger ancestor highlight          | Low    | Low    |

### Documentation

| Issue                  | Impact | Effort |
| ---------------------- | ------ | ------ |
| Create CONTRIBUTING.md | High   | Medium |
| Create CHANGELOG.md    | Medium | Low    |
| Add PR/issue templates | Medium | Low    |

---

## Priority 3: Nice to Have

### Code Quality

| Issue                             | Impact | Effort  |
| --------------------------------- | ------ | ------- |
| JSDoc for complex functions       | Medium | Medium  |
| Explicit return type annotations  | Low    | Low     |
| Named constants for magic numbers | Low    | Trivial |

### UX/UI

| Issue                                    | Impact | Effort |
| ---------------------------------------- | ------ | ------ |
| Settings menu (GM_registerMenuCommand)   | Medium | High   |
| Dark mode support (prefers-color-scheme) | Medium | Medium |
| Shift+click hint tooltip                 | Low    | Low    |
| Cross-tab state sync                     | Low    | Medium |

### Documentation

| Issue                           | Impact | Effort |
| ------------------------------- | ------ | ------ |
| Architecture overview in README | Medium | Medium |
| ARCHITECTURE.md                 | Low    | Medium |
| Conventional commits guidance   | Low    | Low    |

---

## Detailed Recommendations

### 1. Code Quality

**Extract Shared Utilities**

```
src/utils/
├── style-injector.ts   # Shared GM_addStyle/DOM fallback
├── dom-helpers.ts      # qs<T>(), qsa<T>() typed wrappers
└── observer-factory.ts # Debounced MutationObserver factory
```

**Fix Type Safety**

```typescript
// Before (unsafe)
const li = (event.target as Element).closest("li");

// After (safe)
const target = event.target;
if (!(target instanceof Element)) return;
const li = target.closest("li");
```

**Test Coverage Gaps**

- `ui.ts`: `createToggleButton()`, `setCollapsed()`, event handlers
- `item-links/ui.ts`: `injectStoryLinks()`, `injectCommentPageLink()`
- Integration tests with DOM snapshots

---

### 2. Tooling

**GitHub Actions CI** (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run format:check
      - run: bun run test:run
      - run: bun run build
```

**Pre-commit Hooks** (Husky + lint-staged)

```json
// package.json
"scripts": {
  "prepare": "husky install"
},
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.{json,md}": "prettier --write"
}
```

---

### 3. UX/Accessibility

**Keyboard Navigation**

```typescript
// Add to setupEventListeners()
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const btn = document.activeElement?.closest("button.hwc-toggle");
  if (btn) {
    event.preventDefault();
    btn.click();
  }
});
```

**Improved Styles**

```css
/* Better hover/focus states */
.hwc-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hwc-toggle:focus-visible {
  outline: 2px solid #ff6600;
  outline-offset: 2px;
}

/* Transitions */
.hwc-toggle {
  transition: background 0.15s ease;
}

/* Stronger ancestor highlight */
li.hwc-hl {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-left: 2px solid rgba(255, 102, 0, 0.3);
}
```

**Touch Targets**

```css
.hwc-toggle {
  min-width: 44px;
  min-height: 44px;
}
```

---

### 4. Documentation

**CONTRIBUTING.md** should cover:

- Development setup with `bun install` + `bun run build:watch`
- Testing userscript locally with file:// URLs
- Code style (ESLint, Prettier, TypeScript strict)
- How to add new site features
- PR checklist

**CHANGELOG.md** format:

```markdown
# Changelog

## [Unreleased]

### Added

- Chevron toggle icons
- Wider column layout
- Auto-update from gist

## [1.0.0] - 2026-01-31

- Initial release
```

---

## Implementation Order

**Sprint 1: Foundation (1-2 hours)**

1. Add LICENSE file
2. Add Husky + lint-staged
3. Create GitHub Actions CI
4. Fix 5 formatting issues

**Sprint 2: Accessibility (1-2 hours)**

1. Keyboard navigation
2. Focus indicators
3. ARIA label improvements
4. Touch target sizing

**Sprint 3: Code Quality (2-3 hours)**

1. Extract shared utilities
2. Fix type safety issues
3. Add basic UI tests

**Sprint 4: Documentation (1-2 hours)**

1. CONTRIBUTING.md
2. CHANGELOG.md
3. PR/issue templates
4. Expand README

---

## Metrics

| Category      | Current     | Target        |
| ------------- | ----------- | ------------- |
| Test coverage | ~5%         | 40%+          |
| Accessibility | Basic       | WCAG 2.1 AA   |
| CI/CD         | None        | Full pipeline |
| Docs          | README only | Full suite    |
