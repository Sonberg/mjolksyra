"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "right" | "left" | "top" | "bottom";
}) {
  const sideStyles = {
    right:
      "inset-y-0 right-0 h-full w-[85vw] max-w-sm data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left: "inset-y-0 left-0 h-full w-[85vw] max-w-sm data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    top: "inset-x-0 top-0 w-full data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
    bottom:
      "inset-x-0 bottom-0 w-full data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-[var(--shell-surface)] shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200",
          sideStyles[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-base font-semibold text-[var(--shell-ink)]", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };
