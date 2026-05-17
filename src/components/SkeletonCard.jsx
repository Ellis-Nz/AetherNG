// ─── SkeletonCard ─────────────────────────────────────────────────────────────
// A placeholder card shown while products are "loading".
// The shimmer animation is defined in index.css.
// Usage: render 8 of these in a grid, then swap for real ProductCards.

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-info">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line long" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}
