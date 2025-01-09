"use client";

import type { ComponentProps } from "react";
import { ThemeProvider } from "next-themes";

export function Theme({ children }: ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
