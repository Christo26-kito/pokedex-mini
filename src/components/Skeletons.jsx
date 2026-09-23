export function SkeletonList({ count = 5 }) {
  return (
    <div className="list-loading" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-block" style={{ width: 56, height: 56 }} />
          <div className="skeleton-block" style={{ width: 40, height: 12 }} />
          <div className="skeleton-block" style={{ width: "60%", height: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="list-loading" aria-hidden="true">
      <div className="skeleton-card" style={{ flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div className="skeleton-block" style={{ width: 140, height: 140, borderRadius: 20 }} />
        <div className="skeleton-block" style={{ width: 120, height: 20 }} />
        <div className="skeleton-block" style={{ width: "80%", height: 14 }} />
      </div>
    </div>
  );
}
