# Changelog

All notable changes to this project are documented in this file.

## [1.4.0] - 2026-06-22

### Added
- Added keyed list rendering: pass `:key="expr"` on an `x-for` element to reconcile by key instead of rebuilding. Reused items keep their DOM nodes, child component state, focus, and unmanaged input values across reorders; the item is exposed as a signal so bindings re-track when the same key receives new data. Without `:key`, `x-for` keeps its previous full re-render behavior.
- Added integration tests covering keyed reorder node identity, preserved input state, and content updates on same-key data changes.

## [1.3.1] - 2026-07-09

### Fixed
- Fixed hash-mode router to correctly parse query strings from the hash itself (e.g., `#/foo/bar?scroll=1224`). Query params are now read from the hash content rather than relying on `window.location.search`, making them work independently of real URL query strings.

### Changed
- Optimized `Router.js`: extracted duplicated path/query logic into `hashParts()` helper and consolidated href construction into `toHref()` function, reducing bundle size.

## [1.3.0] - 2026-06-18

### Added
- Added support for `x-for` and `x-if` directly on a component's root element: the component becomes a comment anchor and re-renders its content as siblings, so structural directives survive persistent router pages that wipe and reuse the outlet between navigations.
- Added the `x-html` directive to bind an expression to an element's `innerHTML`.
- Added integration tests covering root-level `x-for`/`x-if`, `x-html`, component props/emits, and router persistent pages.
- Added support for `routes` as a function in `createRouter()`, re-evaluated on every route resolution so route visibility can react to signals (e.g. auth state) without extra router API.

### Changed
- `mounted()` is now called once binding is fully complete, instead of partway through component creation; it is also re-invoked whenever a root-directive component re-renders (e.g. on router remount).

## [1.2.0] - 2026-06-13

### Added
- Added `untrack()` to read signals without subscribing the current reactive effect.
- Added object support to `x-for`, including `(value, key) in object` loops.
- Added focused regression tests for router globals, watch callback tracking, empty templates, camelCase emits, and object loops.

### Changed
- Updated `watch()` so callback reads do not become dependencies of the watched source.
- Updated `createRouter()` so `globals.$route` is owned and updated by the router even before `RouterView` mounts.
- Updated component emit listener matching so kebab-case listeners can handle camelCase declared emits.

### Fixed
- Empty templates now fail with `TinyBubble template must return one root element` instead of surfacing a low-level DOM append error.

### Docs
- Updated the TinyBubble skill guidance for router globals, untracked watch callbacks, object loops, template scope limits, writable `x-model` targets, `x-show` lifecycle behavior, and emit listener naming.

## [1.0.2] - 2026-03-07

### Added
- Added repository metadata fields for GitHub, homepage, and issue tracking in `package.json`.
- Added a VS Code TinyBubble template helper extension under `tools/vscode-tinybubble-template`.
- Added a first project changelog and extension-specific changelog for future GitHub and marketplace releases.

### Changed
- Renamed the GitHub repository references from `bubble` to `tinybubble` across package metadata, docs, examples, and Claude skill prompts.
- Switched the project license from Apache-2.0 to MIT.
- Updated `@input` and `@change` runtime handling so native event data is easier to access in advanced handlers such as file uploads.

### Docs
- Expanded AI/component authoring guidance with explicit `$event` usage notes for `@input` and `@change` handlers.
