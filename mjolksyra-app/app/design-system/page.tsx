import type { Metadata } from "next";
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
  PaperclipIcon,
  TrashIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { TabsDemo } from "./TabsDemo";
import { DialogDemo } from "./DialogDemo";
import { WorkoutDetailHeaderDemo } from "./WorkoutDetailHeaderDemo";

export const metadata: Metadata = {
  title: "Design System",
  robots: {
    index: false,
    follow: false,
  },
};

/* ─── helpers ─────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--shell-muted)]">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-[var(--shell-ink)]">{children}</h2>
  );
}

function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-6 border-b border-[var(--shell-border)] py-4 last:border-0">
      <div className="pt-0.5">
        <p className="text-xs text-[var(--shell-muted)]">{label}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div className="border-b border-[var(--shell-border)] pb-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-0.5 text-base font-semibold text-[var(--shell-ink)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/* ─── data ─────────────────────────────────────────────────────── */

const shellTokens = [
  { name: "--shell-bg", label: "bg", desc: "Page background" },
  { name: "--shell-surface", label: "surface", desc: "Default surface" },
  { name: "--shell-surface-strong", label: "surface-strong", desc: "Card / elevated" },
  { name: "--shell-ink", label: "ink", desc: "Primary text" },
  { name: "--shell-muted", label: "muted", desc: "Secondary text" },
  { name: "--shell-border", label: "border", desc: "Dividers & inputs" },
  { name: "--shell-accent", label: "accent", desc: "Primary accent" },
  { name: "--shell-accent-ink", label: "accent-ink", desc: "Text on accent" },
];

const listItems = [
  { id: "1", date: "Apr 1, 2026", desc: "Monthly subscription", amount: "$49.00", status: "Paid" as const },
  { id: "2", date: "Mar 1, 2026", desc: "Monthly subscription", amount: "$49.00", status: "Paid" as const },
  { id: "3", date: "Feb 1, 2026", desc: "Monthly subscription", amount: "$49.00", status: "Pending" as const },
];

const chatMessages = [
  { id: "1", role: "Coach", own: false, content: "Great session today — your squat depth was noticeably better.", image: null },
  { id: "2", role: "Athlete", own: true, content: null, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id: "3", role: "Coach", own: false, content: "Yes — bump it 5 kg and keep the same rep scheme.", image: null },
];

const navLinks = [
  { href: "#tokens", label: "Color Tokens" },
  { href: "#typography", label: "Typography" },
  { href: "#button", label: "Button" },
  { href: "#card", label: "Card" },
  { href: "#badges", label: "Badge" },
  { href: "#forms", label: "Form Controls" },
  { href: "#tabs", label: "Tabs" },
  { href: "#dialog", label: "Dialog" },
  { href: "#chat", label: "Chat" },
  { href: "#list", label: "List" },
  { href: "#page-header", label: "Page Header" },
  { href: "#workout-header", label: "Workout Header" },
  { href: "#patterns", label: "Patterns" },
];

