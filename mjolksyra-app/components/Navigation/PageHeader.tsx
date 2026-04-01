import { cn } from "@/lib/utils";
import { PageSectionHeader } from "./PageSectionHeader";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof PageSectionHeader> & {
  sectionClassName?: string;
  children?: ReactNode;
};

export function PageHeader({ sectionClassName, children, ...props }: Props) {
  return (
    <section
      className={cn(
        "rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-7",
        sectionClassName,
      )}
    >
      <PageSectionHeader {...props} />
      {children}
    </section>
  );
}
