import { useState } from "react";
import { X, ShoppingCart, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import CartItem from "./CartItem";
import { formatNaira } from "../data/products";

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
// Now includes a coupon code field.
// Valid codes (try these): AETHER10  SAVE20  FLAT500  NEWUSER

export default function Cart() {
  // const { isOpen, setOpen, items, subtotal, savings, couponDiscount, total, coupon, applyCoupon, removeCoupon } = useCart();
  const {
    isOpen,
    setOpen,
    items,
    subtotal,
    savings,
    couponDiscount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");

  if (!isOpen) return null;

  const handleCoupon = () => {
    const result = applyCoupon(couponInput);
    if (result.success) {
      addToast(`Coupon applied: ${result.label} ✓`, "success");
      setCouponInput("");
    } else {
      addToast("Invalid coupon code.", "error");
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setOpen(false)} />
      <div className="cart-sidebar">
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">
            Your Cart
            {items.length > 0 && (
              <span className="cart-item-count">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={48} className="cart-empty-icon" />
            <p className="cart-empty-title">Your cart is empty</p>
            <p className="cart-empty-sub">Add something beautiful.</p>
            <button className="cart-empty-btn" onClick={() => setOpen(false)}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="cart-items">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="cart-footer">
              {/* Coupon code field */}
              <div className="coupon-row">
                {coupon ? (
                  <div className="coupon-applied">
                    <Tag size={14} />
                    <span>
                      <strong>{coupon.code}</strong> — {coupon.label}
                    </span>
                    <button className="coupon-remove" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder="Promo code (try AETHER10)"
                      value={couponInput}
                      onChange={(e) =>
                        setCouponInput(e.target.value.toUpperCase())
                      }
                      className="coupon-input"
                      onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                    />
                    <button className="coupon-apply-btn" onClick={handleCoupon}>
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Savings */}
              {savings > 0 && (
                <div className="cart-savings">
                  Sale savings: −{formatNaira(savings)}
                </div>
              )}

              {/* Totals */}
              <div className="cart-total-row">
                <span className="cart-total-label">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="cart-total-row coupon-discount-row">
                  <span>Coupon ({coupon.code})</span>
                  <span>−{formatNaira(couponDiscount)}</span>
                </div>
              )}
              <div className="cart-total-row cart-grand-total">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-value">{formatNaira(total)}</span>
              </div>
              <p className="cart-shipping-note">
                Free shipping · Taxes calculated at checkout
              </p>

              {/* CLEAR CART BUTTON */}
              <button
                className="clear-cart-btn"
                onClick={() => {
                  if (window.confirm("Clear all items from cart?")) {
                    clearCart();
                  }
                }}
              >
                Clear Cart
              </button>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout →
              </button>

              <button
                className="continue-shopping-link"
                onClick={() => setOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
