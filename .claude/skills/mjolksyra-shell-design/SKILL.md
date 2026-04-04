---
name: mjolksyra-shell-design
description: Apply the Mjolksyra shell design system to pages and components. Use this skill when the user asks to build, update, or redesign a page or section to match the app's flat, whitespace-driven visual language.
---

Apply the Mjolksyra shell design system to the target page or component.

The user will provide a page, component, or section to build or update. Produce working React/TSX code that strictly follows the patterns below.

---

## Design Philosophy

**No rounded corners. No shadows. No heavy borders.**
Use whitespace, typography hierarchy, and flat filled surfaces to create visual structure. Every border you add must earn its place — prefer `divide-y` on lists and a single `border-b` on section headers over wrapping everything in bordered cards.

---

## CSS Design Tokens

All tokens are CSS variables defined in the shell theme:

| Token | Use |
|---|---|
| `var(--shell-surface)` | Page / default background |
| `var(--shell-surface-strong)` | Flat card background (no border needed) |
| `var(--shell-border)` | Dividers, list separators, input borders |
| `var(--shell-ink)` | Primary text |
| `var(--shell-muted)` | Secondary text, eyebrows, labels |
| `var(--shell-accent)` | Accent color (e.g. left-border callouts, active state) |
| `var(--shell-accent-ink)` | Text on accent backgrounds |

---

## Core Patterns

### Metric / stat card
```tsx
<div className="bg-[var(--shell-surface-strong)] p-4">
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Label</p>
  <p className="mt-2 text-2xl font-semibold text-[var(--shell-ink)]">Value</p>
  <p className="mt-1 text-xs text-[var(--shell-muted)]">Supporting text</p>
</div>
```
Grid layout for multiple cards:
```tsx
<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
  {/* cards */}
</div>
```

### Flat row card (with action)
```tsx
<div className="flex items-center justify-between bg-[var(--shell-surface-strong)] p-4">
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Label</p>
    <p className="mt-1 text-sm text-[var(--shell-ink)]">Content</p>
  </div>
  <button className="shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]">
    Action
  </button>
</div>
```

### List with dividers (history, transactions, athletes)
```tsx
<ul className="mt-2 divide-y divide-[var(--shell-border)]">
  {items.map((item) => (
    <li key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3">
      <div className="flex items-center gap-6">
        <p className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)]">
          {item.label}
        </p>
        <p className="text-xs text-[var(--shell-muted)]">{item.secondary}</p>
      </div>
      <div className="flex items-center gap-6 text-right">
        <p className="w-20 text-sm font-semibold text-[var(--shell-ink)]">{item.value}</p>
        <div className="w-24">{/* optional link/action */}</div>
      </div>
    </li>
  ))}
</ul>
```
Use fixed-width columns (`w-24`, `w-20`) for alignment. Never use `justify-between` alone for rows with multiple data points.

### Accent callout (coach note, warning, highlight)
```tsx
<div className="border-l-2 border-[var(--shell-accent)] pl-3">
  <p className="text-sm text-[var(--shell-ink)]">Content</p>
</div>
```

### Section with plain eyebrow header (no card wrapper)
```tsx
<div>
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Section label</p>
  {/* content below, no wrapper card */}
</div>
```

### Page-level section header
Use `PageSectionHeader` from `@/components/Navigation/PageSectionHeader`:
```tsx
<PageSectionHeader
  eyebrow="Section"
  title="Page Title"
  description="One-line description."
  titleClassName="text-2xl md:text-3xl"  // optional override
  leading={<BackButton />}               // optional back button, renders inline with eyebrow
  actions={<StatusBadge>Active</StatusBadge>} // optional right slot
/>
```

### Status badge
Use `StatusBadge` from `@/components/WorkoutViewer/StatusBadge`:
```tsx
<StatusBadge variant="accent">Active</StatusBadge>
<StatusBadge variant="subtle">Pending</StatusBadge>
<StatusBadge variant="default">Draft</StatusBadge>
<StatusBadge variant="solid">Confirmed</StatusBadge>
```
Variants: `default` (border only), `solid` (surface bg), `accent` (filled accent), `subtle` (surface-strong).

