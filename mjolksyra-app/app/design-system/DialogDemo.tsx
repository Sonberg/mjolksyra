"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="border-b border-[var(--shell-border)] pb-4">
          <DialogTitle>Invite athlete</DialogTitle>
          <DialogDescription>
            Send an invitation to a new athlete to join your coaching roster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="ds-email"
              className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
            >
              Email
            </Label>
            <Input id="ds-email" type="email" placeholder="athlete@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="ds-price"
              className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]"
            >
              Monthly price
            </Label>
            <Input id="ds-price" type="number" placeholder="0" />
          </div>
        </div>
        <DialogFooter className="border-t border-[var(--shell-border)] pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="default">Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
