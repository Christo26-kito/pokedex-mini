import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, PAGE_SIZE } from "../config.js";
import {
  getIdFromUrl,
  capitalize,
  getSpriteUrl,
} from "../utils.js";
import { SkeletonList } from "./Skeletons.jsx";

export default function PokemonList({ typeFilter }) {
  const [pokemons, setPokemons] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppending, setIsAppending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Reset the list whenever the type filter changes
  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      setPokemons([]);
      setOffset(0);

      try {
        const base = `${API_BASE_URL}/pokemon`;
        const url = typeFilter
          ? `${base}/?type=${typeFilter}&limit=${PAGE_SIZE}`
          : `${base}?limit=${PAGE_SIZE}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        if (isCurrent) {
          setPokemons(data.results);
          setHasMore(data.results.length === PAGE_SIZE);
        }
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCurrent = false;
    };
  }, [typeFilter]);

  async function loadMore() {
    setIsAppending(true);
    setError(null);
    try {
      const base = `${API_BASE_URL}/pokemon`;
      const url = typeFilter
        ? `${base}/?type=${typeFilter}&offset=${offset + PAGE_SIZE}&limit=${PAGE_SIZE}`
        : `${base}?offset=${offset + PAGE_SIZE}&limit=${PAGE_SIZE}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setPokemons((prev) => [...prev, ...data.results]);
      setOffset((o) => o + data.results.length);
      setHasMore(data.results.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAppending(false);
    }
  }

  if (isLoading) {
    return <SkeletonList />;
  }

  if (error && pokemons.length === 0) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  return (
    <>
      <ul className="pokemon-list">
        {pokemons.map((pokemon) => {
          const id = getIdFromUrl(pokemon.url);
          return (
            <li key={pokemon.name} className="pokemon-list-item">
              <Link
                to={`/pokemon/${pokemon.name}`}
                className="pokemon-link"
              >
                <img
                  className="pokemon-sprite"
                  src={getSpriteUrl(id)}
                  alt={pokemon.name}
                  width={48}
                  height={48}
                />
                <span className="pokemon-id">#{id.padStart(3, "0")}</span>
                <span className="pokemon-name">{capitalize(pokemon.name)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          className="btn btn-primary load-more"
          onClick={loadMore}
          disabled={isAppending}
        >
          {isAppending ? "Loading…" : `Load more (${PAGE_SIZE})`}
        </button>
      )}

      {error && pokemons.length > 0 && (
        <p className="status status-error">{error}</p>
      )}
    </>
  );
}
