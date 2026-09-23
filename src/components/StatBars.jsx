import { useEffect, useState } from "react";
import { STAT_COLORS, statPercent } from "../utils.js";

function StatBar({ stat }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(statPercent(stat.base_stat)));
    return () => cancelAnimationFrame(frame);
  }, [stat]);

  return (
    <div className="stat-row">
      <span className="stat-name">{stat.stat.name.replace("-", " ")}</span>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{
            width: `${width}%`,
            background: STAT_COLORS[stat.stat.name] ?? "#f97316",
          }}
        />
      </div>
      <span className="stat-value">{stat.base_stat}</span>
    </div>
  );
}

export default function StatBars({ stats }) {
  return (
    <ul className="stat-list">
      {stats.map((s) => (
        <StatBar key={s.stat.name} stat={s} />
      ))}
    </ul>
  );
}
