import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

// ─── MobileNav ────────────────────────────────────────────────────────────────
// Bottom tab bar — only visible on mobile (hidden via CSS on desktop).
// Highlights the active tab based on the current URL.

export default function MobileNav() {
  const { itemCount, setOpen } = useCart();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`bottom-nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </Link>

      <Link to="/?search=" className="bottom-nav-item">
        <Search size={22} />
        <span>Search</span>
      </Link>

      {/* Cart tab opens the cart sidebar instead of navigating */}
      <button className="bottom-nav-item" onClick={() => setOpen(true)}>
        <span className="bottom-nav-cart-wrap">
          <ShoppingCart size={22} />
          {itemCount > 0 && (
            <span className="bottom-cart-badge">{itemCount}</span>
          )}
        </span>
        <span>Cart</span>
      </button>

      <button className="bottom-nav-item">
        <User size={22} />
        <span>Account</span>
      </button>
    </nav>
  );
}
