import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider }           from './context/CartContext';
import { ToastProvider }          from './context/ToastContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { WishlistProvider }       from './context/WishlistContext';
import { AuthProvider }           from './context/AuthContext';
import Navbar            from './components/Navbar';
import Cart              from './components/Cart';
import MobileNav         from './components/MobileNav';
import HomePage          from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrderConfirmPage  from './pages/OrderConfirmPage';
import WishlistPage      from './pages/WishlistPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ProfilePage       from './pages/ProfilePage';
import AdminPage         from './pages/AdminPage';
import NotFoundPage      from './pages/NotFoundPage';

// ─── App ──────────────────────────────────────────────────────────────────────
// Provider stack (outermost → innermost):
//  AuthProvider           — user session
//  ToastProvider          — global notifications
//  CartProvider           — shopping cart + coupon
//  WishlistProvider       — saved items
//  RecentlyViewedProvider — browsing history
//
// Navbar, Cart sidebar, and MobileNav are always mounted outside the routes
// so they persist across page navigations without re-mounting.

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <Navbar />
              <Routes>
                <Route path="/"              element={<HomePage />} />
                <Route path="/product/:id"   element={<ProductDetailPage />} />
                <Route path="/checkout"      element={<CheckoutPage />} />
                <Route path="/order-confirm" element={<OrderConfirmPage />} />
                <Route path="/wishlist"      element={<WishlistPage />} />
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/register"      element={<RegisterPage />} />
                <Route path="/profile"       element={<ProfilePage />} />
                <Route path="/admin"         element={<AdminPage />} />
                <Route path="*"              element={<NotFoundPage />} />
              </Routes>
              <Cart />
              <MobileNav />
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