/* ─── page ─────────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--shell-bg)]">
      {/* top bar */}
      <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-4">
        <Eyebrow>Mjolksyra</Eyebrow>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[var(--shell-ink)]">
          Design System
        </h1>
        <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
          Shell tokens · shadcn components · layout patterns · no rounded corners · no shadows
        </p>
      </div>

      <div className="flex">
        {/* sticky nav — bg-[var(--shell-surface)] with right border */}
        <nav className="hidden w-48 shrink-0 border-r border-[var(--shell-border)] bg-[var(--shell-surface)] lg:block">
          <ul className="sticky top-0 space-y-0 py-6">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block px-6 py-1.5 text-xs text-[var(--shell-muted)] transition-colors hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* content — bg-[var(--shell-surface)] */}
        <div className="min-w-0 flex-1 space-y-14 bg-[var(--shell-surface)] px-8 py-8">

            {/* ── Tokens ──────────────────────────────── */}
            <Section id="tokens" eyebrow="Foundation" title="Color Tokens">
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {shellTokens.map((t) => (
                  <div key={t.name} className="space-y-1.5">
                    <div
                      className="h-10 w-full border border-[var(--shell-border)]"
                      style={{ background: `var(${t.name})` }}
                    />
                    <p className="text-[10px] font-semibold text-[var(--shell-ink)]">{t.label}</p>
                    <p className="text-[10px] text-[var(--shell-muted)]">{t.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Typography ──────────────────────────── */}
            <Section id="typography" eyebrow="Foundation" title="Typography">
              <div className="space-y-0 divide-y divide-[var(--shell-border)]">
                {[
                  { label: "Display", node: <p className="text-3xl font-semibold tracking-tight text-[var(--shell-ink)]">Athlete Dashboard</p> },
                  { label: "Heading 1", node: <p className="text-2xl font-semibold tracking-tight text-[var(--shell-ink)]">Weekly Overview</p> },
                  { label: "Heading 2", node: <p className="text-xl font-semibold text-[var(--shell-ink)]">Training Sessions</p> },
                  { label: "Heading 3", node: <p className="text-base font-semibold text-[var(--shell-ink)]">Exercise Log</p> },
                  { label: "Eyebrow", node: <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Section label</p> },
                  { label: "Body", node: <p className="text-sm text-[var(--shell-ink)]">Your coach has updated your program for next week. Review the changes before your next session.</p> },
                  { label: "Muted", node: <p className="text-sm text-[var(--shell-muted)]">Last updated 3 days ago by your coach.</p> },
                  { label: "Caption", node: <p className="text-xs text-[var(--shell-muted)]">Weight in kilograms · Reps per set</p> },
                ].map(({ label, node }) => (
                  <div key={label} className="grid grid-cols-[96px_1fr] items-center gap-6 py-3">
                    <p className="text-[10px] text-[var(--shell-muted)]">{label}</p>
                    {node}
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Button ──────────────────────────────── */}
            <Section id="button" eyebrow="Components" title="Button">
              <div className="divide-y divide-[var(--shell-border)]">
                <SpecRow label="Variants">
                  <Button variant="default">Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </SpecRow>
                <SpecRow label="Sizes">
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="outline" size="default">Default</Button>
                  <Button variant="outline" size="lg">Large</Button>
                  <Button variant="outline" size="icon"><BellIcon /></Button>
                  <Button variant="outline" size="icon-sm"><BellIcon /></Button>
                </SpecRow>
                <SpecRow label="States">
                  <Button variant="default">Active</Button>
                  <Button variant="default" disabled>Saving…</Button>
                  <Button variant="outline" disabled>Disabled</Button>
                </SpecRow>
                <SpecRow label="With icon">
                  <Button variant="default"><ZapIcon />Analyze</Button>
                  <Button variant="outline"><UserIcon />Invite</Button>
                  <Button variant="ghost" size="icon"><TrashIcon /></Button>
                </SpecRow>
              </div>
            </Section>

            {/* ── Card ────────────────────────────────── */}
            <Section id="card" eyebrow="Components" title="Card">
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">Metric grid — plain div with surface-strong</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Athletes", value: "12", sub: "Active this month" },
                      { label: "Sessions", value: "48", sub: "Last 30 days" },
                      { label: "Revenue", value: "$588", sub: "Monthly recurring" },
                      { label: "Rating", value: "4.9", sub: "From 23 reviews" },
                    ].map((m) => (
                      <div key={m.label} className="bg-[var(--shell-surface-strong)] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">{m.label}</p>
                        <p className="mt-1.5 text-xl font-semibold text-[var(--shell-ink)]">{m.value}</p>
                        <p className="mt-0.5 text-[10px] text-[var(--shell-muted)]">{m.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">shadcn Card — compound component</p>
                  <Card className="max-w-sm">
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-sm font-semibold text-[var(--shell-ink)]">Subscription</CardTitle>
                      <CardDescription>Current plan and billing status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-xs text-[var(--shell-ink)]">Pro · $49 / month · Renews Apr 15</p>
                    </CardContent>
                    <CardFooter className="border-t border-[var(--shell-border)] p-4">
                      <Button variant="outline" size="sm">Manage billing</Button>
                    </CardFooter>
                  </Card>
                </div>

                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">Row card with action</p>
                  <div className="flex items-center justify-between bg-[var(--shell-surface-strong)] p-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Payment method</p>
                      <p className="mt-0.5 text-xs text-[var(--shell-ink)]">Visa ending in 4242</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">Accent callout</p>
                  <div className="border-l-2 border-[var(--shell-accent)] pl-3">
                    <p className="text-xs font-semibold text-[var(--shell-ink)]">Coach note</p>
                    <p className="mt-0.5 text-xs text-[var(--shell-muted)]">Focus on tempo — 3 seconds down, pause at bottom.</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Badges ──────────────────────────────── */}
            <Section id="badges" eyebrow="Components" title="Badge">
              <div className="divide-y divide-[var(--shell-border)]">
                <SpecRow label="Badge (shadcn)">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </SpecRow>
                <SpecRow label="StatusBadge">
                  <StatusBadge variant="accent">Active</StatusBadge>
                  <StatusBadge variant="solid">Confirmed</StatusBadge>
                  <StatusBadge variant="subtle">Pending</StatusBadge>
                  <StatusBadge variant="default">Draft</StatusBadge>
                </SpecRow>
              </div>
            </Section>

            {/* ── Forms ───────────────────────────────── */}
            <Section id="forms" eyebrow="Components" title="Form Controls">
              <div className="divide-y divide-[var(--shell-border)]">
                <SpecRow label="Input — default">
                  <div className="w-64">
                    <Input type="text" placeholder="Enter your name" />
                  </div>
                </SpecRow>
                <SpecRow label="Input — error">
                  <div className="w-64 space-y-1">
                    <Input
                      defaultValue="invalid"
                      className="border-red-500 focus-visible:ring-red-500"
                    />
                    <p className="text-[10px] text-red-500">Invalid email address.</p>
                  </div>
                </SpecRow>
                <SpecRow label="Input — disabled">
                  <div className="w-64">
                    <Input defaultValue="Read-only value" disabled />
                  </div>
                </SpecRow>
                <SpecRow label="Textarea">
                  <div className="w-64">
                    <Textarea placeholder="Write a note…" rows={3} />
                  </div>
                </SpecRow>
                <SpecRow label="Select">
                  <div className="w-48">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a sport…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weightlifting">Weightlifting</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SpecRow>
                <SpecRow label="Label + field">
                  <div className="w-64 space-y-1.5">
                    <Label
                      htmlFor="ds-full-name"
                      className="text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
                    >
                      Full name
                    </Label>
                    <Input id="ds-full-name" placeholder="Jordan Smith" />
                  </div>
                </SpecRow>
                <SpecRow label="Switch">
                  <div className="flex items-center gap-2">
                    <Switch id="ds-switch" />
                    <Label htmlFor="ds-switch" className="text-xs text-[var(--shell-ink)]">
                      Enable notifications
                    </Label>
                  </div>
                </SpecRow>
              </div>
            </Section>

            {/* ── Tabs ────────────────────────────────── */}
            <Section id="tabs" eyebrow="Components" title="Tabs">
              <TabsDemo />
            </Section>

            {/* ── Dialog ──────────────────────────────── */}
            <Section id="dialog" eyebrow="Components" title="Dialog">
              <p className="text-xs text-[var(--shell-muted)]">
                Uses <code className="text-[var(--shell-ink)]">bg-[var(--shell-surface)]</code> with sharp border. Header and footer use <code className="text-[var(--shell-ink)]">border-b</code> / <code className="text-[var(--shell-ink)]">border-t</code>.
              </p>
              <DialogDemo />
            </Section>

            {/* ── Chat ────────────────────────────────── */}
            <Section id="chat" eyebrow="Components" title="Chat">
              <div className="flex flex-col border border-[var(--shell-border)] bg-[var(--shell-surface)]">
                <div className="flex-1 divide-y divide-[var(--shell-border)]">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`p-3 ${msg.own ? "flex flex-col items-end" : ""}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                        {msg.role}
                      </p>
                      {msg.own ? (
                        <div className="mt-1.5 max-w-[76%] bg-[var(--shell-bg)] px-3 py-2">
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Attached"
                              className="mb-2 max-h-48 w-auto object-cover"
                            />
                          )}
                          {msg.content && (
                            <p className="text-xs text-[var(--shell-ink)]">{msg.content}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1.5 max-w-[76%] text-xs text-[var(--shell-ink)]">{msg.content}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-2 border-t border-[var(--shell-border)] p-3">
                  <Button variant="ghost" size="icon-sm" className="shrink-0 text-[var(--shell-muted)]">
                    <PaperclipIcon />
                  </Button>
                  <Textarea placeholder="Write a message…" rows={1} className="flex-1" />
                  <Button variant="default" size="sm">Send</Button>
                </div>
              </div>
            </Section>

            {/* ── List ────────────────────────────────── */}
            <Section id="list" eyebrow="Patterns" title="List with Dividers">
              <div>
                <div className="flex items-center justify-between">
                  <Eyebrow>Transaction history</Eyebrow>
                  <Button variant="ghost" size="sm">View all</Button>
                </div>
                <ul className="mt-2 divide-y divide-[var(--shell-border)]">
                  {listItems.map((item) => (
                    <li key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-2.5">
                      <div className="flex items-center gap-6">
                        <p className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)]">
                          {item.date}
                        </p>
                        <p className="text-xs text-[var(--shell-muted)]">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="w-14 text-right text-xs font-semibold text-[var(--shell-ink)]">{item.amount}</p>
                        <StatusBadge variant={item.status === "Paid" ? "accent" : "subtle"}>
                          {item.status}
                        </StatusBadge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            {/* ── Page Header ─────────────────────────── */}
            <Section id="page-header" eyebrow="Patterns" title="Page Section Header">
              <div className="space-y-4">
                <div className="bg-[var(--shell-surface-strong)] p-4">
                  <p className="mb-3 text-[10px] text-[var(--shell-muted)]">With eyebrow + description</p>
                  <PageSectionHeader
                    eyebrow="Athletes"
                    title="Manage Athletes"
                    description="View and manage all athletes on your roster."
                  />
                </div>
                <div className="bg-[var(--shell-surface-strong)] p-4">
                  <p className="mb-3 text-[10px] text-[var(--shell-muted)]">With actions slot</p>
                  <PageSectionHeader
                    eyebrow="Workouts"
                    title="Training Plan"
                    description="Week of April 7, 2026"
                    actions={
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="accent">Active</StatusBadge>
                        <Button variant="outline" size="sm">Edit plan</Button>
                      </div>
                    }
                  />
                </div>
              </div>
            </Section>

            {/* ── Workout Header ──────────────────────── */}
            <Section id="workout-header" eyebrow="Patterns" title="Workout Detail Header">
              <WorkoutDetailHeaderDemo />
            </Section>

            {/* ── Patterns ────────────────────────────── */}
            <Section id="patterns" eyebrow="Patterns" title="Misc Patterns">
              <div className="space-y-6">
                {/* Action items */}
                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">Action items</p>
                  <div className="space-y-2">
                    {[
                      { icon: ClockIcon, title: "Pending invitations", desc: "Athletes who haven't accepted.", names: "alex@example.com, sam@example.com", count: "2" },
                      { icon: CheckCircleIcon, title: "Workouts to review", desc: "Athletes waiting for feedback.", names: "Jordan, Taylor, Morgan", count: "3" },
                    ].map((item) => (
                      <div key={item.title} className="bg-[var(--shell-surface-strong)] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-1.5 text-[var(--shell-ink)]">
                              <item.icon className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[var(--shell-ink)]">{item.title}</p>
                              <p className="mt-0.5 text-xs text-[var(--shell-muted)]">{item.desc}</p>
                              <p className="mt-1 text-[10px] text-[var(--shell-muted)]">{item.names}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-[var(--shell-ink)]">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert banners */}
                <div>
                  <p className="mb-3 text-xs text-[var(--shell-muted)]">Alert banners</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border border-red-500 bg-red-50 px-3 py-2 dark:bg-red-950">
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        Payment failed — subscription is paused.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-3 shrink-0 border-red-500 bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Fix it
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
                      <BellIcon className="h-3.5 w-3.5 shrink-0 text-[var(--shell-muted)]" />
                      <p className="text-xs text-[var(--shell-ink)]">You have 3 pending athlete requests.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

        </div>{/* content */}
      </div>{/* flex row */}
    </div>
  );
}
