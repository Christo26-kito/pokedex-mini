import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext({
  dark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("pokedex-theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("pokedex-theme", dark ? "dark" : "light");
  }, [dark]);

  function toggle() {
    setDark((d) => !d);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
