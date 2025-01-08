"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  trigger: ReactNode;
  title: string;
  description: string;
  continueButton?: string;
  continueButtonVariant?: "default" | "destructive";
  cancelButton?: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  cancelButton,
  continueButton,
  continueButtonVariant,
  onConfirm,
}: Props) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={"secondary"}
            onClick={async () => {
              setOpen(false);
            }}
          >
            {cancelButton ?? "Cancel"}
          </Button>
          <Button
            variant={continueButtonVariant}
            onClick={async () => {
              setOpen(false);
              onConfirm();
            }}
          >
            {continueButton ?? "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
