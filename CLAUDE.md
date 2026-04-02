Frontend
- Add e2e tests with Playwright for every feature
- Add story / storeis to Storybook
- BuilderBuilder & WorkoutPlanner should aways have matching, UX & design
- Use seb.io design system (full spec: ~/.claude/skills/seb-green-design-system.md)
  - Borders: always 1px (`border`), never `border-2` or thicker
  - Shadows: subtle only (`shadow-sm` max) — no offset box-shadows
  - Headings: sentence case, never ALL CAPS or CSS `uppercase`
  - Typography: headings/body use font-weight 400–500; `uppercase tracking-*` only on `text-xs` section labels and badges
  - Motion: `transition-[property]` with `ease-out` cubic-bezier(0.22, 1, 0.36, 1), 0.2–0.4s duration

Backend
- Add unit tests with Xunit for every feature
