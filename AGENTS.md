# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React + TypeScript app. Entry points are `src/main.tsx` and `src/App.tsx`.
- `src/components/` contains page sections and UI components (e.g., `Hero.tsx`, `RSVP.tsx`).
- `src/lib/` contains shared utilities and integrations (e.g., `supabase.ts`).
- `public/` stores static assets served as-is.
- `supabase/migrations/` holds database migration SQL files.
- Configuration lives at the repo root (`vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `eslint.config.js`).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server.
- `npm run build`: create a production build.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the project.
- `npm run typecheck`: run TypeScript type checking without emitting files.

## Coding Style & Naming Conventions
- Use TypeScript for all source files (`.ts`, `.tsx`).
- Indentation is 2 spaces; keep lines readable and component-focused.
- Components are `PascalCase` and live in `src/components/` (e.g., `SaveTheDate.tsx`).
- Prefer `camelCase` for variables/functions and `UPPER_SNAKE_CASE` for constants.
- Styling is handled with Tailwind classes in JSX; avoid ad-hoc CSS unless needed.
- Lint with ESLint (`npm run lint`) before submitting changes.

## Testing Guidelines
- No test runner is currently configured. Use `npm run typecheck` and `npm run lint` to validate changes.
- If you add tests, document the framework and add a script in `package.json`.

## Commit & Pull Request Guidelines
- This directory is not a Git repo, so commit conventions aren’t recorded here.
- Use short, imperative commit subjects (e.g., "Add RSVP validation").
- Pull requests should describe the change, include relevant screenshots for UI updates, and call out any Supabase schema changes or required environment variables.

## Security & Configuration Tips
- Environment variables live in `.env`. Do not commit secrets or production keys.
- Supabase configuration is centralized in `src/lib/supabase.ts`; keep credentials and URLs out of source files.
