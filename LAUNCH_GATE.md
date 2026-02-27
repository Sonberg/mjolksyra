# Mjolksyra Launch Gate (MVP)

This checklist is a release gate.  
**Rule:** do not onboard paying coaches until all `BLOCKER` rows are `PASS`.

## Status legend
- `PASS`: validated in staging/prod-like environment with evidence
- `PENDING`: implemented but not yet validated end-to-end
- `GAP`: missing implementation
- `N/A`: not in MVP scope

## Product & Billing Gate Matrix

| Area | Priority | Status | What to validate | Endpoint / Component / File |
|---|---|---:|---|---|
| Auth: coach login/signup | BLOCKER | PENDING | Clerk login/logout, session persistence, role nav | `mjolksyra-app/context/Auth/Auth.tsx`, `mjolksyra-app/context/Auth/getAuth.ts`, `mjolksyra-app/components/Navigation/Navigation.tsx` |
| Auth: athlete invite acceptance | BLOCKER | PENDING | Invite link -> accept -> athlete relation created | `POST /api/trainee-invitations/{id}/accept`, `mjolksyra-api/Mjolksyra.UseCases/TraineeInvitations/AcceptTraineeInvitation/AcceptTraineeInvitationCommandHandler.cs` |
| AuthZ: role separation | BLOCKER | PENDING | Coach cannot mutate unrelated athlete data | `mjolksyra-api/Mjolksyra.UseCases/Trainees/UpdateTrianeeCost/UpdateTraineeCostCommandHandler.cs`, `mjolksyra-api/Mjolksyra.UseCases/Trainees/GetTrainees/GetTraineesRequest.cs` |
| Coach Stripe onboarding | BLOCKER | PENDING | Connect account creation, status sync, dashboard link | `POST /api/stripe/account`, `POST /api/stripe/account/sync`, `GET /api/stripe/dashboard`, `mjolksyra-api/Mjolksyra.Api/Controllers/Stripe/AccountController.cs` |
| Athlete payment method setup | BLOCKER | PENDING | SetupIntent flow + redirect sync + saved payment method | `POST /api/stripe/setup-intent`, `POST /api/stripe/setup-intent/sync`, `mjolksyra-app/components/AthleteOnboardingFlow/PaymentStep.tsx` |
| Subscription creation on price update | BLOCKER | PENDING | Price save creates/updates subscription and can invoice | `PUT /api/trainees/{id}/cost`, `mjolksyra-api/Mjolksyra.UseCases/Trainees/UpdateTrianeeCost/UpdateTraineeCostCommandHandler.cs` |
| Charge now (reset cycle) | SHOULD | PENDING | Immediate charge action resets cycle | `POST /api/trainees/{id}/charge-now`, `mjolksyra-api/Mjolksyra.UseCases/Trainees/ChargeNowTrainee/ChargeNowTraineeCommandHandler.cs` |
| Billing status visibility | SHOULD | PENDING | Coach sees payment readiness, last/next charge | `mjolksyra-app/app/app/coach/TraineeCard.tsx`, `mjolksyra-api/Mjolksyra.UseCases/Trainees/TraineeResponseBuilder.cs` |
| Workout planning stability | BLOCKER | PENDING | DnD, save, reload, no data loss | `mjolksyra-app/components/WorkoutPlanner/*`, `GET/PUT/POST /api/trainees/{id}/planned-workouts` |
| Block planning/apply | SHOULD | PENDING | Block create/edit/apply to planner with correct dates | `mjolksyra-app/components/BlockBuilder/*`, `POST /api/blocks/{id}/apply` |
| Athlete workout logging | BLOCKER | PENDING | Athlete marks completed + note persists | `mjolksyra-app/components/WorkoutViewer/Workout.tsx`, `UpdatePlannedWorkoutCommandHandler.cs` |
| Coach review workflow | SHOULD | PENDING | Coach sees athlete log, adds `reviewNote`, marks reviewed | `mjolksyra-app/app/app/coach/athletes/[traineeId]/workouts/pageContent.tsx`, `Workout.tsx`, `PlannedWorkoutRequest.cs` |
| Coach/athlete notifications | SHOULD | PENDING | Notifications created and read state updates | `GET /api/notifications`, `POST /api/notifications/{id}/read`, `mjolksyra-app/components/Navigation/NavigationNotifications.tsx` |
| Workout completed notification to coach | SHOULD | PENDING | Athlete completion triggers coach notification deep link | `UpdatePlannedWorkoutCommandHandler.cs` (`type: workout.completed`) |
| Review notification to athlete | SHOULD | PENDING | Coach review/reviewNote triggers athlete notification | `UpdatePlannedWorkoutCommandHandler.cs` (`type: workout.reviewed`) |
| Transactional emails (critical set) | BLOCKER | PENDING | Invite, accept/decline, payment success/fail, price changed | `mjolksyra-api/Mjolksyra.Infrastructure/Email/BrevoEmailSender.cs` + invitation/trainee/stripe handlers |
| Feedback capture (text-only) | SHOULD | IMPLEMENTED | Auth user can submit report with page URL | `POST /api/feedback-reports`, `mjolksyra-app/components/Navigation/ReportIssueDialog.tsx` |
| API health/observability | BLOCKER | PENDING | Health checks + logs/traces visible in Azure | `infra/*`, `mjolksyra-api/Mjolksyra.Api/Program.cs`, Azure Monitor/App Insights |
| Stripe webhook reliability | BLOCKER | PENDING | Signature verified, duplicate-safe processing | `POST /api/stripe/webhook`, `mjolksyra-api/Mjolksyra.Api/Controllers/Stripe/WebhookController.cs` |
| Data backup / recovery | BLOCKER | GAP | Automated Mongo backup/restore drill documented | Infra/ops runbook (not implemented in app repo) |
| Legal docs (EU) | BLOCKER | GAP | ToS, Privacy, refund policy, GDPR basics linked from app | Landing/footer pages (missing explicit implementation) |

## Required manual smoke tests before launch

1. **Coach flow**
   - Coach signs up and completes Stripe onboarding.
   - Coach invites athlete with price.
   - Coach plans one week and applies one block.

2. **Athlete flow**
   - Athlete accepts invite and sets payment method.
   - Athlete opens workouts, completes one workout, adds completion note.
   - Athlete sees coach feedback notification and feedback text.

3. **Billing flow**
   - Coach updates price and confirms billing impact.
   - Validate Stripe subscription state and invoice behavior.
   - Simulate payment failure and recovery.

## Evidence required per PASS item

- Screenshot or screen recording of success path
- API response payload (or log excerpt)
- Stripe dashboard event IDs for billing/webhook checks
- Date/time and environment (preview/prod)
