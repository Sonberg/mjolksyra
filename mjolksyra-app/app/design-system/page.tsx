import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { StatusBadge } from "@/components/WorkoutViewer/StatusBadge";
import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { TabsDemo } from "./TabsDemo";
import { DialogDemo } from "./DialogDemo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
      {children}
    </p>
  );
}

function SectionHeader({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <div className="border-b border-[var(--shell-border)] pb-3">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-1 text-xl font-semibold text-[var(--shell-ink)]">
        {title}
      </h2>
    </div>
  );
}

const tokens = [
  { name: "--shell-bg", label: "bg", description: "Page background" },
  { name: "--shell-surface", label: "surface", description: "Default surface" },
  {
    name: "--shell-surface-strong",
    label: "surface-strong",
    description: "Elevated surface / card bg",
  },
  { name: "--shell-ink", label: "ink", description: "Primary text" },
  { name: "--shell-muted", label: "muted", description: "Secondary text" },
  { name: "--shell-border", label: "border", description: "Dividers & input borders" },
  { name: "--shell-accent", label: "accent", description: "Primary accent" },
  {
    name: "--shell-accent-ink",
    label: "accent-ink",
    description: "Text on accent bg",
  },
];

const listItems = [
  { id: "1", label: "Apr 1, 2026", secondary: "Monthly subscription", value: "$49.00", status: "Paid" as const },
  { id: "2", label: "Mar 1, 2026", secondary: "Monthly subscription", value: "$49.00", status: "Paid" as const },
  { id: "3", label: "Feb 1, 2026", secondary: "Monthly subscription", value: "$49.00", status: "Pending" as const },
];

const chatMessages = [
  { id: "1", role: "Coach", content: "Great session today — your squat depth was noticeably better.", isOwn: false },
  { id: "2", role: "Athlete", content: "Thanks! I've been working on hip mobility. Should I increase the weight next time?", isOwn: true },
  { id: "3", role: "Coach", content: "Yes — bump it 5 kg and keep the same rep scheme. Let me know how it feels.", isOwn: false },
];

