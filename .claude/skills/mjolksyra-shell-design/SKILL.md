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

## Typography

**Font:** Geist (sans) + Geist Mono (data/numbers) — loaded as local variable fonts.

- Body and headings use `var(--font-geist)` via `--font-body` / `--font-display`
- Numeric data (credits, costs, transaction amounts) use `font-data` utility class or `font-mono` Tailwind class
- `font-mono` in Tailwind resolves to Geist Mono automatically

```tsx
{/* Numeric data with tabular alignment */}
<p className="font-data text-2xl font-semibold text-[var(--shell-ink)]">$142.50</p>
```

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
| `var(--font-mono)` | Geist Mono — use for numeric/code content |

### Motion tokens

| Token | Value | Use |
|---|---|---|
| `var(--ease-out)` | `cubic-bezier(0.23, 1, 0.32, 1)` | UI enter animations, button hover |
| `var(--ease-in-out)` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen movement, skeleton shimmer |
| `var(--ease-drawer)` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers, sliding panels |
| `var(--duration-fast)` | `120ms` | Button press, tooltip |
| `var(--duration-base)` | `200ms` | Dialog open, dropdown |
| `var(--duration-slow)` | `300ms` | Page transitions |

Or use the Tailwind extension classes: `ease-shell-out`, `ease-shell-in-out`, `ease-shell-drawer`.

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

## Component Reference

These are the authoritative patterns for shadcn-based components in the shell. All rounded corners and shadows have been removed from the base components; use these exactly.

### Button
Import from `@/components/ui/button`. Use the `Button` component — never write bare `<button>` for primary actions.

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button variant="default">Save</Button>

// Secondary / cancel
<Button variant="outline">Cancel</Button>

// Quiet background action
<Button variant="secondary">Export</Button>

// Icon-only
<Button variant="ghost" size="icon"><TrashIcon className="h-4 w-4" /></Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Sizes: "sm" | "default" | "lg" | "icon"
<Button size="sm" variant="outline">Small</Button>
```

Rules:
- Never add `rounded-*` to a Button
- `variant="default"` = filled accent — use for the single primary CTA per form/section
- `variant="outline"` = bordered, surface bg — use for secondary actions alongside a primary
- `variant="ghost"` = no background — use for icon buttons and in-table actions
- `variant="secondary"` = surface-strong fill — use for neutral group actions (filters, exports)
- Loading state: pass `disabled` + replace children with `"Saving…"` (no spinner component needed)

---

### Card
Import from `@/components/ui/card`. The `<Card>` component is for **structured, compound content** (title + description + content + footer). For simple metric blocks or info rows, use plain `div` with `bg-[var(--shell-surface-strong)]`.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader className="p-4 pb-0">
    <CardTitle className="text-base font-semibold text-[var(--shell-ink)]">Title</CardTitle>
    <CardDescription>Supporting description text.</CardDescription>
  </CardHeader>
  <CardContent className="p-4">
    {/* content */}
  </CardContent>
  <CardFooter className="border-t border-[var(--shell-border)] p-4">
    <Button variant="outline" size="sm">Action</Button>
  </CardFooter>
</Card>
```

Rules:
- The Card base now uses `bg-[var(--shell-surface-strong)]` — no border, no shadow
- Add `border border-[var(--shell-border)]` only when the card needs explicit separation from a same-color background
- Use `CardFooter` with `border-t border-[var(--shell-border)]` for footer actions
- Override padding via className on CardHeader/CardContent/CardFooter (`p-4` instead of default `p-6`)

---

### Input
Import from `@/components/ui/input`. Always pair with `<Label>`.

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-1.5">
  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
    Email
  </Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Error state
<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" className="border-red-500 focus-visible:ring-red-500" />
  <p className="text-xs text-red-500">Invalid email address.</p>
</div>
```

Rules:
- Never hardcode `border-gray-200` or `text-black` — the component now uses shell tokens
- Error state: add `border-red-500 focus-visible:ring-red-500` via className
- Disabled: just pass `disabled` prop — opacity is handled

---

### Textarea
Import from `@/components/ui/textarea`. Same pairing rules as Input.

```tsx
import { Textarea } from "@/components/ui/textarea";

<div className="space-y-1.5">
  <Label htmlFor="notes">Notes</Label>
  <Textarea id="notes" placeholder="Add a note…" rows={4} />
