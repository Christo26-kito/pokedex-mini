import { getTypeColor, typeTextColor, capitalize } from "../utils.js";

export default function TypeBadge({ type }) {
  return (
    <span
      className="type-badge"
      style={{
        background: getTypeColor(type),
        color: typeTextColor(type),
      }}
    >
      {capitalize(type)}
    </span>
  );
}
