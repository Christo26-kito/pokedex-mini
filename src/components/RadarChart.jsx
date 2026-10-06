import { STAT_NAMES, STAT_COLORS, totalBase } from "../utils.js";

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2 + 6;
const R = 76;
const LABELS = ["HP", "Atk", "Def", "Sp.A", "Sp.D", "Spd"];
const RINGS = [0.25, 0.5, 0.75, 1];

function point(i, frac) {
  const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const r = R * frac;
  return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
}

function ringPath(frac) {
  return Array.from({ length: 6 }, (_, i) => point(i, frac).join(",")).join(" ");
}

// Animated hexagon radar of the six base stats. Pure SVG, no dependencies.
export default function RadarChart({ stats }) {
  const vals = STAT_NAMES.map(
    (n) => stats.find((s) => s.stat.name === n)?.base_stat ?? 0
  );
  const maxV = Math.max(...vals, 1);
  const ringMax = Math.max(120, Math.ceil(maxV / 40) * 40);
  const total = totalBase(stats);

  const poly = vals
    .map((v, i) => point(i, Math.min(v, ringMax) / ringMax).join(","))
    .join(" ");

  return (
    <div className="radar" role="img" aria-label={`Radar chart of base stats, total ${total}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} aria-hidden="true">
        {RINGS.map((f) => (
          <polygon key={f} points={ringPath(f)} className="radar-ring" />
        ))}
        {LABELS.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} className="radar-axis" />;
        })}
        <polygon points={poly} className="radar-poly" />
        {vals.map((v, i) => {
          const [x, y] = point(i, Math.min(v, ringMax) / ringMax);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.2}
              className="radar-dot"
              style={{ fill: STAT_COLORS[STAT_NAMES[i]] }}
            />
          );
        })}
        {LABELS.map((l, i) => {
          const [x, y] = point(i, 1.19);
          return (
            <text key={l} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">
              {l}
            </text>
          );
        })}
      </svg>
      <div className="radar-total">
        <b>{total}</b>
        total
      </div>
    </div>
  );
}
