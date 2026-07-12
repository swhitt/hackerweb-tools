# HackerWeb Tools — Repository Review and Roadmap

Reviewed July 12, 2026.

## Executive summary

The repository has a strong foundation: strict TypeScript, small feature modules,
central config/state helpers, reusable DOM/style/observer utilities, CI, hooks,
and a green production build. The main architectural debt is no longer project
structure—it is **feature lifecycle consistency**. Settings expose the available
features, but many features still behave like one-way page enhancements instead
of mountable services that can be enabled, refreshed, and removed safely.

The current direction is a utilitarian userscript with a searchable Settings
panel, current-site context, and labels that match implemented behavior.

## Completed in this review

- Rebuilt the settings drawer as a searchable Settings panel
- Added current-site grouping, scope badges, relevant enabled-feature counts,
  and responsive desktop/mobile layouts
- Added dialog semantics, inert closed state, focus trapping/restoration,
  labelled inputs, 44px switch targets, reduced-motion handling, and live status
- Removed disconnected controls from the visible UI while retaining their stored
  schema for compatibility
- Corrected misleading labels for copied comment links, story-score signals, and
  favicons
- Made the HackerWeb story-link flag reconcile injected links immediately
- Fixed time grouping against current HN timestamps/list markup, table layout,
  and dark-mode cells
- Replaced the unreachable negative low-score default while preserving explicit
  legacy preferences at the new zero minimum
- Updated OP badges to enhance HackerWeb's native original-poster marker
- Scoped HackerWeb readability styles to the active comments view and added
  visible thread rails and ancestor highlighting
- Enabled HN comfort mode by default and disabled HackerWeb copy-comment links by
  default, retaining four default-enabled features
- Added focused settings and feature-lifecycle tests
- Brought README, userscript metadata, and changelog in sync with the actual
  15-feature product
- Made release dry-runs run every validation gate, reject any dirty-tree state,
  preflight branch/tag/auth/gist ownership readiness, and atomically push only
  the intended branch and tag
- Pinned CI's Bun version/frozen lockfile and removed racing hook rewrites

## Priority 1 — correctness and lifecycle

### 1. Give every feature a uniform lifecycle

Most features expose only an `init()` function. Some subscribe to config, some
depend on a broad MutationObserver rerun, and many cannot undo injected DOM,
classes, styles, or listeners when disabled.

Adopt a common contract:

```ts
interface SiteFeature {
  mount(): void;
  refresh(): void;
  unmount(): void;
}
```

A single per-site reconciler should own config subscriptions, MutationObservers,
hash/navigation listeners, and all disposers. Test each feature through
`enable → refresh → disable → re-enable` and repeated initialization.

### 2. Preserve the new-comment comparison baseline

`new-comments` records `Date.now()` every time the shared DOM observer refreshes
the feature. Async comments arriving after the first pass can therefore be
compared against a newly overwritten timestamp and missed. Capture one baseline
per story visit, accumulate the current visit's new IDs separately, and commit
the next baseline only when the page/story lifecycle ends.

### 3. Separate automatic collapse from user collapse state

Auto-collapse currently calls the normal persistent collapse path. Disabling the
feature or changing depth can leave automatically collapsed threads recorded as
manual user choices. Track automatic state separately (class/data attribute or
an in-memory set), reconcile it when the threshold changes, and persist only
explicit user actions.

### 4. Decode stored config at runtime

Config load/import currently validates top-level object shape but not nested
keys, types, ranges, or future versions. Add a strict decoder that:

- accepts only known keys at every level;
- validates booleans, finite numbers, colors, and site objects;
- clamps documented numeric ranges;
- rejects or safely downgrades unknown future versions;
- reports recoverable errors without replacing known-good stored data.

Also fix section subscriptions so callbacks receive genuinely distinct old and
new snapshots.

## Priority 2 — release and test confidence

### 5. Make publication recoverable across remotes

The publisher now fails closed, validates before mutation, gives a truthful dry
run, and atomically pushes only the current branch/release tag. GitHub and the
install gist are still separate remotes: a gist failure can follow a successful
repository push. Document and automate a retry/recovery command, and consider
attaching a checksum so the repository tag and gist artifact can be compared.

### 6. Expand tests where risk lives

The suite is green but concentrated around collapse UI and a few helpers.
Prioritize:

- Config load/import/migrations and listener semantics
- Keyboard dispatch, conflicts, and cleanup
- HN fixture tests for time grouping, score signals, hide-read, and favicons
- HackerWeb async-navigation tests for new comments and collapse depth
- Bookmark panel semantics and repeated open/close behavior
- Every feature's enable/disable lifecycle

Add coverage reporting as a diagnostic first; introduce thresholds only after
the highest-risk modules have intentional tests.

### 7. Finish build determinism

CI now pins the declared Bun version, installs from the frozen lockfile, and hooks
perform parallel checks without racing writes. Still verify userscript source-map
support (or remove the ineffective flag) and clean release output so stale
artifacts cannot survive a build.

### 8. Clarify versioning

`package.json`, userscript config, tags, and changelog currently describe
different version histories. Either use one source of truth or document the
package/tooling version separately from the distributed userscript version.

## Priority 3 — product cohesion

### 9. Consolidate floating UI

Settings, bookmarks, keyboard help, progress, and copy feedback currently own
independent floating layers and z-indexes. Move them toward one action rail and
one layered drawer with shared tokens. A natural information architecture is:

- This site
- Saved
- Appearance
- Advanced

### 10. Tighten DOM scope on HackerWeb

Several selectors begin at `section li`, while HackerWeb keeps home, comments,
and about views mounted together. Scope comment features to the active comments
view and exclude hidden/collapsed descendants from keyboard navigation.

### 11. Finish accessibility across feature UI

Convert bookmark stars, bookmark close controls, and hide-read text into real
buttons with accessible names, pressed state, focus styles, and touch targets.
Give keyboard-navigation help and bookmarks proper dialog/popover semantics and
reuse one polite live-region/toast service.

### 12. Replace whole-page dark-mode inversion

HackerWeb already has native appearance controls. Prefer driving or following
that theme instead of filtering the entire document, which can distort images,
brand colors, and injected UI. Keep semantic HWT color tokens shared across both
sites.

## Definition of done for the next milestone

- Every visible setting has a tested consumer.
- Every feature can be disabled without a reload or leftover DOM/listeners.
- Stored config is strictly decoded and migration-tested.
- HN and HackerWeb fixtures cover async navigation and repeated initialization.
- Versioning has one documented source of truth.
