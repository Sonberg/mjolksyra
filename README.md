# Mjolksyra

A fitness coaching platform connecting coaches and athletes. Coaches can plan workouts for their trainees using a drag-and-drop calendar planner; athletes can view and track their upcoming sessions.

## Projects

| Directory | Description |
|---|---|
| `mjolksyra-api/` | ASP.NET Core 9 REST API (C#) |
| `mjolksyra-app/` | Next.js 15 frontend (TypeScript) |
| `infra/` | Azure Bicep infrastructure |

## Prerequisites

- .NET 9 SDK
- Node.js 22 / npm 10
- MongoDB Atlas connection (or local MongoDB)

## Getting Started

### API

```bash
cd mjolksyra-api
dotnet run --project Mjolksyra.Api
```

The API runs on `http://localhost:5107` by default. Configuration is in `Mjolksyra.Api/appsettings.Development.json`. Required settings:

- `MongoDb.ConnectionString`
- `Jwt.Secret`
- `Stripe.ApiKey` / `Stripe.WebhookSecret`
- `Brevo.ApiKey` (email)
- `Otel` (OpenTelemetry → Honeycomb)

API docs are available at `http://localhost:5107/scalar`.

### App

```bash
cd mjolksyra-app
npm install
npm run dev
```

The app runs on `http://localhost:3000`. Create `.env.local`:

```
API_URL=http://localhost:5107
JWT_SECRET=<same value as Jwt.Secret in API config>
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

## Development

### Running tests

```bash
# API (xUnit + Verify snapshot tests)
dotnet test mjolksyra-api/

# Frontend
cd mjolksyra-app && npm test
```

### Component playground (React Cosmos)

```bash
cd mjolksyra-app && npm run cosmos
```

Fixtures are served via the Next.js dev server at `http://localhost:3000/cosmos/<fixture>`.

## Deployment

The project is deployed to Azure Container Apps via Azure Developer CLI:

```bash
azd up       # provision infrastructure + deploy
azd provision # infrastructure only
azd deploy   # code only
```

## Railway Deployment

Both services are configured for Railway with service-local manifests:

- `/Users/personberg/Code/Mjolksyra/mjolksyra-app/railway.toml`
- `/Users/personberg/Code/Mjolksyra/mjolksyra-api/railway.toml`

Create two Railway services from the same repo:

1. `mjolksyra-api` service
   1. Root directory: `mjolksyra-api`
   2. Uses Nixpacks and starts API on `$PORT`
   3. Health check: `/health`
2. `mjolksyra-app` service
   1. Root directory: `mjolksyra-app`
   2. Uses Nixpacks (`npm ci && npm run build`)
   3. Health check: `/`

### Required Railway Environment Variables

`mjolksyra-api`:

- `MongoDb__ConnectionString`
- `Clerk__Domain`
- `Clerk__SecretKey`
- `Stripe__ApiKey`
- `Stripe__WebhookSecret`
- `Brevo__ApiKey`
- `Cors__AllowedOrigins__0=https://<your-app-domain>`
- `ASPNETCORE_ENVIRONMENT=Production`

`mjolksyra-app`:

- `API_URL=https://<your-api-domain>`
- `NEXT_PUBLIC_API_URL=https://<your-api-domain>` (for direct SignalR websocket mode)
- `JWT_SECRET=<same as API Jwt.Secret if used>`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Realtime Notes

- SignalR hub path: `/api/events/hub`
- Next.js rewrites forward hub traffic before app routes to avoid conflicts with `app/[...api]/route.ts`.

### GitHub Actions for Railway

Workflow file:

- `/Users/personberg/Code/Mjolksyra/.github/workflows/railway-deploy.yml`

Behavior:

- Pull requests to `main` deploy to Railway preview environment.
- Pushes to `main` deploy to Railway production environment.
- Production deploy is attached to GitHub Environment `railway-production` (set required reviewers for approval).

Required GitHub credentials:

- Repository Secret:
  - `RAILWAY_TOKEN` (required if using CLI deploy in Actions)
- Repository Variables:
  - `RAILWAY_API_SERVICE_ID`
  - `RAILWAY_APP_SERVICE_ID`

This repo is configured with:

- Railway project id: `4b7ad760-d366-4892-a296-126a9fb31eaa`
- Preview environment name: `preview`
- Production environment name: `production`

### Mongo Dependency in Railway

1. In Railway, add a MongoDB service in the same project.
2. In API service variables, set:
   - `MongoDb__ConnectionString=${{Mongo.DATABASE_URL}}`
3. If your Mongo service exposes a different variable name, use that one (for example `MONGO_URL`) but keep it mapped to `MongoDb__ConnectionString`.

This keeps Mongo as a Railway service dependency and injects the connection string into the API automatically.
