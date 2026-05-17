import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart }     from '../context/CartContext';
import { useToast }    from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';
import { formatNaira } from '../data/products';

export default function ProductCard({ product }) {
  const { addItem, effectivePrice } = useCart();
  const { addToast }                = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    addToast(`${product.name} added to cart`, 'success');
    if (product.stock <= 3) {
      setTimeout(() => addToast(`Only ${product.stock} left in stock!`, 'warning'), 400);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
    addToast(
      isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist ♡',
      isWishlisted(product.id) ? 'info' : 'success'
    );
  };

  const price    = effectivePrice(product);
  const onSale   = Boolean(product.salePrice);
  const discount = onSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-wrap">
          <img src={product.image} alt={product.name} loading="lazy" />

          {/* Badges top-left */}
          <div className="card-badges-top-left">
            {onSale && <span className="badge badge-sale">{discount}% OFF</span>}
            {product.isNew && !onSale && <span className="badge badge-new">New</span>}
            {product.isBestSeller && !onSale && <span className="badge badge-best">Best Seller</span>}
          </div>

          {/* Low stock top-right */}
          {product.stock <= 5 && (
            <span className="stock-badge">Only {product.stock} left</span>
          )}

          {/* Wishlist heart */}
          <button
            className={`card-heart ${isWishlisted(product.id) ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Save to wishlist"
          >
            <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3 className="product-name">{product.name}</h3>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <div className="price-row">
            <span className="product-price">{formatNaira(price)}</span>
            {onSale && <span className="product-price-original">{formatNaira(product.price)}</span>}
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </Link>
  );
}
