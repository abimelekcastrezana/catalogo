"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "catalog-theme";

export default function ThemeSwitcher() {
  // Always start with "light" to match server render — no hydration mismatch
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // After mount, sync with what the inline script already applied to <html>
    const current = document.documentElement.dataset.theme || "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="theme-switcher">
      <button type="button" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
        {theme === "light" ? "Modo oscuro" : "Modo claro"}
      </button>
    </div>
  );
}
