import { Outlet, Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext.jsx";
import {
  BookOpenIcon,
  HeartIcon,
  CompareIcon,
  MoonIcon,
  SunIcon,
} from "./Icons.jsx";

function Tab({ to, label, Icon }) {
  const location = useLocation();
  const isActive =
    to === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/pokemon")
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`tab ${isActive ? "active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon />
      <span>{label}</span>
    </Link>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <Link to="/" className="app-title-link">
            <h1>PokéDex Mini</h1>
          </Link>
          <ThemeToggle />
        </div>
        <p className="app-subtitle">Browse, compare & catch Pokémon</p>
      </header>

      <nav className="tab-nav" aria-label="Primary">
        <Tab to="/" label="Pokédex" Icon={BookOpenIcon} />
        <Tab to="/favorites" label="Favorites" Icon={HeartIcon} />
        <Tab to="/compare" label="Compare" Icon={CompareIcon} />
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
