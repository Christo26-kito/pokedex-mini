import { useState, useEffect, useMemo, useRef } from "react";
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
import FadeImg from "./FadeImg.jsx";
import { GridIcon, ListIcon } from "./Icons.jsx";
import { usePersistentState } from "../hooks.js";

function GridCard({ pokemon, id, delay }) {
  return (
    <li className="grid-card" style={{ animationDelay: `${delay}ms` }}>
      <Link to={`/pokemon/${pokemon.name}`} className="grid-link">
        <div className="grid-sprite">
          <FadeImg
            src={getSpriteUrl(id)}
            alt={pokemon.name}
            width={72}
            height={72}
            pixelated
            loading="lazy"
          />
        </div>
        <div className="grid-info">
          <span className="grid-id">#{String(id).padStart(4, "0")}</span>
          <span className="grid-name">{capitalize(pokemon.name)}</span>
        </div>
      </Link>
    </li>
  );
}

function RowCard({ pokemon, id }) {
  return (
    <li className="grid-card row-card" style={{ animationDelay: "0ms" }}>
      <Link to={`/pokemon/${pokemon.name}`} className="row-link">
        <div className="row-sprite">
          <FadeImg
            src={getSpriteUrl(id)}
            alt={pokemon.name}
            width={56}
            height={56}
            pixelated
            loading="lazy"
          />
        </div>
        <div className="row-body">
          <span className="row-id">#{String(id).padStart(4, "0")}</span>
          <span className="row-name">{capitalize(pokemon.name)}</span>
        </div>
        <span className="row-arrow" aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

export default function PokemonGrid({ typeFilter, genFilter }) {
  const [all, setAll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(VISIBLE_STEP);
  const [view, setView] = usePersistentState("pokedex-view", "grid");

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

  // Apply the generation filter client-side.
  const filtered = useMemo(() => {
    if (!all) return [];
    if (!genFilter) return all;
    return all.filter((p) => inGeneration(Number(getIdFromUrl(p.url)), genFilter));
  }, [all, genFilter]);

  const shown = filtered.slice(0, visible);
  const total = filtered.length;

  // Auto-load the next batch when the sentinel nears the viewport (still
  // honors "Show more" button as a fallback).
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current || visible >= total || isLoading || error) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(total, v + VISIBLE_STEP));
        }
      },
      { rootMargin: "140px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, total, isLoading, error]);

  if (isLoading) return <SkeletonGrid />;

  if (error) {
    return (
      <div className="status">
        <p className="status-error">Couldn't load the list: {error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <p className="status">
        No {capitalize(typeFilter || "")} Pokémon in{" "}
        {GENERATIONS.find((g) => g.key === genFilter)?.label}. Try another
        combination.
      </p>
    );
  }

  const filterLabel = typeFilter ? capitalize(typeFilter) : "All types";
  const genLabel = genFilter
    ? GENERATIONS.find((g) => g.key === genFilter).label
    : null;

  return (
    <>
      <div className="list-toolbar">
        <p className="list-counter" aria-live="polite">
          Showing <strong>{shown.length}</strong> of <strong>{total}</strong>
          {" · "}{filterLabel}
          {genLabel ? ` · ${genLabel}` : ""}
        </p>
        <div className="view-toggle" role="group" aria-label="Layout">
          <button
            className={`view-btn ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <GridIcon />
          </button>
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <ul className="pokemon-grid">
          {shown.map((pokemon) => (
            <GridCard
              key={pokemon.name}
              pokemon={pokemon}
              id={getIdFromUrl(pokemon.url)}
              delay={0}
            />
          ))}
        </ul>
      ) : (
        <ul className="pokemon-list">
          {shown.map((pokemon) => (
            <RowCard
              key={pokemon.name}
              pokemon={pokemon}
              id={getIdFromUrl(pokemon.url)}
            />
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="load-sentinel" aria-hidden="true" />

      {visible < total && (
        <button
          className="btn btn-primary load-more"
          onClick={() => setVisible((v) => Math.min(total, v + VISIBLE_STEP))}
        >
          Show {Math.min(VISIBLE_STEP, total - visible)} more
        </button>
      )}
    </>
  );
}
