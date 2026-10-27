# Spending Manager

Arus (working name) records income and spending on its own from forwarded bank and e-wallet
emails, iPhone SMS shortcuts, statement imports, and manual entries.

## Stack

- **Web:** Next.js 15 (App Router) on Vercel
- **Backend:** Supabase: Postgres with row-level security, Auth with TOTP two-factor, Edge Functions
- **Shared code:** TypeScript packages that run in both Next.js and Deno

## Repository layout

```
apps/web/            Next.js app
  design/            Design tokens exported from the Arus design system
  scripts/           Build helpers (tokens.json → CSS variables)
  src/app/           Routes only: layouts, pages, route handlers
  src/features/      Feature modules: components, server actions, queries
  src/lib/           Cross-cutting infrastructure: env, Supabase clients, auth
  src/components/    Shared UI primitives
packages/core/       Domain types, money formatting, transaction fingerprints
packages/parsers/    Provider message parsers (placeholders until samples arrive)
supabase/            Migrations and local configuration
docs/                Architecture and decisions
```

Dependencies point inward: `app` → `features` → `lib` → `packages`. Packages never import from
the app.

## Getting started

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # fill in your Supabase project values
npm run dev
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the web app on port 3000   |
| `npm run build`     | Production build                 |
| `npm run lint`      | ESLint                           |
| `npm run typecheck` | TypeScript across all workspaces |
| `npm test`          | Unit tests (Vitest)              |
| `npm run format`    | Prettier                         |

## Supabase setup

1. Apply migrations: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
2. In the dashboard, enable **Authentication › Hooks › Custom Access Token** and point it to
   `public.custom_access_token_hook`.
3. Enable **TOTP** under Authentication › Multi-Factor.
4. Add `<site-url>/auth/callback` to the redirect URLs.
5. Promote the first super admin from the SQL editor:
   `update public.profiles set role = 'super_admin' where id = '<user-uuid>';`
   The admin panel at `/admin` requires a verified second factor.

## Branches

`develop` collects finished phases; `main` is production and receives reviewed merges only.
