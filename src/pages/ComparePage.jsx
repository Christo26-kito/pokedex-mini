import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config.js";
import {
  fetchPokemonIndex,
  capitalize,
  STAT_COLORS,
  STAT_NAMES,
  totalBase,
} from "../utils.js";
import TypeBadge from "../components/TypeBadge.jsx";
import FadeImg from "../components/FadeImg.jsx";
import { SkeletonDetail } from "../components/Skeletons.jsx";
import { SwapIcon, DiceIcon } from "../components/Icons.jsx";

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

  function statFor(map, n) {
    return map[n] ?? 0;
  }

  function swap() {
    setA(b);
    setB(a);
  }

  function randomPick() {
    if (!options.length) return;
    const i = Math.floor(Math.random() * options.length);
    let j = Math.floor(Math.random() * options.length);
    if (j === i) j = (j + 1) % options.length;
    setA(options[i].name);
    setB(options[j].name);
  }

  if (pa.error) return <p className="status status-error">{pa.error}</p>;
  if (pb.error) return <p className="status status-error">{pb.error}</p>;

  const loading = pa.loading || pb.loading || !pa.data || !pb.data;

  if (loading) return <SkeletonDetail />;

  const totalA = totalBase(pa.data.stats);
  const totalB = totalBase(pb.data.stats);
  const winner = totalA === totalB ? "tie" : totalA > totalB ? "a" : "b";

  return (
    <div className="compare-page page-enter">
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
          <button
            className="btn compare-swap"
            onClick={swap}
            aria-label="Swap the two Pokémon"
            title="Swap"
          >
            <SwapIcon />
          </button>
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

        <button className="btn btn-ghost compare-random" onClick={randomPick}>
          <DiceIcon />
          <span>Pick random</span>
        </button>

        <div className="compare-arena">
          <div
            className={`compare-head ${winner === "a" ? "winner" : ""}`}
            style={{ flexDirection: "column" }}
          >
            <FadeImg
              src={pa.data.sprites.other["official-artwork"]?.front_default}
              alt={a}
              width={80}
              height={80}
            />
            <h3>{capitalize(a)}</h3>
            <div className="pokemon-types" style={{ margin: 4 }}>
              {pa.data.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} small />
              ))}
            </div>
            <span className="compare-total">
              <b>{totalA}</b> total
            </span>
            {winner === "a" && <span className="compare-crown">Highest total</span>}
          </div>

          <div className="compare-vs">VS</div>

          <div
            className={`compare-head ${winner === "b" ? "winner" : ""}`}
            style={{ flexDirection: "column" }}
          >
            <FadeImg
              src={pb.data.sprites.other["official-artwork"]?.front_default}
              alt={b}
              width={80}
              height={80}
            />
            <h3>{capitalize(b)}</h3>
            <div className="pokemon-types" style={{ margin: 4 }}>
              {pb.data.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} small />
              ))}
            </div>
            <span className="compare-total">
              <b>{totalB}</b> total
            </span>
            {winner === "b" && <span className="compare-crown">Highest total</span>}
          </div>
        </div>

        <div className="compare-stats">
          {STAT_NAMES.map((statName, i) => {
            const av = statFor(statMap, statName);
            const bv = statFor(statMapB, statName);
            const color = STAT_COLORS[statName];
            return (
              <div
                className="compare-bar"
                key={statName}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="compare-fill">
                  <div
                    className="fill left"
                    style={{
                      width: `${Math.min(50, (av / Math.max(av, bv)) * 50)}%`,
                      background: color,
                      opacity: av >= bv ? 1 : 0.45,
                    }}
                  />
                </div>
                <span className="stat-name">{statName.replace("-", " ")}</span>
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
            Brighter side = higher stat.{" "}
            {a === b
              ? "Picking the same two…"
              : winner === "tie"
                ? "Dead even — draw!"
                : "Higher total takes the crown."}
          </p>
        </div>
      </div>
    </div>
  );
}
