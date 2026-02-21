import { SignInButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
};

export function LoginDialog({ trigger }: Props) {
  return <SignInButton mode="redirect">{trigger}</SignInButton>;
}
