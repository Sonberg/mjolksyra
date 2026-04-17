"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/context/Theme";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 rounded-none"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon data-icon /> : <MoonIcon data-icon />}
    </Button>
  );
}
