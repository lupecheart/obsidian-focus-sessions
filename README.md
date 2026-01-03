# Obsidian Plugin Starter Template

A production-ready, batteries-included starter template for building high-quality [Obsidian](https://obsidian.md) plugins with TypeScript.

## Features

- **Modern Tooling**: fast builds with `esbuild`, hot reloading with `node esbuild.config.mjs`.
- **Type Safe**: Strict TypeScript configuration enabled by default.
- **Code Quality**:
    - **ESLint** with `eslint-plugin-obsidianmd` for best practices.
    - **Prettier** for consistent formatting.
    - **Husky** & **lint-staged** for automated pre-commit checks.
- **Testing**: Ready-to-go unit testing with **Vitest**.
- **Automated Releases**: Zero-config GitHub Releases and Changelog generation using **Semantic Release**.
- **Path Aliases**: Pre-configured `@/` alias for cleaner imports (mapped to `src/`).

## Quick Start

1.  **Use template**: Click "Use this template" on GitHub or clone the repository.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure**:
    - Update `manifest.json` (`id`, `name`, `description`, `author`).
    - Update `package.json` (`name`, `description`).
    - (Optional) Update `esbuild.config.mjs` if you have special build requirements.

## Development

Start the development server with hot reloading:

```bash
npm run dev
```

This will build your plugin and watch for changes.

### Available Scripts

| Script           | Description                            |
| :--------------- | :------------------------------------- |
| `npm run dev`    | Watch mode. Rebuilds on file changes.  |
| `npm run build`  | Production build. Minifies the output. |
| `npm test`       | Run unit tests with Vitest.            |
| `npm run lint`   | Run ESLint check.                      |
| `npm run format` | format code with prettier.             |

### Pre-commit Hooks

This repo uses **Husky** to run `lint-staged` on commit. This ensures that every commit:

1.  Passes ESLint checks.
2.  Is formatted with Prettier.
3.  (Optional) You can add `npm test` to `.lintstagedrc` if strict TDD is preferred.

## Releases

This template uses [Semantic Release](https://semantic-release.gitbook.io/) to automate versioning.

1.  **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/).
    - `feat: ...` → Minor release
    - `fix: ...` → Patch release
    - `docs: ...` → No release
    - `feat!: ...` → Major release
2.  **Push to Main**: When you push (or merge) to the `main` branch, the GitHub Action workflow:
    - Analyzes your commits.
    - Bumps the version in `package.json`, `manifest.json`, and `versions.json`.
    - Generates a Changelog.
    - Publishes a GitHub Release with the compiled `main.js`, `manifest.json`, and `styles.css`.

## AI Agents

This repository includes an [`AGENTS.md`](./AGENTS.md) file. This file contains deep context about the project structure, conventions, and implementation details. It is designed to be read by AI coding assistants to help them understand your codebase instantly.

## License

Copyright (C) 2026 [Luis Pernia](https://github.com/luispernia)

[GNU GPLv3](./LICENSE) (or whichever license you prefer)
