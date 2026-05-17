import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../data/products';

// ─── CartItem ─────────────────────────────────────────────────────────────────
// A single row inside the cart sidebar.
// Shows the effective price (sale price if applicable).

export default function CartItem({ item }) {
  const { increment, decrement, removeItem, effectivePrice } = useCart();
  const price = effectivePrice(item);
  const onSale = Boolean(item.salePrice);

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-top">
          <div>
            <p className="cart-item-name">{item.name}</p>
            <div className="cart-item-price-row">
              <span className="cart-item-price">{formatNaira(price)}</span>
              {onSale && (
                <span className="cart-item-price-orig">{formatNaira(item.price)}</span>
              )}
            </div>
          </div>
          <button
            className="remove-btn"
            onClick={() => removeItem(item.id)}
            title="Remove item"
          >
            <X size={15} />
          </button>
        </div>

        <div className="cart-item-bottom">
          <div className="quantity-control">
            <button className="qty-btn" onClick={() => decrement(item.id)}>
              <Minus size={13} />
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button className="qty-btn" onClick={() => increment(item.id)}>
              <Plus size={13} />
            </button>
          </div>
          <span className="cart-item-subtotal">
            {formatNaira(price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
