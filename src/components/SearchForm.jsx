import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPokemonIndex,
  getSpriteUrl,
  getIdFromUrl,
  randomFromIndex,
} from "../utils.js";
import { DiceIcon } from "./Icons.jsx";

const SUGGESTIONS = 6;

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(null);
  const [indexError, setIndexError] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPokemonIndex()
      .then((data) => setIndex(data))
      .catch(() => setIndexError("Couldn't load the Pokédex index."));
  }, []);

  const suggestions = useMemo(() => {
    if (!index || query.trim() === "") return [];
    const q = query.trim().toLowerCase();
    return index
      .filter((p) => p.name.startsWith(q))
      .slice(0, SUGGESTIONS);
  }, [index, query]);

  function go(name) {
    const clean = name.trim().toLowerCase();
    if (clean === "") {
      setError("Type a Pokémon name first.");
      return;
    }
    setError(null);
    setOpen(false);
    navigate(`/pokemon/${clean}`);
  }

  function handleRandom() {
    if (!index) return;
    const pick = randomFromIndex(index);
    go(pick.name);
  }

  return (
    <div className="search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="search-form"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a Pokémon…"
          className="search-input"
          aria-label="Search a Pokémon by name"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="ac-listbox"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="autocomplete" id="ac-listbox">
          {suggestions.map((p) => (
            <li
              key={p.name}
              onMouseDown={() => go(p.name)}
            >
              <img
                src={getSpriteUrl(getIdFromUrl(p.url))}
                alt=""
                width={28}
                height={28}
              />
              <span className="ac-name">{p.name}</span>
              <span className="ac-hint">Go</span>
            </li>
          ))}
        </ul>
      )}

      <div className="search-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleRandom}
          disabled={!index}
          aria-label="Pick a random Pokémon"
        >
          <DiceIcon />
          <span>Surprise me</span>
        </button>
      </div>

      {indexError && <p className="status status-error">{indexError}</p>}
      {error && <p className="status status-error">{error}</p>}
    </div>
  );
}
