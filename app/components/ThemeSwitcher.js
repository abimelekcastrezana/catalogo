"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "catalog-theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
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
    <button
      type="button"
      onClick={toggle}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '2px solid var(--border)',
        background: 'var(--bg)',
        color: 'var(--fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={theme === "light" ? "Modo oscuro" : "Modo claro"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
