import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ChevronRight, Lock, Loader } from "lucide-react";
import { formatNaira } from "../data/products";

// ─── CheckoutPage ──────────────────────────────────────────────────────────────
// Multi-step checkout: Cart Review → Shipping → Payment → (redirect to confirm)
//
// KEY CONCEPTS FOR INTERVIEW:
//  - Controlled forms: every input is tied to a state variable
//  - Form validation: errors are stored in an 'errors' object, checked on submit
//  - Step navigation: 'step' state (1, 2, 3) drives which panel renders
//  - Simulated async: setTimeout mimics a real API call with a spinner

const STEPS = ["Review", "Shipping", "Payment"];

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns an errors object. Empty object = valid.
function validateShipping(data) {
  const errors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Enter a valid email";
  if (!data.address.trim()) errors.address = "Address is required";
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.postalCode.trim()) errors.postalCode = "Postal code is required";
  return errors;
}

function validatePayment(data) {
  const errors = {};
  if (!data.cardName.trim()) errors.cardName = "Name on card is required";
  if (!data.cardNumber.replace(/\s/g, "").match(/^\d{16}$/))
    errors.cardNumber = "Enter a valid 16-digit card number";
  if (!data.expiry.match(/^\d{2}\/\d{2}$/)) errors.expiry = "Use MM/YY format";
  if (!data.cvv.match(/^\d{3,4}$/)) errors.cvv = "3 or 4 digit CVV required";
  return errors;
}

// Format card number with spaces: 1234567812345678 → 1234 5678 1234 5678
function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

// Format expiry: 1226 → 12/26
function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ── Component ─────────────────────────────────────────────────────────────────

// ── Field component to reduce repetition ──
// const Field = ({
//   label,
//   name,
//   type = "text",
//   value,
//   onChange,
//   placeholder,
//   half,
//   errors,
// }) => (
//   <div className={`form-field ${half ? "half" : ""}`}>
//     <label className="form-label">{label}</label>
//     <input
//       type={type}
//       name={name}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       errors={errors}
//       className={`form-input ${errors[name] ? "input-error" : ""}`}
//       autoComplete={name}
//     />
//     {errors[name] && <p className="field-error">{errors[name]}</p>}
//   </div>
// );

