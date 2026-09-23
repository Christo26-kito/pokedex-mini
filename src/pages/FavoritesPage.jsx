import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../FavoritesContext.jsx";
import {
  capitalize,
  fetchPokemonIndex,
  getIdFromUrl,
  getSpriteUrl,
} from "../utils.js";

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

  return (
    <div className="favorites-page">
      {favorites.length === 0 ? (
        <div className="empty">
          <p>No favorites yet.</p>
          <p>
            Open a Pokémon and tap <strong>♡ Favorite</strong> to build your
            team.
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Pokédex
          </Link>
        </div>
      ) : (
        <>
          <h2 style={{ textAlign: "center", marginTop: 8 }}>
            Your team ({favorites.length})
          </h2>
          <ul className="fav-list">
            {favorites.map((name) => {
              const count = caught[name] || 0;
              const sprite = spriteFor(name);
              return (
                <li key={name} className="fav-card">
                  {sprite ? (
                    <img src={sprite} alt={name} width={44} height={44} />
                  ) : (
                    <div
                      className="skeleton-block"
                      style={{ width: 44, height: 44 }}
                    />
                  )}
                  <Link className="fav-name" to={`/pokemon/${name}`}>
                    {capitalize(name)}
                    {count > 0 && (
                      <span
                        style={{ color: "var(--color-accent)" }}
                      >
                        {" "}
                        · caught {count}×
                      </span>
                    )}
                  </Link>
                  <button
                    className="fav-remove"
                    onClick={() => removeFavorite(name)}
                    aria-label={`Remove ${name} from favorites`}
                  >
                    ✕
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
