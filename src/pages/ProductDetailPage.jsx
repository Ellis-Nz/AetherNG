import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, CheckCircle, AlertCircle, Star, Heart, Truck, RotateCcw } from 'lucide-react';
import { products, formatNaira } from '../data/products';
import { useCart }           from '../context/CartContext';
import { useToast }          from '../context/ToastContext';
import { useWishlist }       from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import StarRating  from '../components/StarRating';
import ProductCard from '../components/ProductCard';

// ─── ProductDetailPage ────────────────────────────────────────────────────────
// Features:
//  - Image gallery with thumbnail strip + zoom-on-hover
//  - Color variant selector
//  - Stock indicator
//  - Wishlist heart button
//  - Delivery estimate
//  - Full review list with verified badge

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, setOpen, effectivePrice } = useCart();
  const { addToast }     = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addViewed }    = useRecentlyViewed();

  const product = products.find(p => p.id === id);

  // Gallery state — which image is shown large
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed]       = useState(false);

  // Variant state — which color/size is selected
  const [selectedVariants, setSelectedVariants] = useState({});

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  // Track as recently viewed
  useEffect(() => {
    if (product) {
      addViewed(product.id);
      setActiveImg(0); // reset gallery when navigating between products
      setSelectedVariants({});
      setQuantity(1);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="not-found-page">
        <h2>Product not found</h2>
        <p>This item may have been removed or the URL is incorrect.</p>
        <Link to="/" className="back-link">← Back to shop</Link>
      </div>
    );
  }

  const images   = product.images || [product.image];
  const price    = effectivePrice(product);
  const onSale   = Boolean(product.salePrice);
  const discount = onSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    addToast(`${product.name} added to cart ✓`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setOpen(true);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      isWishlisted(product.id) ? 'Removed from wishlist' : 'Saved to wishlist ♡',
      isWishlisted(product.id) ? 'info' : 'success'
    );
  };

  // Delivery date estimate
  const deliveryDate = () => {
    const days = parseInt(product.deliveryDays?.split('–')[1] || '5', 10);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to={`/?category=${product.category}`}>{product.category}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        {/* ── Main two-column layout ── */}
        <div className="detail-layout">

          {/* ─── LEFT: Image Gallery ─── */}
          <div className="gallery-col">
            {/* Main image — hover zooms in */}
            <div
              className={`gallery-main ${zoomed ? 'zoomed' : ''}`}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={images[activeImg]}
                alt={product.name}
                className="gallery-main-img"
              />
              {onSale && <span className="detail-sale-badge">{discount}% OFF</span>}
              {isLowStock && (
                <div className="detail-stock-badge low">
                  <AlertCircle size={14} /> Only {product.stock} left
                </div>
              )}
              {/* Wishlist heart on the image */}
              <button
                className={`gallery-heart ${isWishlisted(product.id) ? 'active' : ''}`}
                onClick={handleWishlist}
                title={isWishlisted(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Product Info ─── */}
          <div className="detail-info">
            {/* Badges */}
            <div className="detail-tags">
              {product.isNew        && <span className="badge badge-new">New Arrival</span>}
              {product.isBestSeller && <span className="badge badge-best">Best Seller</span>}
            </div>

            <p className="detail-category">{product.category}</p>
            <h1 className="detail-name">{product.name}</h1>

            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="lg" />

            {/* Price */}
            <div className="detail-price-row">
              <span className="detail-price">{formatNaira(price)}</span>
              {onSale && (
                <>
                  <span className="detail-price-orig">{formatNaira(product.price)}</span>
                  <span className="detail-discount-badge">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock indicator bar */}
            <div className="stock-indicator">
              {isOutOfStock ? (
                <span className="stock-label out">Out of stock</span>
              ) : isLowStock ? (
                <>
                  <span className="stock-label low">Low stock — {product.stock} left</span>
                  <div className="stock-bar">
                    <div className="stock-bar-fill low" style={{ width: `${(product.stock / 20) * 100}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <span className="stock-label ok">In stock</span>
                  <div className="stock-bar">
                    <div className="stock-bar-fill ok" style={{ width: '80%' }} />
                  </div>
                </>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            {/* ── Variant selectors ── */}
            {product.variants && Object.entries(product.variants).map(([variantType, options]) => (
              <div key={variantType} className="variant-group">
                <p className="variant-label">
                  {variantType.charAt(0).toUpperCase() + variantType.slice(1)}:
                  <strong> {selectedVariants[variantType] || options[0]}</strong>
                </p>
                <div className="variant-options">
                  {options.map(opt => (
                    <button
                      key={opt}
                      className={`variant-btn ${(selectedVariants[variantType] || options[0]) === opt ? 'active' : ''}`}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variantType]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Key Features */}
            <div className="detail-features">
              <h3 className="features-title">Key Features</h3>
              <ul className="features-list">
                {product.features.map((f, i) => (
                  <li key={i} className="feature-item">
                    <CheckCircle size={15} className="feature-icon" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            <div className="quantity-row">
              <label className="qty-label">Quantity</label>
              <div className="quantity-control">
                <button className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
              {isLowStock && <span className="stock-warning">{product.stock} available</span>}
            </div>

            {/* Action buttons */}
            <div className="detail-actions">
              <button
                className={`detail-add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={17} />
                {added ? 'Added!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="detail-buy-btn" onClick={handleBuyNow} disabled={isOutOfStock}>
                Buy Now
              </button>
            </div>

            {/* Delivery + guarantees */}
            <div className="delivery-info">
              <div className="delivery-row">
                <Truck size={16} />
                <span>
                  <strong>Free delivery</strong> — estimated by <strong>{deliveryDate()}</strong>
                </span>
              </div>
              <div className="delivery-row">
                <RotateCcw size={16} />
                <span>30-day hassle-free returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        {product.reviews?.length > 0 && (
          <section className="reviews-section">
            <h2 className="reviews-title">
              Customer Reviews
              <span className="reviews-summary">{product.rating} / 5 · {product.reviewCount} reviews</span>
            </h2>
            <div className="reviews-list">
              {product.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-meta">
                      <span className="review-name">{review.name}</span>
                      {review.verified && (
                        <span className="verified-badge"><CheckCircle size={12} /> Verified Buyer</span>
                      )}
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14}
                        fill={i < review.rating ? '#f5a623' : 'none'}
                        stroke={i < review.rating ? '#f5a623' : '#d4cfc9'}
                      />
                    ))}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="related-section">
            <h2 className="related-title">Customers Also Bought</h2>
            <div className="product-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
