import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { itemCount, setOpen } = useCart();
  const { user, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            AetherNG
          </Link>

          {/* Desktop search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          <div className="navbar-actions">
            {/* Wishlist icon */}
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="nav-icon-badge">{wishlistIds.length}</span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart button */}
            <button className="cart-btn" onClick={() => setOpen(true)}>
              <ShoppingCart size={18} />
              <span className="cart-btn-label">Cart</span>
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>

            {/* User menu */}
            {user ? (
              <div className="user-menu-wrap">
                <button
                  className="user-avatar-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  title={user.name}
                >
                  {user.avatar}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="user-menu-backdrop"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="user-menu">
                      <p className="user-menu-name">{user.name}</p>
                      <p className="user-menu-email">{user.email}</p>
                      <div className="user-menu-divider" />
                      <Link
                        to="/profile"
                        className="user-menu-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} /> My Profile
                      </Link>
                      <Link
                        to="/admin"
                        className="user-menu-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                      <div className="user-menu-divider" />
                      <button
                        className="user-menu-item user-menu-logout"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="signin-btn">
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="mobile-drawer">
            <div className="drawer-header">
              <span className="navbar-logo">AetherNG</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <form className="drawer-search" onSubmit={handleSearch}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
            <nav className="drawer-links">
              {/* <Link to="/"                              onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/?category=Smartphones"        onClick={() => setMobileOpen(false)}>Smartphones</Link>
              <Link to="/?category=Laptops & Computing" onClick={() => setMobileOpen(false)}>Laptops & Computing</Link>
              <Link to="/?category=Audio & Electronics" onClick={() => setMobileOpen(false)}>Audio & Electronics</Link>
              <Link to="/?category=Fashion & Clothing"  onClick={() => setMobileOpen(false)}>Fashion & Clothing</Link>
              <Link to="/?category=Gaming"             onClick={() => setMobileOpen(false)}>Gaming</Link> */}
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>

              <Link
                to={`/?category=${encodeURIComponent("Smartphones")}`}
                onClick={() => setMobileOpen(false)}
              >
                Smartphones
              </Link>

              <Link
                to={`/?category=${encodeURIComponent("Laptops & Computing")}`}
                onClick={() => setMobileOpen(false)}
              >
                Laptops & Computing
              </Link>

              <Link
                to={`/?category=${encodeURIComponent("Audio & Electronics")}`}
                onClick={() => setMobileOpen(false)}
              >
                Audio & Electronics
              </Link>

              <Link
                to={`/?category=${encodeURIComponent("Fashion & Clothing")}`}
                onClick={() => setMobileOpen(false)}
              >
                Fashion & Clothing
              </Link>

              <Link
                to={`/?category=${encodeURIComponent("Gaming")}`}
                onClick={() => setMobileOpen(false)}
              >
                Gaming
              </Link>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
              </Link>
              
              {user ? (
                <Link to="/profile" onClick={() => setMobileOpen(false)}>
                  My Profile
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
