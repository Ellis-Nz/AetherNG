import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, Mail } from "lucide-react";

// ─── OrderConfirmPage ─────────────────────────────────────────────────────────
// Shown after a successful checkout.
// Receives order details via React Router's location.state
// (passed from CheckoutPage via navigate('/order-confirm', { state: {...} })).

export default function OrderConfirmPage() {
  const { state } = useLocation();

  // If someone navigates here directly (no state), show a generic message
  const orderNumber = state?.orderNumber || "AETHER-XXXXXX";
  const email = state?.email || "your email";
  const total = state?.total || 0;

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        {/* Success icon */}
        <div className="confirm-icon">
          <CheckCircle size={64} strokeWidth={1.5} />
        </div>

        <h1 className="confirm-title">Order Confirmed!</h1>
        <p className="confirm-sub">
          Thank you for your purchase. Your beautiful objects are on their way.
        </p>

        {/* Order number — highlighted */}
        <div className="confirm-order-number">
          <span className="order-label">Order Number</span>
          <span className="order-value">{orderNumber}</span>
        </div>

        {/* Summary details */}
        <div className="confirm-details">
          <div className="confirm-detail-row">
            <Mail size={16} />
            <span>
              Confirmation sent to <strong>{email}</strong>
            </span>
          </div>
          <div className="confirm-detail-row">
            <Package size={16} />
            <span>
              Estimated delivery: <strong>3–5 business days</strong>
            </span>
          </div>
        </div>

        <div className="confirm-total">
        {/* Order Total: <strong>${total.toFixed(2)}</strong> */}
        Order Total: <strong>₦{total.toLocaleString()}</strong>
        </div>

        {/* 
        <strong>
          ₦
          {total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong> */}

        {/* Actions */}
        <div className="confirm-actions">
          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
