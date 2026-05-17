import { createContext, useContext, useState } from 'react';

// ─── Recently Viewed Context ───────────────────────────────────────────────────
// Tracks which product IDs the user has visited.
// Max 6 items. The current product is excluded when showing suggestions.

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [viewedIds, setViewedIds] = useState([]);

  // Call this when a product detail page mounts
  const addViewed = (id) => {
    setViewedIds(prev => {
      // Move to front if already seen, then cap at 6
      const filtered = prev.filter(v => v !== id);
      return [id, ...filtered].slice(0, 6);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ viewedIds, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be inside <RecentlyViewedProvider>');
  return ctx;
}
