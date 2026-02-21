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
