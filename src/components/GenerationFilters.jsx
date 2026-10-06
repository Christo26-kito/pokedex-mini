import { GENERATIONS } from "../config.js";

export default function GenerationFilters({ value, onChange }) {
  return (
    <div className="chip-scroll" role="group" aria-label="Filter by generation">
      <button
        className={`type-chip ${value ? "" : "active"}`}
        style={!value ? { background: "var(--color-chip-active)", color: "var(--color-chip-active-text)" } : {}}
        onClick={() => onChange(null)}
        aria-pressed={!value}
      >
        All gens
      </button>
      {GENERATIONS.map((g) => (
        <button
          key={g.key}
          className={`type-chip ${value === g.key ? "active" : ""}`}
          style={value === g.key ? { background: "var(--color-chip-active)", color: "var(--color-chip-active-text)" } : {}}
          onClick={() => onChange(value === g.key ? null : g.key)}
          aria-pressed={value === g.key}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