</div>
```

Rules:
- No `rounded-*` — removed from base
- Use `rows` prop to control height rather than `min-h-*` className

---

### Select
Import from `@/components/ui/select`.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose…" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

Rules:
- No `rounded-*` on trigger or content — removed from base
- Dropdown uses `bg-[var(--shell-surface)]` with `border-[var(--shell-border)]`

---

### Tabs
Import from `@/components/ui/tabs`.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="history">…</TabsContent>
</Tabs>
```

Rules:
- Active tab: `bg-[var(--shell-surface)]` pill within a `bg-[var(--shell-surface-strong)]` list — flat, no shadows
- Prefer `TabsList` with 2–4 tabs max; use a nav sidebar for more

---

### Dialog
Import from `@/components/ui/dialog`.

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader className="border-b border-[var(--shell-border)] pb-4">
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Supporting description.</DialogDescription>
    </DialogHeader>
    {/* form content */}
    <DialogFooter className="border-t border-[var(--shell-border)] pt-4">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="default">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Rules:
- `DialogContent` now uses `bg-[var(--shell-surface)]` with `border-[var(--shell-border)]`
- Add `border-b` to DialogHeader and `border-t` to DialogFooter for clear section separation
- Max width is `max-w-lg` by default; override with `className="max-w-sm"` etc.

---

### Chat
No shadcn component — use the `WorkoutChatPanel` feature component or build custom:

```tsx
{/* Chat layout */}
<div className="flex flex-col">
  {/* Message list — grows upward */}
  <div className="flex-1 overflow-y-auto">
    {messages.map((msg) => (
      <div key={msg.id} className="py-3 border-b border-[var(--shell-border)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
          {msg.role}
        </p>
        <p className="mt-1 text-sm text-[var(--shell-ink)]">{msg.content}</p>
        {msg.isOwn && (
          <div className="mt-1 bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)]">
            {msg.content}
          </div>
        )}
      </div>
    ))}
  </div>
  {/* Composer — pinned to bottom */}
  <div className="border-t border-[var(--shell-border)] p-3 flex items-end gap-2">
    <Textarea placeholder="Write a message…" rows={1} className="flex-1" />
    <Button variant="default" size="sm">Send</Button>
  </div>
</div>
```

Rules:
- Composer always at bottom with `border-t`
- Role label above each message in eyebrow style (`text-[10px] uppercase tracking-[0.1em]`)
- Own messages: `bg-[var(--shell-surface-strong)]` background
- Other messages: no background
- No chat bubbles, no rounded message containers

---

## Animation Utilities

### Skeleton / loading state
Use the `.skeleton` class on any placeholder element:
```tsx
<div className="skeleton h-4 w-32" />
<div className="skeleton h-8 w-full" />
```
The shimmer uses `var(--shell-border)` as the highlight color so it adapts to light/dark themes automatically.

### List stagger reveal
Wrap a list in `.stagger-children` to cascade-animate children on mount:
```tsx
<ul className="stagger-children divide-y divide-[var(--shell-border)]">
  {items.map((item) => (
    <li key={item.id} className="py-3">…</li>
  ))}
</ul>
```
Delays: `0 / 40 / 80 / 120 / 160ms` for the first 5 children. Beyond 5 children all animate together. Respects `prefers-reduced-motion`.

### Page entry animation
Use `.blocks-rise` for section-level enter animations:
```tsx
<div className="blocks-rise">…</div>
```

---

## What NOT to do

| Don't | Do instead |
|---|---|
| `rounded-lg` / `rounded-md` | No `rounded-*` at all |
| `shadow-*` | No shadows |
| `border border-[...] p-4` as card | `bg-[var(--shell-surface-strong)] p-4` |
| `Card` from shadcn for simple metrics | Plain `div` with `bg-[var(--shell-surface-strong)] p-4` |
| `justify-between` for multi-column rows | `grid grid-cols-[1fr_auto]` + fixed widths |
| Large page headers in bordered boxes | `PageSectionHeader` with no wrapper |
| Back buttons with border/background | Bare `ChevronLeftIcon` link |
| Inline color strings like `#fff` | CSS vars only |
| `text-gray-500` / Tailwind color utilities | `text-[var(--shell-muted)]` |
| `transition-colors` on `<Button>` | Already handled — base CVA includes proper `transition-[background-color,transform,opacity]` with `active:scale-[0.97]` |
| `transition: all` | Always specify exact properties |
| Raw numbers without monospace | Use `font-data` class or `font-mono` for credits, costs, metrics |
| `Inter` font | Geist (sans) + Geist Mono (numbers) |

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
