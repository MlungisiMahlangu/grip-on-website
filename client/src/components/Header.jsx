import { useState, useRef, useEffect, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProduct } from '../lib/api';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { itemCount, cart } = useCart();
  const location = useLocation();
  const previewRef = useRef(null);
  const cartLinkRef = useRef(null);

  // Close nav on route change.
  useEffect(() => setNavOpen(false), [location.pathname]);

  // Close preview on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (
        previewRef.current &&
        !previewRef.current.contains(e.target) &&
        cartLinkRef.current &&
        !cartLinkRef.current.contains(e.target)
      ) {
        setPreviewOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link to="/" className="nav-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="30" width="6" height="10" fill="currentColor" />
            <rect x="84" y="30" width="6" height="10" fill="currentColor" />
            <rect x="16" y="33" width="68" height="4" fill="currentColor" />
            <path
              d="M38 37 L38 45 C38 55 34 58 30 62 C26 66 26 72 26 78 L26 90 L74 90 L74 78 C74 72 74 66 70 62 C66 58 62 55 62 45 L62 37 Z"
              fill="currentColor"
            />
            <path d="M45 60 L45 78 M55 60 L55 78" stroke="var(--void)" strokeWidth="3" />
          </svg>{' '}
          Grip On
        </Link>

        <nav className={`nav-links${navOpen ? ' open' : ''}`} id="navLinks">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              aria-current={location.pathname === to ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions" style={{ position: 'relative' }}>
          <Link
            to="/cart"
            className="cart-link"
            ref={cartLinkRef}
            onClick={(e) => {
              e.preventDefault();
              setPreviewOpen((o) => !o);
            }}
          >
            Cart<span className="cart-count" id="cartCount">{itemCount}</span>
          </Link>

          {previewOpen && <CartPreview cart={cart} onClose={() => setPreviewOpen(false)} ref={previewRef} />}

          <button
            className="nav-toggle"
            id="navToggle"
            aria-expanded={navOpen}
            aria-controls="navLinks"
            onClick={() => setNavOpen((o) => !o)}
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}

// Cart preview dropdown — extracted as forwardRef for outside-click handling.
const CartPreview = forwardRef(function CartPreview({ cart, onClose }, ref) {
  const [products, setProducts] = useState({});

  useEffect(() => {
    // Load product details for preview items.
    const ids = [...new Set(cart.slice(0, 4).map((i) => i.id))];
    ids.forEach((id) => {
      if (!products[id]) {
        fetchProduct(id).then((p) => setProducts((prev) => ({ ...prev, [id]: p })));
      }
    });
  }, [cart]);

  const total = cart.reduce((sum, item) => {
    const p = products[item.id];
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  return (
    <div className="cart-preview open" ref={ref}>
      {!cart.length ? (
        <div className="cart-preview-empty">Your cart is empty.</div>
      ) : (
        <>
          {cart.slice(0, 4).map((item) => {
            const p = products[item.id];
            if (!p) return null;
            return (
              <div className="cart-preview-row" key={`${item.id}-${item.size}`}>
                <span>
                  {p.name} ({item.size}) x{item.qty}
                </span>
                <span className="price">R{p.price * item.qty}</span>
              </div>
            );
          })}
          {cart.length > 4 && (
            <div className="cart-preview-more">+{cart.length - 4} more</div>
          )}
          <div className="cart-preview-total">
            <span>Total</span>
            <span className="price">R{total}</span>
          </div>
          <Link
            to="/cart"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            View cart
          </Link>
        </>
      )}
    </div>
  );
});