function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  half,
  errors
}) {
  return (
    <div className={`form-field ${half ? 'half' : ''}`}>
      <label className="form-label">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${errors[name] ? 'input-error' : ''}`}
        autoComplete={name}
      />

      {errors[name] && (
        <p className="field-error">{errors[name]}</p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, savings, effectivePrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Shipping form state
  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  // Payment form state
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // If cart is empty, redirect home
  if (items.length === 0) {
    return (
      <div className="not-found-page">
        <h2>Your bag is empty</h2>
        <p>Add some items before checking out.</p>
        <Link to="/" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const shipping_cost = 0;
  const total = subtotal + shipping_cost;

  // ── Shipping field handler ──
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Payment field handler ──
  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") value = formatCardNumber(value);
    if (name === "expiry") value = formatExpiry(value);
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 4);
    setPayment((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Step 1 → 2: validate nothing (review only) ──
  const handleContinueToShipping = () => setStep(2);

  // ── Step 2 → 3: validate shipping form ──
  const handleContinueToPayment = () => {
    const errs = validateShipping(shipping);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(3);
  };

  // ── Step 3: validate payment, simulate API, navigate to confirm ──
  const handlePlaceOrder = () => {
    const errs = validatePayment(payment);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Simulate a 2-second API call
    setTimeout(() => {
      const orderNumber =
        "AETHER-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      clearCart();
      navigate("/order-confirm", {
        // Pass order data to the confirmation page via router state
        state: { orderNumber, email: shipping.email, total },
      });
    }, 2000);
  };

  // ── Field component to reduce repetition ──
  return (
    <div className="checkout-page">
      <div className="container">
        {/* ── Step indicator ── */}
        <div className="checkout-steps">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const state =
              step > stepNum
                ? "done"
                : step === stepNum
                ? "active"
                : "upcoming";
            return (
              <div key={label} className={`checkout-step ${state}`}>
                <span className="step-circle">
                  {state === "done" ? "✓" : stepNum}
                </span>
                <span className="step-label">{label}</span>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={16} className="step-arrow" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Two-column layout: form | summary ── */}
        <div className="checkout-layout">
          {/* ────────────────── LEFT: Form panel ────────────────── */}
          <div className="checkout-form-panel">
            {/* ─ STEP 1: Cart Review ─ */}
            {step === 1 && (
              <div className="checkout-section">
                <h2 className="section-heading">Review Your Order</h2>
                <div className="review-items">
                  {items.map((item) => (
                    <div key={item.id} className="review-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="review-item-img"
                      />
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="review-item-price">
                        {formatNaira(effectivePrice(item) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  className="checkout-next-btn"
                  onClick={handleContinueToShipping}
                >
                  Continue to Shipping →
                </button>
              </div>
            )}

            {/* ─ STEP 2: Shipping Address ─ */}
            {step === 2 && (
              <div className="checkout-section">
                <h2 className="section-heading">Shipping Address</h2>
                <div className="form-grid">
                  <Field
                    label="Full Name *"
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleShippingChange}
                    placeholder="Type your Full Name here"
                    errors={errors}
                  />
                  <Field
                    label="Email Address *"
                    name="email"
                    value={shipping.email}
                    onChange={handleShippingChange}
                    placeholder="you@example.com"
                    type="email"
                    errors={errors}
                  />
                  <Field
                    label="Phone Number * "
                    name="phone"
                    value={shipping.phone}
                    onChange={handleShippingChange}
                    placeholder="+234 800 000 0000"
                    half
                    errors={errors}
                  />
                  <Field
                    label="Country"
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    placeholder="Nigeria"
                    half
                    errors={errors}
                  />
                  <Field
                    label="Street Address *"
                    name="address"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    placeholder="Type your address"
                    errors={errors}
                  />
                  <Field
                    label="City *"
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    placeholder="City Here"
                    half
                    errors={errors}
                  />
                  <Field
                    label="State"
                    name="state"
                    value={shipping.state}
                    onChange={handleShippingChange}
                    placeholder="State Here"
                    half
                    errors={errors}
                  />
                  <Field
                    label="Postal Code *"
                    name="postalCode"
                    value={shipping.postalCode}
                    onChange={handleShippingChange}
                    placeholder="101001"
                    half
                    errors={errors}
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="checkout-back-btn"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="checkout-next-btn"
                    onClick={handleContinueToPayment}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* ─ STEP 3: Payment ─ */}
            {step === 3 && (
              <div className="checkout-section">
                <h2 className="section-heading">
                  <Lock
                    size={18}
                    style={{
                      display: "inline",
                      marginRight: "8px",
                      verticalAlign: "middle",
                    }}
                  />
                  Secure Payment
                </h2>
                <p className="payment-note">
                  This is a mock payment form — no real card details are
                  processed.
                </p>

                <div className="form-grid">
                  <Field
                    label="Name on Card *"
                    name="cardName"
                    value={payment.cardName}
                    onChange={handlePaymentChange}
                    placeholder="Name Here"
                    errors={errors}
                  />
                  <Field
                    label="Card Number *"
                    name="cardNumber"
                    value={payment.cardNumber}
                    onChange={handlePaymentChange}
                    placeholder="1234 5678 9012 3456"
                    errors={errors}
                  />
                  <Field
                    label="Expiry Date *"
                    name="expiry"
                    value={payment.expiry}
                    onChange={handlePaymentChange}
                    placeholder="MM/YY"
                    half
                    errors={errors}
                  />
                  <Field
                    label="CVV *"
                    name="cvv"
                    value={payment.cvv}
                    onChange={handlePaymentChange}
                    placeholder="123"
                    half
                    errors={errors}
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="checkout-back-btn"
                    onClick={() => {
                      setStep(2);
                      setErrors({});
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="checkout-place-btn"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader size={17} className="spinner" />
                        Processing...
                      </>
                    ) : (
                      `Place Order · ${formatNaira(total)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ────────────────── RIGHT: Order Summary ────────────────── */}
          <aside className="order-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-items">
              {items.map((item) => (
                <div key={item.id} className="summary-item">
                  <span className="summary-item-name">
                    {item.name}
                    <span className="summary-item-qty"> ×{item.quantity}</span>
                  </span>
                  <span className="summary-item-price">
                    {formatNaira(effectivePrice(item) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="summary-row savings">
                <span>Savings</span>
                <span>-{formatNaira(savings)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>

            <div className="summary-guarantee">
              <p>🔒 Secure checkout</p>
              <p>🚚 Free delivery</p>
              <p>↩ 30-day returns</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
