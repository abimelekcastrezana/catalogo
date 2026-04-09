"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "catalog-theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Read what the inline script already applied — never overwrite it on mount
    const current = document.documentElement.dataset.theme || "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  }

  return (
    <div className="theme-switcher">
      <button type="button" onClick={toggle}>
        {theme === "light" ? "Modo oscuro" : "Modo claro"}
      </button>
    </div>
  );
}
