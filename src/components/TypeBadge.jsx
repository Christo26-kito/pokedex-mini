import { getTypeColor, typeTextColor, capitalize } from "../utils.js";

export default function TypeBadge({ type, small = false, mult = null, title = null }) {
  return (
    <span
      className={`type-badge ${small ? "type-badge-sm" : ""}`}
      style={{
        background: getTypeColor(type),
        color: typeTextColor(type),
      }}
      title={title || undefined}
    >
      {capitalize(type)}
      {mult ? <span className="type-mult">{mult}</span> : null}
    </span>
  );
}
