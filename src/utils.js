import {
  API_BASE_URL,
  SPRITE_BASE_URL,
  TYPE_COLORS,
  ALL_TYPES,
} from "./config.js";

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

export function totalBase(stats) {
  return (stats ?? []).reduce((sum, s) => sum + s.base_stat, 0);
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

// Per-endpoint cache for /type/{name}: the raw JSON is fetched ONCE per type,
// then derived views (the Pokémon list + damage multipliers) share it.
const typeCache = {};

function fetchTypeRaw(type) {
  if (!typeCache[type]) {
    typeCache[type] = fetch(`${API_BASE_URL}/type/${type}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded with status ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        delete typeCache[type];
        throw err;
      });
  }
  return typeCache[type];
}

// Per-type full list (cached per type).
// IMPORTANT: PokeAPI ignores `?type=` on GET /pokemon — the only way to list
// every Pokémon of a type is GET /type/{name}, which returns { pokemon: [{
// slot, pokemon: {name, url} }] } ordered by Pokédex number.
export function fetchTypePokemon(type) {
  return fetchTypeRaw(type).then((data) =>
    data.pokemon.map((entry) => entry.pokemon)
  );
}

// Multiplier map: { attackingType: 0 | 0.5 | 2 } — how much damage this type
// TAKES from each attacking type (the defensive panel "weak/resist/immune").
export function fetchTypeMeta(type) {
  return fetchTypeRaw(type).then((data) => {
    const m = {};
    for (const t of ALL_TYPES) m[t] = 1;
    const rel = data.damage_relations ?? {};
    // PokeAPI keys: no_damage_from / half_damage_from / double_damage_from
    for (const g of ["no_damage_from", "half_damage_from", "double_damage_from"]) {
      for (const x of rel[g] ?? []) {
        m[x.name] = g === "no_damage_from" ? 0 : g === "half_damage_from" ? 0.5 : 2;
      }
    }
    return m;
  });
}

// Effective damage taken per attacking type for a Pokémon's type set
// (dual types multiply). Used for the "weak to / resists / immune" panel.
export function getWeaknesses(pokemonTypes) {
  return Promise.all(pokemonTypes.map(fetchTypeMeta)).then((metas) => {
    const groups = { weak: [], resist: [], immune: [] };
    for (const t of ALL_TYPES) {
      let m = 1;
      for (const meta of metas) m *= meta[t] ?? 1;
      if (m === 0) groups.immune.push({ type: t, mult: 0 });
      else if (m >= 4) groups.weak.push({ type: t, mult: 4 });
      else if (m === 2) groups.weak.push({ type: t, mult: 2 });
      else if (m === 0.5) groups.resist.push({ type: t, mult: 0.5 });
      else if (m === 0.25) groups.resist.push({ type: t, mult: 0.25 });
    }
    return groups;
  });
}

export function formatMult(m) {
  if (m === 4) return "×4";
  if (m === 2) return "×2";
  if (m === 0.5) return "½×";
  if (m === 0.25) return "¼×";
  if (m === 0) return "0×";
  return "×1";
}

// Friendly, self-explanatory multiplier wording for the matchup panel.
export function describeMult(m) {
  if (m === 4) return "4× damage";
  if (m === 2) return "2× damage";
  if (m === 0.5) return "½ damage";
  if (m === 0.25) return "¼ damage";
  if (m === 0) return "immune";
  return "no change";
}

// Cached full detail fetches — prev/next and back-nav are instant on revisit.
const detailCache = new Map();

export function fetchPokemonDetail(nameOrId) {
  const key = String(nameOrId).toLowerCase();
  if (detailCache.has(key)) return detailCache.get(key);
  const promise = fetch(`${API_BASE_URL}/pokemon/${nameOrId}`)
    .then((r) => {
      if (!r.ok) throw new Error(`No Pokémon named "${key}" — check the spelling.`);
      return r.json();
    })
    .catch((err) => {
      detailCache.delete(key);
      throw err;
    });
  detailCache.set(key, promise);
  if (detailCache.size > 15) {
    const oldest = detailCache.keys().next().value;
    detailCache.delete(oldest);
  }
  return promise;
}

// Evolution chain: returns { prev: {name,url} | null, next: ... | null }
// (first form before / after this species in its chain), or null if none.
const evoCache = {};

// Cached species (flavor, genus, etc.) — one fetch per species.
const speciesCache = {};

export function fetchSpecies(name) {
  const key = String(name).toLowerCase();
  if (!(key in speciesCache)) {
    speciesCache[key] = fetch(`${API_BASE_URL}/pokemon-species/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error(`No species "${key}"`);
        return r.json();
      })
      .catch((err) => {
        delete speciesCache[key];
        throw err;
      });
  }
  return speciesCache[key];
}

export function fetchEvolution(name) {
  const key = name.toLowerCase();
  if (!(key in evoCache)) {
    evoCache[key] = (async () => {
      const spRes = await fetch(`${API_BASE_URL}/pokemon-species/${key}`);
      if (!spRes.ok) return null;
      const sp = await spRes.json();
      if (!sp.evolution_chain?.url) return null;
      const chRes = await fetch(sp.evolution_chain.url);
      if (!chRes.ok) return null;
      const chain = await chRes.json();
      const root = chain.chain ?? chain; // chain is nested under { chain: ... }
      const flat = [];
      const walk = (node) => {
        flat.push(node);
        (node.evolves_to ?? []).forEach(walk);
      };
      walk(root);
      const idx = flat.findIndex((n) => n.species?.name === key);
      if (idx === -1) return null;
      const prev = idx > 0 ? flat[idx - 1].species : null;
      const next = flat[idx].evolves_to?.[0]?.species ?? null;
      if (!prev && !next) return null;
      return { prev, next };
    })().catch(() => {
      delete evoCache[key];
      return null;
    });
  }
  return evoCache[key];
}
