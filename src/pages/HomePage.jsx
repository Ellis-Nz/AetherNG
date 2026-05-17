import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import FlashSaleBanner from "../components/FlashSaleBanner";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { products, CATEGORIES, formatNaira } from "../data/products";

// ─── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
];

const MAX_PRICE = Math.max(...products.map((p) => p.price));

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { viewedIds } = useRecentlyViewed();

  const searchQuery = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || null;

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState("popularity");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (cat) params.category = cat;
    setSearchParams(params);
  };

  // ── Filter ──
  let visible = [...products];
  // if (activeCategory) visible = visible.filter(p => p.category === activeCategory);
  if (activeCategory) {
    visible = visible.filter((p) =>
      Array.isArray(p.category)
        ? p.category.includes(activeCategory)
        : p.category === activeCategory
    );
  }
  // if (searchQuery) {
  //   const q = searchQuery.toLowerCase();
  //   visible = visible.filter(p =>
  //     p.name.toLowerCase().includes(q) ||
  //     p.category.toLowerCase().includes(q) ||
  //     p.description.toLowerCase().includes(q)
  //   );
  // }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();

    visible = visible.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (Array.isArray(p.category)
          ? p.category.some((cat) => cat.toLowerCase().includes(q))
          : p.category.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Price range filter (uses effective price — sale price if available)
  visible = visible.filter((p) => (p.salePrice ?? p.price) <= maxPrice);

  // ── Sort ──
  visible.sort((a, b) => {
    const pa = a.salePrice ?? a.price;
    const pb = b.salePrice ?? b.price;
    if (sortBy === "price-asc") return pa - pb;
    if (sortBy === "price-desc") return pb - pa;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest")
      return new Date(b.addedDate) - new Date(a.addedDate);
    return b.reviewCount - a.reviewCount; // popularity
  });

  const recentlyViewed = viewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const hasActiveFilters =
    activeCategory || maxPrice < MAX_PRICE || sortBy !== "popularity";
  const clearAllFilters = () => {
    setActiveCategory(null);
    setMaxPrice(MAX_PRICE);
    setSortBy("popularity");
    setSearchParams({});
  };

  return (
    <main className="home-page">
      <FlashSaleBanner />

      {/* Hero */}
      <div className="hero">
        <img
          src="/images/hero.png"
          alt="AETHER collection"
          className="hero-img"
        />
        <div className="hero-overlay">
          <h1 className="hero-title">Objects of Intention</h1>
          <p className="hero-subtitle">
            Curated essentials for a considered life.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="recently-viewed-section">
            <h2 className="section-title">Recently Viewed</h2>
            <div className="recently-viewed-scroll">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="recently-viewed-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search heading */}
        {searchQuery && (
          <div className="search-heading">
            <p>
              {visible.length} result{visible.length !== 1 ? "s" : ""} for{" "}
              <strong>"{searchQuery}"</strong>
            </p>
            <button
              className="clear-search-btn"
              onClick={() => setSearchParams({})}
            >
              Clear search
            </button>
          </div>
        )}

        {/* Toolbar: category + sort + filter toggle */}
        {!searchQuery && (
          <div className="toolbar">
            <CategoryFilter
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onSelect={handleCategorySelect}
            />
            <div className="toolbar-right">
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  <X size={14} /> Clear filters
                </button>
              )}
              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((f) => !f)}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Filter panel (expandable) */}
        {showFilters && !searchQuery && (
          <div className="filter-panel">
            <div className="filter-section">
              <label className="filter-section-label">
                Price Range: <strong>Up to {formatNaira(maxPrice)}</strong>
              </label>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-slider"
              />
              <div className="price-slider-labels">
                <span>₦0</span>
                <span>{formatNaira(MAX_PRICE)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product count */}
        {!loading && !searchQuery && (
          <p className="product-count">
            Showing <strong>{visible.length}</strong> product
            {visible.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No products found</h3>
            <p className="empty-state-sub">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different keyword.`
                : "Try adjusting your filters."}
            </p>
            <button className="empty-state-btn" onClick={clearAllFilters}>
              View all products
            </button>
          </div>
        ) : (
          <div className="product-grid" style={{ paddingBottom: "64px" }}>
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
