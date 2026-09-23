import { useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
} from "../config.js";
import {
  fetchPokemonIndex,
  capitalize,
  getIdFromUrl,
  getSpriteUrl,
  STAT_COLORS,
  STAT_NAMES,
} from "../utils.js";
import TypeBadge from "../components/TypeBadge.jsx";
import { SkeletonDetail } from "../components/Skeletons.jsx";

const PICKER_LIMIT = 151; // gen 1 picks keep the dropdowns snappy

function usePokemon(name) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name) {
      setData(null);
      return;
    }
    let isCurrent = true;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/pokemon/${name}`)
      .then((r) => {
        if (!r.ok) throw new Error(`No Pokémon named "${name}"`);
        return r.json();
      })
      .then((d) => isCurrent && setData(d))
      .catch((e) => isCurrent && setError(e.message))
      .finally(() => isCurrent && setLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [name]);

  return { data, loading, error };
}

export default function ComparePage() {
  const [options, setOptions] = useState([]);
  const [a, setA] = useState("charmander");
  const [b, setB] = useState("squirtle");

  useEffect(() => {
    fetchPokemonIndex()
      .then((index) => setOptions(index.slice(0, PICKER_LIMIT)))
      .catch(() => {});
  }, []);

  const pa = usePokemon(a);
  const pb = usePokemon(b);

  const statMap = useMemo(() => {
    const map = {};
    (pa.data?.stats ?? []).forEach((s) => (map[s.stat.name] = s.base_stat));
    return map;
  }, [pa.data]);

  const statMapB = useMemo(() => {
    const map = {};
    (pb.data?.stats ?? []).forEach((s) => (map[s.stat.name] = s.base_stat));
    return map;
  }, [pb.data]);

  function statFor(map, name) {
    return map[name] ?? 0;
  }

  if (pa.error) return <p className="status status-error">{pa.error}</p>;
  if (pb.error) return <p className="status status-error">{pb.error}</p>;

  const loading = pa.loading || pb.loading || !pa.data || !pb.data;

  if (loading) return <SkeletonDetail />;

  return (
    <div className="compare-page">
      <div className="compare-card">
        <div className="compare-pick">
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            aria-label="First Pokémon"
          >
            {options.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            aria-label="Second Pokémon"
          >
            {options.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div className="compare-head" style={{ flexDirection: "column" }}>
            <img
              src={
                pa.data.sprites.other["official-artwork"].front_default
              }
              alt={a}
              width={80}
              height={80}
            />
            <h3>{capitalize(a)}</h3>
            <div className="pokemon-types" style={{ margin: 4 }}>
              {pa.data.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
          </div>

          <div className="compare-vs">VS</div>

          <div className="compare-head" style={{ flexDirection: "column" }}>
            <img
              src={
                pb.data.sprites.other["official-artwork"].front_default
              }
              alt={b}
              width={80}
              height={80}
            />
            <h3>{capitalize(b)}</h3>
            <div className="pokemon-types" style={{ margin: 4 }}>
              {pb.data.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {STAT_NAMES.map((statName) => {
            const av = statFor(statMap, statName);
            const bv = statFor(statMapB, statName);
            const color = STAT_COLORS[statName];
            return (
              <div className="compare-bar" key={statName}>
                <div className="compare-fill">
                  <div
                    className="fill left"
                    style={{
                      width: `${Math.min(50, (av / Math.max(av, bv)) * 50)}%`,
                      background: a === b ? color : color,
                      opacity: av >= bv ? 1 : 0.45,
                    }}
                  />
                </div>
                <span className="stat-name">
                  {statName.replace("-", " ")}
                </span>
                <div className="compare-fill">
                  <div
                    className="fill right"
                    style={{
                      width: `${Math.min(50, (bv / Math.max(av, bv)) * 50)}%`,
                      background: color,
                      opacity: bv >= av ? 1 : 0.45,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className="compare-note">
            Brighter side = higher stat. {a === b ? "Picking the same two…" : "Same stat? Draw!"}
          </p>
        </div>
      </div>
    </div>
  );
}
