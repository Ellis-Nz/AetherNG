import { createContext, useContext, useState, useEffect } from "react";

// ─── WishlistContext ───────────────────────────────────────────────────────────
// Tracks which product IDs the user has saved to their wishlist.
// Persisted to localStorage so it survives page refreshes.

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem("aether-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("aether-wishlist", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isWishlisted = (id) => wishlistIds.includes(id);

  // Toggle: add if not present, remove if already there
  const toggleWishlist = (id) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const removeFromWishlist = (id) => {
    setWishlistIds((prev) => prev.filter((w) => w !== id));
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside <WishlistProvider>");
  return ctx;
}