export default function DesignSystemPage() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--shell-bg)] px-6 py-12 theme-shell-two">
      <div className="mx-auto max-w-4xl space-y-20">
        {/* Page header */}
        <PageSectionHeader
          eyebrow="Mjolksyra"
          title="Design System"
          description="Shell tokens, shadcn components, and layout patterns for the Mjolksyra UI."
          titleClassName="text-3xl md:text-4xl"
        />

        {/* ── Color Tokens ─────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Foundation" title="Color Tokens" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tokens.map((t) => (
              <div key={t.name} className="space-y-2">
                <div
                  className="h-14 w-full border border-[var(--shell-border)]"
                  style={{ background: `var(${t.name})` }}
                />
                <div>
                  <p className="text-xs font-semibold text-[var(--shell-ink)]">
                    {t.label}
                  </p>
                  <p className="text-[10px] text-[var(--shell-muted)]">
                    {t.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ───────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Foundation" title="Typography" />
          <div className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                Display
              </span>
              <p className="text-4xl font-semibold tracking-tight text-[var(--shell-ink)]">
                Athlete Dashboard
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                H1
              </span>
              <p className="text-3xl font-semibold tracking-tight text-[var(--shell-ink)]">
                Weekly Overview
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                H2
              </span>
              <p className="text-2xl font-semibold tracking-tight text-[var(--shell-ink)]">
                Training Sessions
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                H3
              </span>
              <p className="text-xl font-semibold text-[var(--shell-ink)]">
                Exercise Log
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                Eyebrow
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                Section label
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                Body
              </span>
              <p className="text-sm text-[var(--shell-ink)]">
                Your coach has updated your program for next week. Review the
                changes before your next session.
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                Muted
              </span>
              <p className="text-sm text-[var(--shell-muted)]">
                Last updated 3 days ago by your coach.
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                Caption
              </span>
              <p className="text-xs text-[var(--shell-muted)]">
                Weight in kilograms · Reps per set
              </p>
            </div>
          </div>
        </section>

        {/* ── Buttons ──────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Button" />

          <div className="space-y-5">
            <div>
              <SectionLabel>Variants</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <SectionLabel>Sizes</SectionLabel>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="default">Default</Button>
                <Button variant="outline" size="lg">Large</Button>
                <Button variant="outline" size="icon">
                  <BellIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <SectionLabel>States</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="default">Active</Button>
                <Button variant="default" disabled>
                  Saving…
                </Button>
                <Button variant="outline" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <SectionLabel>With icon</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="default">
                  <ZapIcon className="h-4 w-4" />
                  Analyze
                </Button>
                <Button variant="outline">
                  <UserIcon className="h-4 w-4" />
                  Invite athlete
                </Button>
                <Button variant="ghost" size="icon">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cards ────────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Card" />

          <div className="space-y-5">
            <div>
              <SectionLabel>Metric grid</SectionLabel>
              <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Athletes", value: "12", sub: "Active this month" },
                  { label: "Sessions", value: "48", sub: "Last 30 days" },
                  { label: "Revenue", value: "$588", sub: "Monthly recurring" },
                  { label: "Avg rating", value: "4.9", sub: "From 23 reviews" },
                ].map((m) => (
                  <div key={m.label} className="bg-[var(--shell-surface-strong)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                      {m.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--shell-ink)]">
                      {m.value}
                    </p>
                    <p className="mt-1 text-xs text-[var(--shell-muted)]">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>shadcn Card (compound)</SectionLabel>
              <div className="mt-3 max-w-sm">
                <Card>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-semibold text-[var(--shell-ink)]">
                      Subscription
                    </CardTitle>
                    <CardDescription>
                      Your current plan and billing status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-[var(--shell-ink)]">
                      Pro · $49 / month · Renews Apr 15
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-[var(--shell-border)] p-4">
                    <Button variant="outline" size="sm">
                      Manage billing
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div>
              <SectionLabel>Row card with action</SectionLabel>
              <div className="mt-3 flex items-center justify-between bg-[var(--shell-surface-strong)] p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                    Payment method
                  </p>
                  <p className="mt-1 text-sm text-[var(--shell-ink)]">
                    Visa ending in 4242
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>

            <div>
              <SectionLabel>Accent callout</SectionLabel>
              <div className="mt-3 border-l-2 border-[var(--shell-accent)] pl-3">
                <p className="text-sm font-semibold text-[var(--shell-ink)]">
                  Coach note
                </p>
                <p className="mt-0.5 text-sm text-[var(--shell-muted)]">
                  Focus on tempo this week — 3 seconds down, pause at bottom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Badges ───────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Badge" />

          <div className="space-y-5">
            <div>
              <SectionLabel>Badge (shadcn)</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div>
              <SectionLabel>StatusBadge (custom)</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge variant="accent">Active</StatusBadge>
                <StatusBadge variant="solid">Confirmed</StatusBadge>
                <StatusBadge variant="subtle">Pending</StatusBadge>
                <StatusBadge variant="default">Draft</StatusBadge>
              </div>
            </div>
          </div>
        </section>

        {/* ── Form Controls ─────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Form Controls" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="ds-input-default"
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                >
                  Input — default
                </Label>
                <Input
                  id="ds-input-default"
                  type="text"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="ds-input-error"
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                >
                  Input — error
                </Label>
                <Input
                  id="ds-input-error"
                  type="email"
                  defaultValue="invalid"
                  className="border-red-500 focus-visible:ring-red-500"
                />
                <p className="text-xs text-red-500">Invalid email address.</p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="ds-input-disabled"
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                >
                  Input — disabled
                </Label>
                <Input
                  id="ds-input-disabled"
                  defaultValue="Read-only value"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="ds-textarea"
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                >
                  Textarea
                </Label>
                <Textarea
                  id="ds-textarea"
                  placeholder="Write a note…"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="ds-select"
                  className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                >
                  Select
                </Label>
                <Select>
                  <SelectTrigger id="ds-select">
                    <SelectValue placeholder="Choose a sport…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weightlifting">Weightlifting</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="ds-switch" />
                <Label
                  htmlFor="ds-switch"
                  className="text-sm text-[var(--shell-ink)]"
                >
                  Enable notifications
                </Label>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Tabs" />
          <TabsDemo />
        </section>

        {/* ── Dialog ───────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Dialog" />
          <div>
            <p className="mb-3 text-sm text-[var(--shell-muted)]">
              Dialogs use <code className="text-[var(--shell-ink)]">bg-[var(--shell-surface)]</code> with a sharp border. Header and footer have <code className="text-[var(--shell-ink)]">border-b</code> / <code className="text-[var(--shell-ink)]">border-t</code> separators.
            </p>
            <DialogDemo />
          </div>
        </section>

        {/* ── Chat Preview ─────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Components" title="Chat" />
          <div className="flex flex-col border border-[var(--shell-border)]">
            <div className="flex-1 divide-y divide-[var(--shell-border)]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                    {msg.role}
                  </p>
                  {msg.isOwn ? (
                    <div className="mt-1.5 bg-[var(--shell-surface-strong)] px-3 py-2">
                      <p className="text-sm text-[var(--shell-ink)]">{msg.content}</p>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-sm text-[var(--shell-ink)]">{msg.content}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--shell-border)] p-3 flex items-end gap-2">
              <Textarea
                placeholder="Write a message…"
                rows={1}
                className="flex-1"
              />
              <Button variant="default" size="sm">
                Send
              </Button>
            </div>
          </div>
        </section>

        {/* ── List Pattern ─────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Patterns" title="List with Dividers" />
          <div>
            <div className="flex items-center justify-between">
              <SectionLabel>Transaction history</SectionLabel>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            <ul className="mt-2 divide-y divide-[var(--shell-border)]">
              {listItems.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"
                >
                  <div className="flex items-center gap-6">
                    <p className="w-28 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--shell-muted)]">
                      {item.secondary}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="w-16 text-right text-sm font-semibold text-[var(--shell-ink)]">
                      {item.value}
                    </p>
                    <StatusBadge
                      variant={item.status === "Paid" ? "accent" : "subtle"}
                    >
                      {item.status}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Page Section Header ───────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Patterns" title="Page Section Header" />
          <div className="space-y-6">
            <div className="bg-[var(--shell-surface-strong)] p-4">
              <SectionLabel>With eyebrow + description</SectionLabel>
              <div className="mt-3">
                <PageSectionHeader
                  eyebrow="Athletes"
                  title="Manage Athletes"
                  description="View and manage all athletes on your roster."
                />
              </div>
            </div>

            <div className="bg-[var(--shell-surface-strong)] p-4">
              <SectionLabel>With actions slot</SectionLabel>
              <div className="mt-3">
                <PageSectionHeader
                  eyebrow="Workouts"
                  title="Training Plan"
                  description="Week of April 7, 2026"
                  actions={
                    <div className="flex gap-2">
                      <StatusBadge variant="accent">Active</StatusBadge>
                      <Button variant="outline" size="sm">
                        Edit plan
                      </Button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Todo / Action Items ───────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Patterns" title="Action Items" />
          <div className="space-y-3">
            {[
              {
                icon: ClockIcon,
                title: "Pending invitations",
                description: "Athletes who haven't accepted yet.",
                names: "alex@example.com, sam@example.com",
                count: "2",
              },
              {
                icon: CheckCircleIcon,
                title: "Workouts to review",
                description: "Athletes waiting for feedback on completed sessions.",
                names: "Jordan, Taylor, Morgan",
                count: "3",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--shell-surface-strong)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-2 text-[var(--shell-ink)]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--shell-ink)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--shell-muted)]">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs text-[var(--shell-muted)]">
                        {item.names}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[var(--shell-ink)]">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Alert Banner ─────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader label="Patterns" title="Alert Banner" />
          <div className="space-y-3">
            <div className="flex items-center justify-between border border-red-500 bg-red-50 px-4 py-3 dark:bg-red-950">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Payment failed — your subscription is paused.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 shrink-0 border-red-500 bg-red-100 text-red-700 hover:bg-red-200"
              >
                Fix it
              </Button>
            </div>
            <div className="flex items-center gap-3 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
              <BellIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
              <p className="text-sm text-[var(--shell-ink)]">
                You have 3 pending athlete requests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