### Back button
```tsx
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

<Link href="/back/path" className="text-[var(--shell-muted)] hover:text-[var(--shell-ink)]">
  <ChevronLeftIcon className="h-4 w-4" />
</Link>
```
No border, no background — just the icon. Pass as `leading` prop to `PageSectionHeader`.

### Todo / action item card
```tsx
<div className="bg-[var(--shell-surface-strong)] p-4">
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 p-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--shell-ink)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">{description}</p>
        {names && <p className="mt-2 text-xs text-[var(--shell-muted)]">{names}</p>}
      </div>
    </div>
    <span className="shrink-0 text-sm font-semibold text-[var(--shell-ink)]">{count}</span>
  </div>
</div>
```

---

## Page Layout Blueprint

Use this structure for any data-rich page (transactions, credits, dashboard, settings):

```tsx
<div className="space-y-8">
  {/* 1. Alert banner (conditional, e.g. payment failed) */}
  {hasError && (
    <div className="flex items-center justify-between border border-red-500 bg-red-50 px-4 py-3 dark:bg-red-950">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
      <button className="ml-4 shrink-0 border border-red-500 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">
        Fix it
      </button>
    </div>
  )}

  {/* 2. Page header */}
  <PageSectionHeader
    eyebrow="Category"
    title="Page Title"
    description="What this page shows."
    titleClassName="text-xl md:text-2xl"
  />

  {/* 3. Metric grid (2–4 cards) */}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="bg-[var(--shell-surface-strong)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Metric</p>
      <p className="mt-2 text-xl font-semibold text-[var(--shell-ink)]">Value</p>
      <p className="mt-1 text-xs text-[var(--shell-muted)]">Supporting text</p>
    </div>
    {/* repeat */}
  </div>

  {/* 4. Row card with action (e.g. payment method, subscription) */}
  <div className="flex items-center justify-between bg-[var(--shell-surface-strong)] p-4">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Section</p>
      <p className="mt-1 text-sm text-[var(--shell-ink)]">Detail</p>
    </div>
    <button className="shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]">
      Action
    </button>
  </div>

  {/* 5. List section (history, log, items) */}
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">History</p>
    {items.length === 0 ? (
      <p className="mt-3 text-sm text-[var(--shell-muted)]">Nothing here yet.</p>
    ) : (
      <ul className="mt-2 divide-y divide-[var(--shell-border)]">
        {/* list items */}
      </ul>
    )}
  </div>
</div>
```

---

## What NOT to do

| Don't | Do instead |
|---|---|
| `rounded-lg` / `rounded-md` | No `rounded-*` at all |
| `shadow-*` | No shadows |
| `border border-[...] p-4` as card | `bg-[var(--shell-surface-strong)] p-4` |
| `Card` / `CardContent` from shadcn | Plain `div` with surface-strong |
| `justify-between` for multi-column rows | `grid grid-cols-[1fr_auto]` + fixed widths |
| Large page headers in bordered boxes | `PageSectionHeader` with no wrapper |
| Back buttons with border/background | Bare `ChevronLeftIcon` link |
| Inline color strings like `#fff` | CSS vars only |
| `text-gray-500` / Tailwind color utilities | `text-[var(--shell-muted)]` |

---

## Reference Implementations

- Transactions page: `mjolksyra-app/app/app/athlete/AthleteTransactions.tsx`
- Dashboard metrics: `mjolksyra-app/app/app/coach/CoachDashboardMetrics.tsx`
- Dashboard overview: `mjolksyra-app/app/app/coach/CoachDashboardOverview.tsx`
- Credits summary: `mjolksyra-app/app/app/coach/CoachCreditsSummaryCard.tsx`
- Todo section: `mjolksyra-app/app/app/coach/CoachDashboardTodoSection.tsx`
- Subscription section: `mjolksyra-app/app/app/coach/CoachDashboardSubscriptionSection.tsx`
- Credits full page: `mjolksyra-app/app/app/coach/CoachCreditsSection.tsx`
- StatusBadge: `mjolksyra-app/components/WorkoutViewer/StatusBadge.tsx`
- PageSectionHeader: `mjolksyra-app/components/Navigation/PageSectionHeader.tsx`
