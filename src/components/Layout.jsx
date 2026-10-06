import { useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext.jsx";
import {
  BookOpenIcon,
  HeartIcon,
  CompareIcon,
  MoonIcon,
  SunIcon,
  DiceIcon,
  PokeballLogo,
} from "./Icons.jsx";
import { randomFromIndex, fetchPokemonIndex, capitalize } from "../utils.js";
import { showToast } from "../FavoritesContext.jsx";

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

function RandomFab() {
  function onClick() {
    fetchPokemonIndex()
      .then((index) => {
        const pick = randomFromIndex(index);
        showToast(`Random: ${capitalize(pick.name)}`);
        window.location.hash = `#/pokemon/${pick.name}`;
      })
      .catch(() => {});
  }
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label="Jump to a random Pokémon"
      title="Jump to a random Pokémon"
    >
      <DiceIcon />
      <span>Random</span>
    </button>
  );
}

function Tab({ to, label, Icon, exact = false }) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : to === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/pokemon")
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`tab ${isActive ? "active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon filled={isActive} />
      <span>{label}</span>
    </Link>
  );
}

function Layout() {
  const location = useLocation();
  const firstRef = useRef(true);

  // Scroll to top on route change — snappy when jumping between pages
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <Link to="/" className="app-title-link">
            <span className="pokeball-logo" aria-hidden="true">
              <PokeballLogo />
            </span>
            <h1>PokéDex&nbsp;Mini</h1>
          </Link>
          <ThemeToggle />
        </div>
        <p className="app-subtitle">Browse, compare &amp; catch Pokémon</p>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <RandomFab />

      <nav className="tab-nav" aria-label="Primary">
        <Tab to="/" label="Pokédex" Icon={BookOpenIcon} />
        <Tab to="/favorites" label="Favorites" Icon={HeartIcon} />
        <Tab to="/compare" label="Compare" Icon={CompareIcon} />
      </nav>

      <footer className="app-footer">
        <p>Built with the PokéAPI · data © Niantic · a Mobile Web Dev project</p>
      </footer>
    </div>
  );
}

export default Layout;
