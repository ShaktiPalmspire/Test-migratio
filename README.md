
```markdown
# Migratio – Project Structure

This repository is organized as a two-package workspace:

- **migratio-ui-Shakti/** → Next.js (App Router) + Redux Toolkit + RTK Query
- **Migratio-Backend-Shakti/** → Node.js (Express, TypeScript) with layered architecture

> **Team rules (for this project):**  
> 1) Don’t start work if a required file is missing  
> 2) Deliver code so you can copy–paste directly into the real file  
> 3) Minimize API calls  
> 4) Use Redux  
> 5) Keep console logs to a minimum  
> 6) Work to reduce errors as much as possible  
> 7) UI should look good

---

## Monorepo Layout

```

.

├─ migratio-ui-Shakti/

├─ Migratio-Backend-Shakti/

├─ .editorconfig

├─ .gitignore

└─ README.md

```

---

## Frontend (migratio-ui-Shakti)

**Tech:** Next.js (App Router), TypeScript, Redux Toolkit, RTK Query, modern UI components, strict linting & formatting.

```

migratio-ui-Shakti/

├─ .env.example

├─ .gitignore

├─ next.config.js

├─ package.json

├─ postcss.config.js

├─ tailwind.config.js                # If using Tailwind (recommended for clean UI)

├─ tsconfig.json

├─ public/

│  ├─ favicon.ico

│  ├─ icons/

│  └─ images/

├─ src/

│  ├─ app/                           # Next.js App Router

│  │  ├─ layout.tsx

│  │  ├─ globals.css

│  │  ├─ page.tsx                    # Home

│  │  ├─ (routes)/                   # Grouped routes

│  │  │  ├─ dashboard/

│  │  │  │  ├─ page.tsx

│  │  │  │  └─ loading.tsx

│  │  │  ├─ settings/

│  │  │  │  ├─ page.tsx

│  │  │  │  └─ loading.tsx

│  │  │  └─ auth/

│  │  │     ├─ login/page.tsx

│  │  │     └─ logout/route.ts       # API route if needed

│  │  └─ api/                        # Next server routes (edge/server)

│  │     └─ health/route.ts

│  ├─ components/

│  │  ├─ common/                     # Buttons, Inputs, Modals, Skeletons

│  │  ├─ layout/                     # Header, Footer, Nav

│  │  └─ feedback/                   # Toasts, Alerts, ErrorBoundaries

│  ├─ features/                      # Redux “slices” organized by domain

│  │  ├─ auth/

│  │  │  ├─ authSlice.ts

│  │  │  └─ selectors.ts

│  │  ├─ users/

│  │  │  ├─ usersSlice.ts

│  │  │  └─ selectors.ts

│  │  └─ migrations/

│  │     ├─ migrationsSlice.ts

│  │     └─ selectors.ts

│  ├─ services/                      # RTK Query APIs (minimize calls, caching)

│  │  ├─ baseApi.ts                  # createApi base with retry/caching

│  │  ├─ authApi.ts

│  │  ├─ usersApi.ts

│  │  └─ migrationsApi.ts

│  ├─ store/

│  │  ├─ store.ts                    # configureStore with slices + api.middleware

│  │  └─ hooks.ts                    # typed useAppDispatch/useAppSelector

│  ├─ utils/

│  │  ├─ guards.ts                   # null/undefined guards, safe parsing

│  │  ├─ logger.ts                   # env-aware minimal logger

│  │  └─ validators.ts               # zod/yup schemas if used

│  ├─ styles/

│  │  └─ tokens.css                  # CSS vars (spacing, colors, radius, shadows)

│  └─ types/

│     ├─ api.d.ts

│     └─ index.d.ts

└─ eslint.config.mjs                 # Strict rules for error reduction

