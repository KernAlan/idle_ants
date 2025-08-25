# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Game code organized by domain
  - `core/Namespace.js`: Declares global namespace `IdleAnts`.
  - `Game.js`: Main game/bootstrap and loop logic.
  - `managers/`: Systems (e.g., `ResourceManager.js`, `UIManager.js`).
  - `entities/`: Ants, enemies, items (e.g., `FatAnt.js`, `BeeEnemy.js`).
  - `data/`: Static configs (`AntTypes.js`, `FoodTypes.js`, `BossConfigs.js`).
- `assets/`: Audio and other media.
- `index.html` + `styles.css`: App shell and UI styles.
- `dist/`: Build output (generated).
- Utility/test pages: `test_daily_challenges.html`, `test-gist-leaderboard.html`.

## Build, Test, and Development Commands
- `npm run dev` or `npm start`: Start Vite dev server at `http://localhost:5173/`.
- `npm run build`: Production build to `dist/` (sourcemaps enabled).
- `npm run preview`: Serve the production build locally.
- `npm run legacy:bundle`: Run `build.js` to produce a legacy bundle.
- `npm run legacy:serve`: Serve the legacy bundle via `http-server`.

Tips
- Debug mode: append `?debug=true` or run on localhost to enable `IdleAnts.Config.debug`.
- Dev server can serve the test pages directly (e.g., `/test_daily_challenges.html`).

## Coding Style & Naming Conventions
- Indentation: 4 spaces; use semicolons.
- Naming: PascalCase files for classes (`RainbowAnt.js`, `EntityManager.js`).
- Namespace: attach to `window.IdleAnts` (e.g., `IdleAnts.Managers.EntityManager`).
- Organization: new systems → `src/managers/`; new game objects → `src/entities/`; shared data → `src/data/`.

## Testing Guidelines
- No unit test framework is configured yet. Use the test HTML pages and in-game debug for manual verification.
- Recommended (if adding tests): Vitest with `tests/**/*.spec.js`; keep fast, deterministic tests.
- Manual checklist: resource rates, spawn caps, UI modals, audio preload, boss/miniboss flows.

## Commit & Pull Request Guidelines
- Commits: concise, present tense, scope-first when helpful (e.g., `UI: fix modal layout`).
- PRs: clear description, screenshots/GIFs for UI, steps to reproduce/verify, and any config or data changes.
- Keep changes focused; update docs/comments and run `npm run build` before merging.

## Security & Configuration Tips
- Audio loads from `assets/`; run locally to avoid CORS issues.
- Do not introduce `eval`/dynamic code loading; keep additions in the `IdleAnts` namespace.
