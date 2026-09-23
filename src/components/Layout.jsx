import { Outlet, Link, useLocation } from "react-router-dom";

function Tab({ to, label, icon }) {
  const location = useLocation();
  const isActive =
    to === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/pokemon")
      : location.pathname.startsWith(to);

  return (
    <Link to={to} className={`tab ${isActive ? "active" : ""}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title-link">
          <h1>PokéDex Mini</h1>
        </Link>
        <p className="app-subtitle">Browse, compare & catch Pokémon</p>
      </header>

      <nav className="tab-nav" aria-label="Primary">
        <Tab to="/" label="Pokédex" icon="📖" />
        <Tab to="/favorites" label="Favorites" icon="❤️" />
        <Tab to="/compare" label="Compare" icon="⚖️" />
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
