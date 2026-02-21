import { SignUpButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
};

export function RegisterDialog({ trigger }: Props) {
  return <SignUpButton mode="redirect">{trigger}</SignUpButton>;
}
