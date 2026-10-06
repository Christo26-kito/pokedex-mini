export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="pokemon-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i} style={{ animationDelay: `${i * 40}ms` }}>
          <div
            className="skeleton-block skeleton-sprite"
            style={{ width: 72, height: 72, borderRadius: "50%" }}
          />
          <div className="skeleton-block" style={{ width: "60%", height: 12 }} />
          <div className="skeleton-block" style={{ width: "40%", height: 10 }} />
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
        className="skeleton-card detail-skeleton"
        style={{ flexDirection: "column", alignItems: "center", gap: 14 }}
      >
        <div
          className="skeleton-block"
          style={{ width: 140, height: 140, borderRadius: 20 }}
        />
        <div className="skeleton-block" style={{ width: 150, height: 22 }} />
        <div className="skeleton-block" style={{ width: "80%", height: 14 }} />
      </div>
    </div>
  );
}

export function SkeletonCardRow() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-block" style={{ width: 56, height: 56, borderRadius: 14 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton-block" style={{ width: "40%", height: 10, marginBottom: 8 }} />
        <div className="skeleton-block" style={{ width: "70%", height: 12 }} />
      </div>
    </div>
  );
}
