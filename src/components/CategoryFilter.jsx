// A row of pill buttons to filter products by category
export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="filter-bar">
      {/* "All" button resets the filter (null = show everything) */}
      <button
        className={`filter-btn ${activeCategory === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>

      {categories.map(category => (
        <button
          key={category}
          className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
