# Vita-Win Workspace

## Overview

pnpm workspace monorepo using TypeScript. This workspace hosts Vita-Win — a focused daily medication/vitamin logging web app that eliminates "recall doubt" with a timestamped binary log (Taken/Skipped).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Routing**: Wouter
- **State/data fetching**: TanStack React Query

## Artifacts

- **vita-win** (`artifacts/vita-win/`) — React + Vite frontend, served at `/`
- **api-server** (`artifacts/api-server/`) — Express 5 API, served at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Endpoints

- `GET  /api/healthz` — health check
- `GET  /api/logs/today` — today's log (null if not logged)
- `POST /api/logs/today` — log today's status (taken/skipped), replaces existing
- `GET  /api/logs/history` — paginated log history (descending by date)
- `GET  /api/logs/summary` — adherence stats (streaks, 30-day rate)

## Database Schema

- `medication_logs` — id (serial), date (unique date), status (taken|skipped), logged_at (timestamptz), created_at (timestamptz)

## Codegen Note

The `lib/api-zod/src/index.ts` barrel is patched after each orval run to avoid a naming conflict between Zod schemas and TypeScript interfaces. The codegen command in `lib/api-spec/package.json` handles this automatically.

## Frontend Pages

- `/` — Today's log status + Taken/Skipped action buttons
- `/history` — Scrollable log history with dates and timestamps
- `/stats` — Adherence stats: streak, 30-day rate, taken count

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