```

**Notes**
- **Redux/RTK Query first:** API definitions in `src/services/*Api.ts` with aggressive caching & tag-based invalidation to cut down calls.
- **Low logs:** `utils/logger.ts` only logs in dev; no noisy `console.log` in production.
- **Error reduction:** Input validators + error boundaries in `components/feedback/`.
- **Good UI:** Shared tokens, consistent spacing, ready for Tailwind or CSS Modules.

---

## Backend (Migratio-Backend-Shakti)

**Tech:** Node.js (Express), TypeScript, layered architecture (routes → controllers → services → repositories), robust configs & middlewares.

```

Migratio-Backend-Shakti/

├─ .env.example

├─ .gitignore

├─ nodemon.json

├─ package.json

├─ tsconfig.json

├─ src/

│  ├─ index.ts                       # App bootstrap (reads env, starts server)

│  ├─ app.ts                         # Express app creation & wiring

│  ├─ config/

│  │  ├─ env.ts                      # Safe env loading (with defaults/guards)

│  │  └─ logger.ts                   # Minimal, env-aware logger

│  ├─ routes/

│  │  ├─ index.ts

│  │  ├─ auth.routes.ts

│  │  ├─ users.routes.ts

│  │  └─ migrations.routes.ts

│  ├─ controllers/

│  │  ├─ auth.controller.ts

│  │  ├─ users.controller.ts

│  │  └─ migrations.controller.ts

│  ├─ services/

│  │  ├─ auth.service.ts

│  │  ├─ users.service.ts

│  │  └─ migrations.service.ts

│  ├─ repositories/

│  │  ├─ users.repo.ts               # DB access isolated (swap impls easily)

│  │  └─ migrations.repo.ts

│  ├─ models/                        # DB models or schemas (Prisma/Mongoose/Knex)

│  │  └─ index.ts

│  ├─ middlewares/

│  │  ├─ errorHandler.ts             # Centralized error → JSON shape

│  │  ├─ notFound.ts

│  │  ├─ authenticate.ts             # JWT/session, minimal surface

│  │  └─ rateLimit.ts                # Optional: express-rate-limit

│  ├─ utils/

│  │  ├─ http.ts                     # Typed responses, pagination helpers

│  │  └─ guards.ts                   # Type guards, safe parsing

│  ├─ validators/

│  │  ├─ auth.validators.ts          # zod/yup schemas

│  │  └─ users.validators.ts

│  └─ types/

│     └─ global.d.ts

└─ eslint.config.mjs

```

**Notes**
- **Defensive defaults:** `config/env.ts` ensures missing envs don’t crash; uses safe fallbacks and clear errors.
- **Error handling:** Single `errorHandler` middleware guarantees consistent API error shape.
- **Swap-ready data layer:** `repositories/*` isolates persistence—easy to mock in tests and minimize coupling.
- **Minimal logs:** Central logger respects `NODE_ENV`.

---

## .env Examples

Put **secrets only** in `.env` (never commit). Provide safe defaults in code where reasonable.

```

# migratio-ui-Shakti/.env.example

NEXT_PUBLIC_API_BASE_URL=[http://localhost:4000](http://localhost:4000/)

NEXT_PUBLIC_APP_NAME=Migratio

```

```

# Migratio-Backend-Shakti/.env.example

PORT=4000

NODE_ENV=development

JWT_SECRET=replace_me

DB_URL=postgres://user:pass@localhost:5432/migratio

RATE_LIMIT_WINDOW_MS=60000

RATE_LIMIT_MAX=100

```

---

## Conventions

- **Redux slices** live in `src/features/*`.
- **API calls** go through RTK Query in `src/services/*Api.ts` (caching minimizes calls).
- **Env-aware logging** only in dev; production is quiet unless errors.
- **Guards & validators** before side effects to reduce runtime errors.
- **UI tokens** (`styles/tokens.css`) for consistent spacing/shadows/radius.

---

## Quick Start

```bash
# Frontend
cd migratio-ui-Shakti
pnpm i
pnpm dev

# Backend
cd ../Migratio-Backend-Shakti
pnpm i
pnpm dev
```

---

## Health Endpoints

* UI: `GET /api/health` → `{ ok: true }`
* Backend: `GET /health` → `{ ok: true, uptime, env }`

(Keep responses tiny; useful for monitors and quick checks.)

```

If you want, I can also **pre-fill minimal boilerplate files** (e.g., `store.ts`, `baseApi.ts`, `app.ts`, `errorHandler.ts`) in copy-paste format with exact paths.
::contentReference[oaicite:0]{index=0}
```
