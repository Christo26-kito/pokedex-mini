import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../FavoritesContext.jsx";
import {
  capitalize,
  fetchPokemonIndex,
  getIdFromUrl,
  getSpriteUrl,
} from "../utils.js";
import FadeImg from "../components/FadeImg.jsx";
import { XIcon, PokeballIcon } from "../components/Icons.jsx";

export default function FavoritesPage() {
  const { favorites, removeFavorite, caught } = useFavorites();
  // name -> pokedex id, resolved once from the shared index cache
  const [idByName, setIdByName] = useState(null);

  useEffect(() => {
    fetchPokemonIndex()
      .then((index) =>
        setIdByName(
          Object.fromEntries(
            index.map((p) => [p.name, Number(getIdFromUrl(p.url))])
          )
        )
      )
      .catch(() => setIdByName({}));
  }, []);

  function spriteFor(name) {
    const id = idByName?.[name];
    return id ? getSpriteUrl(id) : null;
  }

  const totalCaught = Object.values(caught).reduce((s, n) => s + n, 0);

  return (
    <div className="favorites-page page-enter">
      {favorites.length === 0 ? (
        <div className="empty">
          <div className="empty-art" aria-hidden="true">
            <PokeballIcon width={52} height={52} />
          </div>
          <p><strong>No favorites yet.</strong></p>
          <p>
            Open a Pokémon and tap <strong>Favorite</strong> to build your
            team.
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Pokédex
          </Link>
          {totalCaught > 0 && (
            <p className="empty-aside">
              You&apos;ve caught <strong>{totalCaught}</strong> Pokémon total —
              favorites are where your best ones live.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="fav-header">
            <h2>Your team</h2>
            <span className="fav-count">{favorites.length}</span>
          </div>
          {totalCaught > 0 && (
            <p className="fav-subtotal">{totalCaught} caught total</p>
          )}
          <ul className="fav-list">
            {favorites.map((name, i) => {
              const count = caught[name] || 0;
              const sprite = spriteFor(name);
              return (
                <li key={name} className="fav-card" style={{ animationDelay: `${i * 40}ms` }}>
                  {sprite ? (
                    <FadeImg
                      src={sprite}
                      alt={name}
                      width={48}
                      height={48}
                      pixelated
                    />
                  ) : (
                    <div
                      className="skeleton-block"
                      style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                  )}
                  <div className="fav-body">
                    <Link className="fav-name" to={`/pokemon/${name}`}>
                      {capitalize(name)}
                    </Link>
                    {count > 0 && (
                      <span className="fav-caught">caught {count}×</span>
                    )}
                  </div>
                  <button
                    className="fav-remove"
                    onClick={() => removeFavorite(name)}
                    aria-label={`Remove ${name} from favorites`}
                  >
                    <XIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
