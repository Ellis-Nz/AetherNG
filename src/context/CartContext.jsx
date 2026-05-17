import { createContext, useContext, useReducer, useEffect } from 'react';

// ─── Coupon codes ─────────────────────────────────────────────────────────────
const COUPONS = {
  AETHER10:  { type: 'percent', value: 10,  label: '10% off'              },
  SAVE20:  { type: 'percent', value: 20,  label: '20% off'              },
  FLAT500: { type: 'fixed',   value: 5,   label: '$5 off'               },
  NEWUSER: { type: 'percent', value: 15,  label: '15% off for new users' },
};

const CartContext = createContext(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.product, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };

    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };

    case 'DECREMENT':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
      };

    case 'SET_OPEN':     return { ...state, isOpen: action.isOpen };
    case 'SET_COUPON':   return { ...state, coupon: action.coupon };
    case 'CLEAR_COUPON': return { ...state, coupon: null };
    case 'CLEAR':        return { ...state, items: [], coupon: null };
    default:             return state;
  }
}

// ─── Safe localStorage loader ──────────────────────────────────────────────────
// Previous versions saved just an array; now we save an object { items, coupon }.
// This function handles both formats and any corrupt data gracefully.
function loadCartFromStorage() {
  const fallback = { items: [], coupon: null, isOpen: false };
  try {
    const raw = localStorage.getItem('aether-cart');
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    // Old format: the whole value was an array
    if (Array.isArray(parsed)) {
      return { items: parsed, coupon: null, isOpen: false };
    }

    // New format: { items, coupon }
    if (parsed && typeof parsed === 'object') {
      return {
        items:  Array.isArray(parsed.items) ? parsed.items : [],
        coupon: parsed.coupon ?? null,
        isOpen: false,
      };
    }

    return fallback;
  } catch {
    // JSON.parse failed — wipe the bad data
    localStorage.removeItem('aether-cart');
    return fallback;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, loadCartFromStorage);

  // Persist to localStorage whenever items or coupon change
  useEffect(() => {
    localStorage.setItem('aether-cart', JSON.stringify({
      items:  state.items,
      coupon: state.coupon,
    }));
  }, [state.items, state.coupon]);

  const effectivePrice = (item) => item.salePrice ?? item.price;

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal  = state.items.reduce((s, i) => s + effectivePrice(i) * i.quantity, 0);
  const savings   = state.items.reduce((s, i) => {
    return i.salePrice ? s + (i.price - i.salePrice) * i.quantity : s;
  }, 0);

  let couponDiscount = 0;
  if (state.coupon) {
    couponDiscount = state.coupon.type === 'percent'
      ? subtotal * (state.coupon.value / 100)
      : Math.min(state.coupon.value, subtotal);
  }
  const total = Math.max(0, subtotal - couponDiscount);

  const applyCoupon = (code) => {
    const coupon = COUPONS[code.trim().toUpperCase()];
    if (coupon) {
      dispatch({ type: 'SET_COUPON', coupon: { ...coupon, code: code.toUpperCase() } });
      return { success: true, label: coupon.label };
    }
    return { success: false };
  };

  const removeCoupon = () => dispatch({ type: 'CLEAR_COUPON' });
  const addItem      = (p)  => dispatch({ type: 'ADD_ITEM',    product: p });
  const removeItem   = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const increment    = (id) => dispatch({ type: 'INCREMENT',   id });
  const decrement    = (id) => dispatch({ type: 'DECREMENT',   id });
  const clearCart    = ()   => dispatch({ type: 'CLEAR' });
  const setOpen      = (v)  => dispatch({ type: 'SET_OPEN',    isOpen: v });

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      coupon: state.coupon,
      itemCount,
      subtotal,
      savings,
      couponDiscount,
      total,
      effectivePrice,
      addItem, removeItem, increment, decrement, clearCart, setOpen,
      applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside <CartProvider>');
  return ctx;
}
