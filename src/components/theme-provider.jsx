import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const applyTheme = (mode) => {
    const root = document.documentElement;
    const resolved = mode === "system" ? getSystemTheme() : mode;

    // 🌗 Tailwind dark mode
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // 🔥 Favicon sync
    const favicon = document.getElementById("favicon");
    if (favicon) {
      favicon.href =
        resolved === "dark"
          ? "/icon-dark.png"
          : "/icon-light.png";
    }

    // 🎨 Optional: browser UI color (mobile)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = resolved === "dark" ? "#0b2230" : "#ffffff";
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Listen to OS theme change
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}