# Obsidian Plugin Starter Template

## Project Overview

This is a robust starter template for developing Obsidian plugins with modern tooling and best practices. It comes pre-configured with automation for releases, code quality, and testing.

**Key Features:**

- **Hot Reloading:** Fast development cycle with `npm run dev`.
- **Automated Releases:** Fully automated versioning and GitHub Releases using [semantic-release](https://github.com/semantic-release/semantic-release).
- **Type Safety:** Strict TypeScript configuration.
- **Quality Control:** Pre-configured ESLint (with Obsidian-specific rules) and Prettier.
- **Git Hooks:** Husky and lint-staged ensure code quality on every commit.
- **Testing:** Unit testing setup with Vitest.
- **Bundling:** Efficient bundling with esbuild.

## Environment & Tooling

- **Node.js:** v20.x or v22.x (Recommended, matching CI environment).
- **Package Manager:** npm
- **Bundler:** esbuild (configured in `esbuild.config.mjs`)
- **Testing:** Vitest
- **Linting:** ESLint + Prettier

### Scripts

| Command           | Description                                                  |
| :---------------- | :----------------------------------------------------------- |
| `npm run dev`     | Starts development server with hot reloading.                |
| `npm run build`   | Builds the plugin for production (minified).                 |
| `npm test`        | Runs unit tests with Vitest.                                 |
| `npm run lint`    | Checks for code quality issues using ESLint.                 |
| `npm run version` | (Internal) Used by semantic-release to update version files. |
| `npm run prepare` | Sets up Husky git hooks.                                     |

## Project Structure

```
.
├── .github/workflows/    # CI/CD pipelines
│   ├── lint.yml          # Runs lint and build on PRs/pushes
│   └── release.yml       # Automates releases on push to main
├── src/
│   ├── commands/         # Command implementations
│   ├── ui/               # UI components (Views, Modals)
│   ├── utils/            # Helper functions and utilities
│   ├── main.ts           # Plugin entry point & lifecycle
│   ├── settings.ts       # Settings tab and interface
│   └── types.ts          # Type definitions
├── esbuild.config.mjs    # Build configuration
├── version-bump.mjs      # Script to bump versions in manifest.json/versions.json
└── vitest.config.ts      # Test configuration
```

## Release Workflow

This project uses **Semantic Release** to automate versioning and publishing.

1.  **Commit Format:** You **MUST** use [Conventional Commits](https://www.conventionalcommits.org/).
    - `feat: ...` -> Minor version bump (e.g., 1.1.0)
    - `fix: ...` -> Patch version bump (e.g., 1.0.1)
    - `perf: ...` -> Patch version bump
    - `docs: ...`, `chore: ...` -> No release (usually)
    - `feat!: ...` or `BREAKING CHANGE:` -> Major version bump (e.g., 2.0.0)

2.  **Automation Process:**
    - Pushing to the `main` branch triggers the `.github/workflows/release.yml` workflow.
    - The workflow analyzes new commits since the last release.
    - It calculates the new version number.
    - It updates `manifest.json`, `versions.json`, and `package.json`.
    - It generates a `CHANGELOG.md` with release notes.
    - It creates a GitHub Release and attaches `main.js`, `manifest.json`, and `styles.css`.

> [!IMPORTANT]
> Ensure your GitHub repository has the necessary permissions (Workflow Read & Write) for the action to push changes back to the repo if configured to do so, or simply to create releases.

## Quality Assurance

### Linting & Formatting

- **ESLint** is configured with `eslint-plugin-obsidianmd` to enforce Obsidian best practices.
- **Prettier** handles code formatting.
- **Husky & lint-staged**: When you commit, these tools automatically run linting and formatting on changed files. If linting fails, the commit is blocked.

### Testing

- **Vitest** is used for unit testing.
- Place tests in `__tests__` directories or alongside source files with `.test.ts` extension.
- Run `npm test` to execute the suite.

## Coding Conventions

- **Strict TypeScript**: The project is set to `"strict": true`. Avoid `any`.
- **Modularity**:
    - **UI Separation**: Keep `src/ui/` strictly for views, modals, and display logic.
    - **Business Logic**: Use `src/services/` for state management and core business logic.
    - **Utilities**: specific pure functions and helpers go in `src/utils/`.
    - **Commands**: Command implementations in `src/commands/`.
    - Keep `main.ts` minimal (lifecycle only).
- **Async/Await**: Prefer `async/await` over promise chains.
- Imports: Use relative imports suitable for the bundled environment.

### CSS Architecture

- **Modular Styles**:
    - **Source**: All CSS source files reside in `src/styles/`.
    - **Build**: `esbuild` bundles these into the final `styles.css`. **Do not edit `styles.css` directly.**
- **Structure**:
    - `variables.css`: Global CSS variables (colors, spacing) mapped from Obsidian themes.
    - `main.css`: The entry point that imports all other CSS files.
    - Component-specific files (e.g., `focus-session-view.css`) for isolated styles.
- **Conventions**:
    - Use kebab-case for file names (e.g., `my-view.css`).
    - Scope styles with specific class names to avoid global conflicts (e.g., `.my-view-container .element`).

## Manifest Rules (`manifest.json`)

- `id`: Unique identifier for your plugin. match folder name during dev.
- `version`: Managed automatically by semantic-release. **Do not manually edit** unless you are bypassing the automation.
- `minAppVersion`: Minimum Obsidian version required.

## Common Development Tasks

### Adding a New Command

1. Create a new file in `src/commands/`.
2. Export a registration function or the command object.
3. Import and register it in `src/main.ts` inside `onload`.

### Adding a New View

1. Create a view class in `src/ui/`.
2. Define a constant for the View Type.
3. Register the view in `src/main.ts` using `this.registerView`.
4. Add a ribbon icon or command to open the view.

## Troubleshooting

- **Lint errors on commit**: Fix the errors reported by ESLint. The commit hook prevents bad code from being saved.
- **Release not triggering**: Check your commit messages. If you didn't use `feat:` or `fix:`, a release might not be generated.
- **"Plugin not found"**: Ensure `main.js` and `manifest.json` are in the correct folder: `<Vault>/.obsidian/plugins/<plugin-id>/`.

## References

- [Obsidian API Documentation](https://docs.obsidian.md)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Semantic Release](https://semantic-release.gitbook.io/semantic-release/)
