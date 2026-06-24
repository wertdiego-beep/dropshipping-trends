"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="text-sm px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-card2)" }}
      title={light ? "Modo oscuro" : "Modo claro"}
    >
      {light ? "🌙 Oscuro" : "☀️ Claro"}
    </button>
  );
}
