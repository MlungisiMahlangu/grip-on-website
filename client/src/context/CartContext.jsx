import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CART_KEY = 'gripon_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { id, size, qty } = action.payload;
      const existing = state.find((i) => i.id === id && i.size === size);
      if (existing) {
        return state.map((i) =>
          i.id === id && i.size === size ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...state, { id, size, qty }];
    }
    case 'REMOVE':
      return state.filter((i) => !(i.id === action.payload.id && i.size === action.payload.size));
    case 'UPDATE_QTY': {
      const { id, size, qty } = action.payload;
      return state.map((i) =>
        i.id === id && i.size === size ? { ...i, qty: Math.max(1, qty) } : i,
      );
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, loadCart);

  // Persist to localStorage on every change.
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((id, size = 'M', qty = 1) => {
    dispatch({ type: 'ADD', payload: { id, size, qty } });
  }, []);

  const removeItem = useCallback((id, size) => {
    dispatch({ type: 'REMOVE', payload: { id, size } });
  }, []);

  const updateQty = useCallback((id, size, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, size, qty } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
