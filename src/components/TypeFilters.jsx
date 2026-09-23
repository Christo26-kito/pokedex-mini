import { ALL_TYPES } from "../config.js";
import { getTypeColor, typeTextColor } from "../utils.js";

export default function TypeFilters({ value, onChange }) {
  return (
    <div className="type-filters" role="group" aria-label="Filter by type">
      <button
        className={`type-chip ${value ? "" : "active"}`}
        style={!value ? { background: "#57534e", color: "#fff" } : {}}
        onClick={() => onChange(null)}
        aria-pressed={!value}
      >
        All
      </button>
      {ALL_TYPES.map((t) => (
        <button
          key={t}
          className={`type-chip ${value === t ? "active" : ""}`}
          style={value === t ? { background: getTypeColor(t), color: typeTextColor(t) } : {}}
          onClick={() => onChange(value === t ? null : t)}
          aria-pressed={value === t}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
