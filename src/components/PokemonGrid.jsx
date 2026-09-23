import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GENERATIONS,
  VISIBLE_STEP,
  inGeneration,
} from "../config.js";
import {
  getIdFromUrl,
  capitalize,
  getSpriteUrl,
  fetchPokemonIndex,
  fetchTypePokemon,
} from "../utils.js";
import { SkeletonGrid } from "./Skeletons.jsx";

export default function PokemonGrid({ typeFilter, genFilter }) {
  const [all, setAll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(VISIBLE_STEP);

  // Load the right source: whole Pokédex (All) or a single type's list.
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setVisible(VISIBLE_STEP);

    const source = typeFilter ? fetchTypePokemon(typeFilter) : fetchPokemonIndex();

    source
      .then((data) => isCurrent && setAll(data))
      .catch((err) => isCurrent && setError(err.message))
      .finally(() => isCurrent && setIsLoading(false));

    return () => {
      isCurrent = false;
    };
  }, [typeFilter]);

  // Apply the generation filter client-side (type lists already respect it
  // only via ID slicing, which is exactly what inGeneration does).
  const filtered = useMemo(() => {
    if (!all) return [];
    if (!genFilter) return all;
    return all.filter((p) => inGeneration(Number(getIdFromUrl(p.url)), genFilter));
  }, [all, genFilter]);

  const shown = filtered.slice(0, visible);
  const total = filtered.length;

  if (isLoading) return <SkeletonGrid />;

  if (error) {
    return (
      <p className="status status-error">
        Couldn't load the list: {error}
      </p>
    );
  }

  if (total === 0) {
    return (
      <p className="status">
        No {capitalize(typeFilter || "")} Pokémon in {GENERATIONS.find((g) => g.key === genFilter)?.label}. Try another combination.
      </p>
    );
  }

  const filterLabel = typeFilter ? capitalize(typeFilter) : "All types";
  const genLabel = genFilter ? GENERATIONS.find((g) => g.key === genFilter).label : null;

  return (
    <>
      <p className="list-counter" aria-live="polite">
        Showing <strong>{shown.length}</strong> of <strong>{total}</strong> · {filterLabel}
        {genLabel ? ` · ${genLabel}` : ""}
      </p>

      <ul className="pokemon-grid">
        {shown.map((pokemon, i) => {
          const id = getIdFromUrl(pokemon.url);
          return (
            <li
              key={pokemon.name}
              className="grid-card"
              style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
            >
              <Link to={`/pokemon/${pokemon.name}`} className="grid-link">
                <div className="grid-sprite">
                  <img
                    src={getSpriteUrl(id)}
                    alt={pokemon.name}
                    width={72}
                    height={72}
                    loading="lazy"
                  />
                </div>
                <div className="grid-info">
                  <span className="grid-id">#{id.padStart(4, "0")}</span>
                  <span className="grid-name">{capitalize(pokemon.name)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {visible < total && (
        <button
          className="btn btn-primary load-more"
          onClick={() => setVisible((v) => v + VISIBLE_STEP)}
        >
          Show {Math.min(VISIBLE_STEP, total - visible)} more
        </button>
      )}
    </>
  );
}
