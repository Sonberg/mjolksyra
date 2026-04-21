# Mjolksyra

**Mjolksyra** is a fitness coaching SaaS platform built for serious coaches who need precise, professional tools — not consumer wellness aesthetics. The name references lactic acid (mjölksyra in Swedish), the point where effort becomes real, reflecting the platform's philosophy of being tool-first and uncompromising.

---

## What It Does

Mjolksyra connects coaches and athletes through a shared digital workspace. Coaches plan and manage workout programs for their athletes on a drag-and-drop calendar, track performance, provide feedback, and bill for services — all from one place. Athletes view assigned workouts, log completions, upload exercise media, and communicate with their coaches in context.

### Core Workflows

**For coaches:**
- Build reusable workout templates (Blocks) with exercises, sets, reps, and prescriptions
- Apply blocks to an athlete's calendar for any date range
- Use AI to generate personalised workout plans or full block programmes
- Review athlete workout completions and provide feedback via in-workout chat
- Manage an athlete roster with invitations, subscription billing, and payment tracking
- Purchase credit packs to unlock AI features (media analysis, plan generation)

**For athletes:**
- View workouts assigned by their coach on a weekly/monthly calendar
- Log completed workouts with actual sets, reps, and load
- Upload video or images of exercises for AI-powered form analysis
- Chat with their coach directly inside each workout
- Manage payment method and view transaction history

---

## Tech Stack

### Frontend

| Technology | Role |
|------------|------|
| Next.js 16 (React 19, TypeScript) | Application framework (App Router) |
| Tailwind CSS 3.4 + shadcn/ui | Styling and base UI components |
| Radix UI | Accessible primitives (dialogs, dropdowns, popovers, etc.) |
| TanStack Query 5 | Server state management and caching |
| Zustand | Client-side state |
| dnd-kit | Drag-and-drop for the workout planner |
| Zod | Schema validation |
| Clerk | Authentication (sign-in, sign-up, JWT) |
| Stripe.js | Payment method setup and credit purchases |
| @microsoft/signalr | Real-time notifications |
| AWS S3 SDK | Presigned URL uploads to Cloudflare R2 |
| PostHog | Product analytics |
| Playwright | End-to-end tests |
| Storybook | Component documentation and visual testing |

### Backend

| Technology | Role |
|------------|------|
| .NET 9 / ASP.NET Core 9 | API server |
| .NET Aspire | Local development orchestration |
| MongoDB | Primary database |
| Redis | Caching and rate limiting |
| MassTransit | Distributed messaging and background jobs |
| Google Gemini 2.5 Pro | AI agents (planning, analysis, insights) |
| Stripe | Coach Connect accounts, athlete subscriptions, invoices, webhooks |
| Clerk | Auth webhooks, identity sync |
| Brevo | Transactional email |
| Cloudflare R2 | Object storage (workout media) |
| OpenTelemetry | Distributed tracing and metrics |
| Azure Application Insights | Production observability |
| xUnit + Verify | Unit and snapshot testing |

### Infrastructure

| Technology | Role |
|------------|------|
| Azure Container Apps | Production hosting |
| Azure Bicep + Azure Developer CLI | Infrastructure as code |
| Azure Key Vault | Secrets management |
| GitHub Actions | CI/CD (preview on PR, production on main) |
| Railway | Alternative deployment target |

---

## Architecture

The project is split into two top-level applications.

### Backend (`mjolksyra-api/`)

Clean Architecture with four layers:

- **`Mjolksyra.Domain`** — Domain models (MongoDB documents), enums, AI interfaces, messaging events
- **`Mjolksyra.UseCases`** — CQRS-style command and query handlers (one file per operation)
- **`Mjolksyra.Infrastructure`** — External integrations: Gemini AI agents, MongoDB repositories, Stripe adapters, Brevo email, Cloudflare R2, MassTransit consumers, SignalR publishers
- **`Mjolksyra.Api`** — ASP.NET Core controllers, middleware, DI wiring, Aspire host

### Frontend (`mjolksyra-app/`)

Next.js App Router with three protected workspaces under `/app/app/`:

- **`/coach/`** — Dashboard, athlete roster, workout planner, block builder, billing, credits
- **`/athlete/`** — Dashboard, workout calendar, logging, insights, transactions
- **`/admin/`** — User management, discount codes, feedback review, media integrity

