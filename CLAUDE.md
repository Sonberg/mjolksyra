# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mjolksyra is a fitness coaching platform connecting coaches and athletes. It consists of two projects:

- **`mjolksyra-api/`** — ASP.NET Core 9 REST API (C#)
- **`mjolksyra-app/`** — Next.js 15 frontend (TypeScript)

Infrastructure is defined in `infra/` using Azure Bicep, deployed via Azure Developer CLI (`azd`).

---

## API (`mjolksyra-api/`)

### Commands

```bash
# Run the API
dotnet run --project mjolksyra-api/Mjolksyra.Api

# Run tests
dotnet test mjolksyra-api/

# Run a single test
dotnet test mjolksyra-api/ --filter "TraitName=TraineeTransactionCost"

# Build
dotnet build mjolksyra-api/
```

### Architecture

The API uses a **clean architecture** split into four projects:

- **`Mjolksyra.Api`** — Controllers, HTTP layer, middleware, startup. Entry point: `Program.cs`.
- **`Mjolksyra.UseCases`** — Application logic via **MediatR** (CQRS). Each use case is a folder with a command/query + handler. **FluentValidation** is used for input validation.
- **`Mjolksyra.Domain`** — Domain models, repository interfaces, JWT, password hashing. No infrastructure dependencies.
- **`Mjolksyra.Infrastructure`** — Concrete implementations: **MongoDB** via `MongoDbContext`, email via **Brevo**, caching via `HybridCache`.

Each layer registers its services via a static `Configure.cs` extension (`AddDomain`, `AddUseCases`, `AddInfrastructure`).

### Key Technologies

- **Database**: MongoDB Atlas (camelCase BSON convention, GUIDs as standard)
- **Messaging**: MassTransit (in-memory)
- **Auth**: JWT Bearer tokens
- **Payments**: Stripe
- **Observability**: OpenTelemetry → Honeycomb
- **API Docs**: Scalar UI at `/scalar` (OpenAPI)
- **Tests**: xUnit + [Verify](https://github.com/VerifyTests/Verify) (snapshot testing with `.verified.txt` files)

### Configuration (Development)

Configuration is in `Mjolksyra.Api/appsettings.Development.json`. Required sections:
- `MongoDb.ConnectionString`
- `Jwt` (Secret, Audience, Issuer)
- `Otel` (Endpoint, Headers, ServiceName)
- `Brevo.ApiKey`
- `Stripe` (ApiKey, WebhookSecret)

---

## App (`mjolksyra-app/`)

### Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run tests
npm test

# Run component playground (React Cosmos)
npm run cosmos
```

### Architecture

The frontend is a **Next.js 15 App Router** application.

**App directory structure:**
- `app/[...api]/` — API proxy routes (passes requests to the .NET API)
- `app/account/` — Auth pages (login, register, token refresh)
- `app/app/coach/` — Coach views (trainee list, workout planner per trainee)
- `app/app/athlete/[traineeId]/workouts/` — Athlete workout viewer

**Key patterns:**

- **Services** (`services/`) — Server-side functions that call the .NET API using `axios` (`ApiClient` from `services/client.ts`). Each service validates responses with **Zod** schemas (`schema.ts` + `type.ts` in each folder).
- **State management** — **TanStack Query** for server state, **Zustand** for complex local state (e.g., `WorkoutPlannerDemo/stores/`).
- **Auth** — JWT tokens stored in HTTP-only cookies (`accessToken`, `refreshToken`). Middleware (`middleware.ts`) handles silent refresh. `AuthProvider` context exposes the decoded user.
- **Drag and drop** — `@dnd-kit/core` + `@dnd-kit/sortable` used in the workout planner.
- **Component library** — shadcn/ui components live in `components/ui/`. Custom complex components (WorkoutPlanner, ExerciseLibrary, WorkoutSidebar, etc.) live in `components/`.
- **React Cosmos** — Component fixtures (`*.fixture.tsx`) are used for isolated component development. Fixtures exist for `Coach` and `Athlete` views.

**Environment variables** (`.env.local`):
- `API_URL` — URL of the .NET API (e.g., `http://localhost:5107`)
- `JWT_SECRET` — Must match the API's `Jwt.Secret`
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` — Analytics
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe

### Key Technologies

- **Routing**: Next.js App Router
- **Data fetching**: TanStack Query v5
- **Styling**: Tailwind CSS + shadcn/ui (config: `components.json`)
- **Validation**: Zod
- **Dates**: date-fns + dayjs
- **Tests**: Jest + ts-jest (no test files currently beyond node_modules)
