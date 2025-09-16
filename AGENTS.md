# Repository Guidelines

## Project Structure & Module Organization
- <code>frontend/</code> hosts the Angular 20 client; feature flows live in <code>src/app/features/</code> (for example <code>match-analysis/</code>, <code>player-stats/</code>), shared guards and services stay in <code>src/app/core/</code>, and layout primitives sit under <code>src/app/layout/{components}</code>.
- <code>frontend/src/assets/</code> stores bundled static assets such as Font Awesome fonts; update the <code>angular.json</code> asset array when adding files.
- <code>docs/</code> gathers design references (<code>TECHNICAL_ARCHITECTURE.md</code>, <code>DATA_MODELS.md</code>); refresh diagrams whenever telemetry contracts shift.
- <code>test-results/</code> captures generated Karma or e2e artifacts for review; prune stale reports during PR prep.
- <code>tests/</code> is reserved for upcoming integration harnesses; keep experimental scripts isolated under nested folders.

## Build, Test, and Development Commands
- <code>npm run install:frontend</code> installs Angular dependencies inside <code>frontend/</code>.
- <code>npm run start</code> boots the dev server at <code>http://localhost:4200</code>; use <code>npm run start:local</code> for overrides defined in <code>src/environments/environment.local.ts</code>.
- <code>npm run build</code> produces development bundles in <code>frontend/dist/</code>; prefer <code>npm run build:prod</code> before tagging releases.
- <code>npm run test</code> executes Karma unit tests; CI can pin <code>npm run test -- --watch=false --browsers=ChromeHeadless</code>.
- Run linting and formatting inside <code>frontend/</code> via <code>npm run lint</code>, <code>npm run format</code>, or <code>npm run check</code>.

## Coding Style & Naming Conventions
- Biome enforces spacing (indent width 2, line width 120) and recommended lint rules; run <code>npx biome check .</code> from <code>frontend/</code> before committing.
- Name Angular elements with conventional suffixes (<code>.component.ts</code>, <code>.service.ts</code>, <code>.guard.ts</code>) and prefix selectors with <code>dinnr-</code>.
- Keep shared models and interceptors under <code>src/app/core/</code>; feature specific state should live alongside the owning feature module.

## Testing Guidelines
- Unit specs stay next to implementations as <code>.spec.ts</code>; align describe labels with class names and structure cases by Arrange, Act, Assert.
- Track coverage for telemetry parsing and insight calculations with <code>ng test --code-coverage</code>; investigate dips before merging.
- Store heavier integration fixtures under <code>tests/</code> and avoid committing generated screenshots or binaries.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (<code>feat:</code>, <code>refactor:</code>, <code>fix(scope):</code>) as seen in history; keep subjects imperative and under 70 characters.
- Each PR should summarize functional impact, link the relevant issue, and attach updated UI screenshots when visuals shift.
- Validate <code>npm run build:prod</code> and <code>npm run test</code> locally before requesting review; request at least one reviewer from the analytics platform team.