Shared layers:
- **`/components/`** — 40+ reusable React components
- **`/context/`** — Auth (Clerk), real-time events (SignalR), theme, analytics (PostHog)
- **`/hooks/`** — Custom data-fetching and UI hooks
- **`/lib/`** — Utility functions, API clients, formatters

---

## Domain Model

The platform is modelled around a coach-athlete relationship called a **Trainee** (the link, not the person).

| Entity | Description |
|--------|-------------|
| **Coach** | Creates plans, manages athletes, bills for services |
| **Athlete** | Follows plans, logs workouts, pays subscription |
| **Trainee** | The coach-athlete relationship record |
| **Block** | Reusable workout template with ordered exercises |
| **Planned Workout** | Single session scheduled on a specific date |
| **Exercise** | Named movement (platform-wide or coach-specific) |
| **Completed Workout** | Athlete's logged record of a workout |
| **Completed Exercise** | Actual sets/reps/load for one exercise |
| **Chat Message** | In-workout coach-athlete message thread |
| **Media Analysis** | AI feedback on an uploaded video or image |
| **Planner Session** | Stateful AI conversation for generating workout plans |
| **Credit** | Unit of AI-feature capacity |
| **Credit Ledger** | Append-only log of all credit changes |
| **Trainee Transaction** | Payment attempt record |

---

## AI Features

All AI features are powered by Google Gemini 2.5 Pro using structured tool-calling.

| Feature | Agent | Credit Cost |
|---------|-------|-------------|
| Generate personalised workout plan for an athlete | `GeminiTraineePlannerAgent` | Yes |
| Generate a reusable block programme | `GeminiBlockPlannerAgent` | Yes |
| Analyse uploaded exercise video/image for form feedback | `GeminiWorkoutMediaAnalysisAgent` | Yes |
| Summarise athlete performance insights | `GeminiTraineeInsightsAgent` | Yes |
| Generate coaching insights | `GeminiCoachInsightsAgent` | Yes |

AI usage is metered via a **credit system**: coaches purchase credit packs, and each AI action deducts credits from a ledger. Discount codes can reduce credit pack prices.

---

## Real-time & Async

- **SignalR** (`/api/events/hub`) delivers notifications and live updates to connected clients
- **MassTransit** handles background jobs: email delivery, notification broadcasting, insights rebuilds, media compression, subscription sync, trainee cancellation flows
- **Presigned URLs** allow browsers to upload media directly to Cloudflare R2 without proxying through the API

---

## Billing

Stripe powers all money movement on the platform:

- **Coach onboarding** — Stripe Connect (Express) so coaches can receive payouts
- **Athlete subscriptions** — Recurring monthly charge via saved payment method (SetupIntent)
- **Coach platform subscription** — Coaches pay a SaaS tier fee
- **Credit packs** — One-time purchases for AI credits
- **Webhooks** — All Stripe events are processed idempotently via `ProcessedStripeEvent` deduplication

---

## Project Structure

```
mjolksyra/
├── mjolksyra-api/
│   ├── Mjolksyra.Api/           # Controllers, middleware, Program.cs
│   ├── Mjolksyra.Domain/        # Models, enums, interfaces
│   ├── Mjolksyra.UseCases/      # Command/query handlers
│   ├── Mjolksyra.Infrastructure/ # Integrations (AI, DB, Stripe, email, storage)
│   ├── Mjolksyra.AppHost/       # .NET Aspire orchestration
│   └── Tests/                   # xUnit + Verify
│
├── mjolksyra-app/
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # React components
│   ├── context/                 # Auth, real-time, theme, analytics
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilities and API clients
│   ├── e2e/                     # Playwright tests
│   └── .storybook/              # Storybook config
│
├── infra/                       # Azure Bicep IaC
├── UBIQUITOUS_LANGUAGE.md       # Domain terminology reference
├── LAUNCH_GATE.md               # MVP checklist and validation gates
└── .impeccable.md               # Design system and brand guidelines
```

---

## Design Philosophy

Mjolksyra follows a flat, whitespace-driven visual language using shadcn/ui components. The design system is documented in `.impeccable.md` and enforced through a shared Storybook. The WorkoutPlanner (coach view) and WorkoutViewer (athlete view) are designed to stay in visual lockstep — any UX or design change to one requires a matching update to the other.
