import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPokemonIndex,
  getSpriteUrl,
  getIdFromUrl,
} from "../utils.js";
import { SearchIcon } from "./Icons.jsx";
import FadeImg from "./FadeImg.jsx";

const SUGGESTIONS = 8;

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(null);
  const [indexError, setIndexError] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchPokemonIndex()
      .then((data) => setIndex(data))
      .catch(() => setIndexError("Couldn't load the Pokédex index."));
  }, []);

  const suggestions = useMemo(() => {
    if (!index || query.trim() === "") return [];
    const q = query.trim().toLowerCase();
    // prefix match first (snappy feel), then falls back to "contains"
    const prefix = index.filter((p) => p.name.startsWith(q));
    const contains =
      prefix.length < SUGGESTIONS
        ? index.filter((p) => !p.name.startsWith(q) && p.name.includes(q))
        : [];
    return [...prefix, ...contains].slice(0, SUGGESTIONS);
  }, [index, query]);

  function go(name) {
    const clean = name.trim().toLowerCase();
    if (clean === "") {
      setError("Type a Pokémon name first.");
      return;
    }
    setError(null);
    setOpen(false);
    setQuery("");
    navigate(`/pokemon/${clean}`);
  }

  function onKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(suggestions[active].name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const listOpen = open && suggestions.length > 0;

  return (
    <div className="search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(listOpen ? suggestions[active].name : query);
        }}
        className="search-form"
      >
        <span className="search-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Search a Pokémon…"
          className="search-input"
          aria-label="Search a Pokémon by name"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls="ac-listbox"
          aria-activedescendant={
            listOpen ? `ac-option-${active}` : undefined
          }
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {listOpen && (
        <ul className="autocomplete" id="ac-listbox" role="listbox">
          {suggestions.map((p, i) => (
            <li
              key={p.name}
              id={`ac-option-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "ac-active" : ""}
              onMouseDown={() => go(p.name)}
              onMouseEnter={() => setActive(i)}
            >
              <FadeImg
                src={getSpriteUrl(getIdFromUrl(p.url))}
                alt=""
                width={30}
                height={30}
                pixelated
              />
              <span className="ac-name">{p.name}</span>
              <span className="ac-hint">#{getIdFromUrl(p.url)}</span>
            </li>
          ))}
        </ul>
      )}

      {indexError && <p className="status status-error">{indexError}</p>}
      {error && <p className="status status-error">{error}</p>}
    </div>
  );
}
