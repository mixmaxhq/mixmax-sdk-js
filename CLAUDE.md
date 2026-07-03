# mixmax-sdk-js — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is

Mixmax's public client-side JavaScript SDK (`@mixmaxhq/sdk` on npm, also served from https://sdk.mixmax.com) for third-party developers — and Mixmax's own apps — embedding Mixmax in a web page. Three surfaces: `Mixmax.editor` (enhancement editor lifecycle), `Mixmax.widgets` (iframe embeds: sequence picker, embedded calendar), `Mixmax.sidebar` (postMessage bridge for sidebar integrations); docs at developer.mixmax.com.

## serves

role: browser SDK for embedding Mixmax — enhancement editor lifecycle, sequence-picker and embedded-calendar widgets, sidebar-integration bridge; consumers are mostly external third-party developers
referenced-by: [admin, emailapps]

## Code map

- Top-level module (re-exports submodules) -> src/Mixmax.js
- Enhancement editor lifecycle (`done`/cancel via postMessage to opener) -> src/editor.js
- Embeddable widgets (scans DOM classes + data attributes, injects iframes) -> src/widgets.js, src/widgets/
- Sidebar integration (EventEmitter over postMessage) -> src/sidebar.js
- Host postMessage bridge (origin-checked) + env/CDN URL detection -> src/utils/
- Widget CSS shipped with the bundle -> assets/widgets.css
- Manual test pages for widgets -> examples/
- Build + S3 upload pipeline -> gulpfile.js
- Release steps + compatibility targets -> CONTRIBUTING.md

## Conventions

- npm (package-lock.json); legacy toolchain — Node 8.9.3 on CI
- No test suite: `npm run ci` is `exit 0`; ESLint (eslint-config-mixmax)
- Build: gulp + Rollup (multibuild) — UMD + ES bundles per entry (Mixmax, editor, widgets, sidebar), minified for production
- CI/publish: Travis (.travis.yml) on git tags — publishes public npm package and uploads dist/ to S3 bucket `mixmax-sdk-js`, served as https://sdk.mixmax.com/v{VERSION}; manual flow documented in CONTRIBUTING.md

## Run / test

- `npm start` — build, watch, and serve locally on :64969 (load examples/ pages per CONTRIBUTING.md)
- `npm run build` — production bundles into dist/
- No automated tests

## Load the matching domain card

- Cross-cutting library — load the consuming capability's card, not a domain-* for this repo.
