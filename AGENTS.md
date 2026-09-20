# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 9 application written in TypeScript. Route entry points live in `pages/`; `pages/index.tsx` renders the landing page and `pages/map.tsx` hosts the visualization. Reusable UI is under `components/`, grouped into `Home`, `Visualisation`, and `common`. MobX domain and UI state belongs in `stores/`; shared React hooks and small helpers live in `hooks/` and `utils/`. Static styles, icons, type declarations, and sample input are in `styles/`, `components/common/icons/`, `types/`, and `data/demo.json` respectively.

## Build, Test, and Development Commands

- `npm install` installs the locked dependency set from `package-lock.json`.
- `npm start` starts the local Next.js development server at `http://localhost:3000`.
- `npx next build` creates a production build and catches route or bundling failures.
- `npx tsc --noEmit` runs the strict TypeScript checks configured in `tsconfig.json`.
- `npx tslint --project tsconfig.json` checks the repository's TSLint rules.
- `npx prettier --check "{pages,components,stores,hooks,utils}/**/*.{ts,tsx}"` verifies formatting.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, semicolons, and trailing commas where supported; let the checked-in Prettier and TSLint configuration settle formatting details. Name React components and store classes in `PascalCase`, functions and values in `camelCase`, and hooks with the `use` prefix. Keep route files lowercase. Prefer typed, focused modules and preserve the strict compiler settings. Place visualization-specific code near `components/Visualisation` or its corresponding store instead of expanding generic helpers.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Before submitting, run the build, type checker, and linter above. Manually exercise `/` and `/map`, including toolbar filters, view changes, map zooming, and touch behavior when relevant. If introducing tests, colocate them as `*.test.ts` or `*.test.tsx` and add a documented `npm test` script.

## Commit & Pull Request Guidelines

History favors short, imperative summaries such as `Fix typo on view buttons.` Keep each commit scoped to one change; reserve version-only messages for releases. Pull requests should explain the user-visible effect, list verification performed, link related issues, and include screenshots or recordings for layout, map, or animation changes. Call out dependency, data-format, or configuration changes explicitly.

## Configuration & Security

Treat values exposed through `next.config.js` as browser-visible. Never commit private API keys, personal movement data, or local configuration files; use sanitized fixtures under `data/`.
