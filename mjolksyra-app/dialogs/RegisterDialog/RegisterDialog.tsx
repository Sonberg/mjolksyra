"use client";

import { Waitlist } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type Props = {
  trigger: ReactNode;
};

export function RegisterDialog({ trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] border-2 bg-zinc-950 p-0 shadow-none sm:max-w-md [&>button]:hidden">
        <Waitlist
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full",
              card: "w-full border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.65)]",
              headerTitle: "text-zinc-100",
              headerSubtitle: "text-zinc-400",
              formFieldLabel: "text-zinc-400",
              socialButtonsBlockButton:
                "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
              formButtonPrimary:
                "bg-zinc-100 text-black hover:bg-zinc-300 shadow-none",
              formFieldInput:
                "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500",
              footer: "bg-zinc-950 border-zinc-800",
              footerActionText: "text-zinc-400",
              footerActionLink: "text-zinc-100 hover:text-white",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
