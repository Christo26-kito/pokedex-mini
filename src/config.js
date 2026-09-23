export const API_BASE_URL = "https://pokeapi.co/api/v2";
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Per-type colors (official Pokémon palette) for chips & accents
export const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#C8A028",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export const ALL_TYPES = Object.keys(TYPE_COLORS);

// Standard Pokédex number ranges per generation (accurate, well-known data).
// Used to slice the global list / filter a type list by generation.
export const GENERATIONS = [
  { key: 1, label: "Gen 1", start: 1, end: 151 },
  { key: 2, label: "Gen 2", start: 152, end: 251 },
  { key: 3, label: "Gen 3", start: 252, end: 386 },
  { key: 4, label: "Gen 4", start: 387, end: 493 },
  { key: 5, label: "Gen 5", start: 494, end: 649 },
  { key: 6, label: "Gen 6", start: 650, end: 721 },
  { key: 7, label: "Gen 7", start: 722, end: 809 },
  { key: 8, label: "Gen 8", start: 810, end: 905 },
  { key: 9, label: "Gen 9", start: 906, end: 1025 },
  { key: 10, label: "Gen 10", start: 1026, end: 1351 },
];

export function inGeneration(id, genKey) {
  if (!genKey) return true;
  const g = GENERATIONS.find((x) => x.key === genKey);
  if (!g) return true;
  return id >= g.start && id <= g.end;
}

export const PAGE_SIZE = 20;
// How many cards "Show more" reveals at a time in the grid
export const VISIBLE_STEP = 12;
