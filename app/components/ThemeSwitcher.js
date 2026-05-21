"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full border border-[var(--border)] bg-[var(--surface-strong)]" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-11 h-11 rounded-full border-2 border-[var(--border)] bg-[var(--bg)] flex items-center justify-center text-2xl transition-transform hover:scale-110 hover:shadow-md"
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
