import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
// import { products }    from '../data/products';
import { products, formatNaira } from "../data/products";

// ─── WishlistPage ─────────────────────────────────────────────────────────────
// Shows all saved items. Each card has "Move to Cart" and "Remove" actions.

export default function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  // Get full product objects for each saved ID
  const wishlistProducts = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const handleMoveToCart = (product) => {
    addItem(product);
    removeFromWishlist(product.id);
    addToast(`${product.name} moved to cart`, "success");
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <Heart size={24} style={{ color: "var(--primary)" }} />
            Saved Items
          </h1>
          <p className="page-subtitle">
            {wishlistProducts.length} item
            {wishlistProducts.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♡</div>
            <h3 className="empty-state-title">Your wishlist is empty</h3>
            <p className="empty-state-sub">
              Browse products and tap the heart icon to save items.
            </p>
            <Link to="/" className="empty-state-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistProducts.map((product) => {
              const price = product.salePrice ?? product.price;
              const onSale = Boolean(product.salePrice);
              return (
                <div key={product.id} className="wishlist-card">
                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-img-link"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="wishlist-img"
                    />
                  </Link>
                  <div className="wishlist-info">
                    <p className="wishlist-category">{product.category}</p>
                    <Link
                      to={`/product/${product.id}`}
                      className="wishlist-name"
                    >
                      {product.name}
                    </Link>
                    <div className="wishlist-price-row">
                      {/* <span className="wishlist-price">${price}</span>
                      {onSale && <span className="wishlist-orig">${product.price}</span>} */}

                      <span className="wishlist-price">
                        {formatNaira(price)}
                      </span>
                      {onSale && (
                        <span className="wishlist-orig">
                          {formatNaira(product.price)}
                        </span>
                      )}

                    </div>
                    <div className="wishlist-actions">
                      <button
                        className="wishlist-cart-btn"
                        onClick={() => handleMoveToCart(product)}
                      >
                        <ShoppingCart size={15} /> Move to Cart
                      </button>
                      <button
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(product.id)}
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
