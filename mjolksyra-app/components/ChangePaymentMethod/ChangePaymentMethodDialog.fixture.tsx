"use client";

import { useState } from "react";
import { ChangePaymentMethodDialog } from "./ChangePaymentMethodDialog";

function Fixture({ initialOpen }: { initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="min-h-screen bg-background p-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)]"
      >
        Open dialog
      </button>
      <ChangePaymentMethodDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default {
  Closed: () => <Fixture initialOpen={false} />,
  Open: () => <Fixture initialOpen={true} />,
};
