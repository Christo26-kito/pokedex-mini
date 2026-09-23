import { API_BASE_URL, SPRITE_BASE_URL, TYPE_COLORS } from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

export function getTypeColor(type) {
  return TYPE_COLORS[type] ?? "#A8A878";
}

// Types whose background is light enough to need dark text
const LIGHT_TYPE_TEXT = new Set([
  "normal", "electric", "ice", "bug", "steel", "fairy", "rock", "ground",
]);

export function typeTextColor(type) {
  return LIGHT_TYPE_TEXT.has(type) ? "#1C1917" : "#FFFFFF";
}

// Height comes in decimetres, weight in decigrams
export function formatHeight(decimeters) {
  return `${(decimeters / 10).toFixed(1)} m`;
}

export function formatWeight(decigrams) {
  return `${(decigrams / 10).toFixed(1)} kg`;
}

export const STAT_COLORS = {
  hp: "#EF4444",
  attack: "#F97316",
  defense: "#84CC16",
  "special-attack": "#3B82F6",
  "special-defense": "#8B5CF6",
  speed: "#EC4899",
};

export const STAT_NAMES = Object.keys(STAT_COLORS);

export function statPercent(stat) {
  return Math.min(100, (stat / 200) * 100);
}

// Full Pokédex index ({name, url} in ID order), fetched once and cached
// Powers autocomplete, random, compare and favorites — one shared request.
let indexCache = null;

export function fetchPokemonIndex() {
  if (!indexCache) {
    indexCache = fetch(`${API_BASE_URL}/pokemon?limit=100000`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded with status ${r.status}`);
        return r.json();
      })
      .then((data) => data.results)
      .catch((err) => {
        indexCache = null;
        throw err;
      });
  }
  return indexCache;
}

export function randomFromIndex(index) {
  return index[Math.floor(Math.random() * index.length)];
}

// Per-type full list (cached per type).
// IMPORTANT: PokeAPI ignores `?type=` on GET /pokemon — the only way to list
// every Pokémon of a type is GET /type/{name}, which returns { pokemon: [{
// slot, pokemon: {name, url} }] } ordered by Pokédex number.
const typeListCache = {};

export function fetchTypePokemon(type) {
  if (!typeListCache[type]) {
    typeListCache[type] = fetch(`${API_BASE_URL}/type/${type}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded with status ${r.status}`);
        return r.json();
      })
      .then((data) => data.pokemon.map((entry) => entry.pokemon))
      .catch((err) => {
        delete typeListCache[type];
        throw err;
      });
  }
  return typeListCache[type];
}
