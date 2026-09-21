# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 Pages Router application using React 19, TypeScript 5, MobX 6, and React Leaflet 5. Routes live in `pages/`; reusable UI is grouped under `components/Home`, `components/Visualisation`, and `components/common`. Domain and visualization state belongs in `stores/`, shared hooks in `hooks/`, and small pure helpers in `utils/`. Playwright behavior tests live in `tests/`. Public fonts, downloads, images, and videos belong in `public/`; styles, type declarations, and sanitized demo data live in `styles/`, `types/`, and `data/demo.json`.

## Build, Test, and Development Commands

Run `nvm use` before project commands to select the version in `.nvmrc`.

- `npm ci` installs the exact locked dependency tree.
- `npm run dev` starts the application at `http://localhost:3000`.
- `npm run build` creates and validates the production build.
- `npm run typecheck` runs strict TypeScript checks.
- `npm run lint` runs the repository's TSLint rules.
- `npm run format:check` checks test and Playwright formatting.
- `npm test` runs all Playwright behavior tests. Use `PLAYWRIGHT_PORT=3100 npm test` when port 3000 is occupied.

Resolve peer-dependency conflicts by choosing compatible package versions. Do not use `--legacy-peer-deps`.

The development and build scripts intentionally use Webpack until the custom SVG and Moment configuration in `next.config.js` is migrated to Turbopack.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, semicolons, and trailing commas where supported. Follow the checked-in Prettier and TSLint configuration. Name React components and store classes in `PascalCase`, functions and values in `camelCase`, and hooks with the `use` prefix. Keep route files lowercase and visualization-specific behavior close to `components/Visualisation` or its store.

## Testing Guidelines

Write Playwright tests against public user behavior and accessible roles. Mock only system boundaries such as Mapbox requests. For feature and bug work, follow `.agents/skills/tdd/SKILL.md`: agree on the public seam, make one test fail, implement the smallest vertical slice, then repeat. Preserve coverage for landing-page navigation, visualization selection, URL restoration, time filtering, keyboard exploration, zoom reactions, and place clustering.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects such as `Add browser test baseline.` Keep commits focused. Pull requests should describe the user-visible effect, verification performed, linked issues, and include screenshots or recordings for visual changes. Call out dependency, data-format, and configuration changes explicitly.

## Configuration & Security

Values exposed through `next.config.js` are browser-visible. Never commit private API keys, personal movement data, or local configuration; use sanitized fixtures under `data/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
