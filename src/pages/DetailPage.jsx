import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import {
  capitalize,
  formatHeight,
  formatWeight,
} from "../utils.js";
import StatBars from "../components/StatBars.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import { SkeletonDetail } from "../components/Skeletons.jsx";
import { useFavorites, showToast } from "../FavoritesContext.jsx";

function DetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    caught,
    catchPokemon,
  } = useFavorites();

  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);

        if (!response.ok) {
          throw new Error(`No Pokémon named "${name}" — check the spelling.`);
        }

        const data = await response.json();

        if (isCurrent) {
          setPokemon(data);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  const id = pokemon ? Number(pokemon.id) : null;

  function handleCatch() {
    catchPokemon(name);
    showToast(`Caught ${capitalize(name)}! 🎉`);
  }

  function toggleFavorite() {
    if (isFavorite(name)) {
      removeFavorite(name);
      showToast(`${capitalize(name)} removed from favorites`);
    } else {
      addFavorite(name);
      showToast(`${capitalize(name)} added to favorites ❤️`);
    }
  }

  if (isLoading) return <SkeletonDetail />;

  if (error) {
    return (
      <div className="status status-error">
        <p>{error}</p>
        <Link to="/" className="back-link">← Back to list</Link>
      </div>
    );
  }

  const favorite = isFavorite(name);
  const caughtCount = caught[name] || 0;

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Back to list</Link>

      <div className="detail-hero">
        <img
          src={pokemon.sprites.other["official-artwork"].front_default}
          alt={pokemon.name}
          width={140}
          height={140}
        />
        <h2>{capitalize(pokemon.name)}</h2>

        <div className="pokemon-types">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>

        <div className="detail-meta">
          <div className="meta-pill"><span>#{id}</span> dex</div>
          <div className="meta-pill"><span>{formatHeight(pokemon.height)}</span> tall</div>
          <div className="meta-pill"><span>{formatWeight(pokemon.weight)}</span> heavy</div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            className={`btn ${favorite ? "btn-primary" : ""}`}
            onClick={toggleFavorite}
            aria-pressed={favorite}
          >
            {favorite ? "♥ Favorited" : "♡ Favorite"}
          </button>
          <button className="btn catch-btn" onClick={handleCatch}>
            Catch
          </button>
        </div>

        {caughtCount > 0 && (
          <p className="catch-count">Caught {caughtCount}×</p>
        )}
      </div>

      <StatBars stats={pokemon.stats} />

      {pokemon.abilities.length > 0 && (
        <div className="detail-meta" style={{ marginTop: 18 }}>
          {pokemon.abilities.map((a) => (
            <div key={a.ability.name} className="meta-pill">
              {capitalize(a.ability.name)}
            </div>
          ))}
        </div>
      )}

      <div className="detail-nav">
        <button
          className="btn btn-ghost"
          onClick={() =>
            id > 1 ? navigate(`/pokemon/${id - 1}`) : navigate("/")
          }
        >
          ← Prev
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            id < 1025 ? navigate(`/pokemon/${id + 1}`) : navigate("/")
          }
          disabled={id >= 1025}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default DetailPage;
