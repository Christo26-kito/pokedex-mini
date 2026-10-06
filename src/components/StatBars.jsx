import { useEffect, useState } from "react";
import { STAT_COLORS, statPercent } from "../utils.js";

function StatBar({ stat, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const target = statPercent(stat.base_stat);
    // stagger the fills slightly; cached data still animates smoothly
    const t = setTimeout(() => setWidth(target), 80 + delay);
    return () => clearTimeout(t);
  }, [stat, delay]);

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

export default function StatBars({ stats, animated = true }) {
  return (
    <ul className="stat-list">
      {stats.map((s, i) => (
        <StatBar key={s.stat.name} stat={s} delay={animated ? i * 70 : 0} />
      ))}
    </ul>
  );
}
