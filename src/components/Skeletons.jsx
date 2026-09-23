export function SkeletonGrid({ count = 9 }) {
  return (
    <div className="pokemon-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div
            className="skeleton-block"
            style={{ width: "100%", height: 110, borderRadius: 14 }}
          />
          <div className="skeleton-block" style={{ width: "60%", height: 12, alignSelf: "center" }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return SkeletonGrid({ count });
}

export function SkeletonDetail() {
  return (
    <div className="list-loading" aria-hidden="true">
      <div
        className="skeleton-card"
        style={{ flexDirection: "column", alignItems: "center", gap: 14 }}
      >
        <div
          className="skeleton-block"
          style={{ width: 140, height: 140, borderRadius: 20 }}
        />
        <div className="skeleton-block" style={{ width: 120, height: 20 }} />
        <div className="skeleton-block" style={{ width: "80%", height: 14 }} />
      </div>
    </div>
  );
}
