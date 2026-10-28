import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { fetchProduct, createOrder } from '../lib/api';
import { BRAND } from '../config';

export default function Cart() {
  const { cart, removeItem, updateQty, clearCart, itemCount } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState({});
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load product details for each cart item.
  useEffect(() => {
    const ids = [...new Set(cart.map((i) => i.id))];
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

  function buildWhatsAppMessage() {
    let message = `Hi Grip On! I'd like to order:\n\n`;
    cart.forEach((item) => {
      const p = products[item.id];
      if (p) message += `• ${p.name} (${p.colour}, Size ${item.size}) x${item.qty} — R${p.price * item.qty}\n`;
    });
    message += `\nTotal: R${total}`;
    message += `\n\nName: ${name}`;
    message += `\nDelivery address: ${address}`;
    return encodeURIComponent(message);
  }

  async function handleCheckout() {
    if (!name.trim() || !address.trim()) {
      setError('Please fill in your name and delivery address.');
      return;
    }
    setError('');
    setSubmitting(true);

    // Try to create order on server (recalculates total server-side).
    try {
      await createOrder({
        name: name.trim(),
        phone: BRAND.whatsapp,
        address: address.trim(),
        items: cart.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
      });
    } catch {
      // Graceful fallback — open WhatsApp even if API call fails.
    }

    const url = `https://wa.me/${BRAND.whatsapp}?text=${buildWhatsAppMessage()}`;
    window.open(url, '_blank');
    setSubmitting(false);
  }

  return (
    <>
      <Helmet>
        <title>Your Cart — Grip On</title>
        <meta name="description" content="Review your Grip On order before checkout." />
        <meta property="og:title" content="Grip On — Gym Wear Built to Hold" />
        <meta property="og:description" content="Training wear made for the lifts that matter." />
        <meta property="og:image" content="/images/brand/hero.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="wrap cart-page">
        <span className="eyebrow">Review</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem' }}>Your cart</h1>

        {!cart.length ? (
          <div style={{ textAlign: 'center', paddingBlock: '4rem', color: 'var(--steel)' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Your cart is empty.</p>
            <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
              Ready to gear up? Check out our latest gear.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Shop now
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div id="cartRows">
              {cart.map((item) => {
                const p = products[item.id];
                if (!p) return null;
                return (
                  <div className="cart-row" key={`${item.id}-${item.size}`}>
                    <div className="cart-row-media">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div>
                      <div className="cart-row-name">{p.name}</div>
                      <div className="cart-row-meta">
                        {p.colour} · Size {item.size} · R{p.price}
                      </div>
                      <div className="cart-row-qty" style={{ marginTop: '0.5rem' }}>
                        <button
                          onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="price">R{p.price * item.qty}</div>
                    <button
                      className="cart-row-remove"
                      onClick={() => {
                        removeItem(item.id, item.size);
                        toast('Removed from cart');
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>R{total}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="price">R{total}</span>
              </div>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--steel)',
                  marginTop: '1rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                🔒 Secure checkout via WhatsApp
              </p>

              <div className="checkout-form">
                <div className="field">
                  <label htmlFor="custName">Full name</label>
                  <input
                    type="text"
                    id="custName"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="custAddress">Delivery address</label>
                  <textarea
                    id="custAddress"
                    required
                    placeholder="Street, suburb, city"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  {submitting ? 'Processing...' : 'Complete order on WhatsApp'}
                </button>
                {error && (
                  <div className="field-error" style={{ display: 'block' }}>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{cartCSS}</style>
    </>
  );
}

const cartCSS = `
  .cart-page { padding-block: 3rem 5rem; }
  .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 3rem; align-items: start; }
  .cart-row {
    display: grid; grid-template-columns: 90px 1fr auto auto;
    gap: 1.25rem; align-items: center; padding-block: 1.25rem;
    border-bottom: 1px solid var(--line);
  }
  .cart-row-media {
    width: 90px; height: 100px; background: var(--ash);
    border: 1px solid var(--line);
  }
  .cart-row-media img { width: 100%; height: 100%; object-fit: contain; }
  .cart-row-name { font-weight: 600; margin-bottom: 0.25rem; }
  .cart-row-meta { font-family: var(--font-mono); font-size: 0.75rem; color: var(--steel); }
  .cart-row-qty { display: flex; align-items: center; gap: 0.6rem; }
  .cart-row-qty button {
    border: 1px solid var(--line); width: 2.25rem; height: 2.25rem;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); background: none; color: var(--chalk); cursor: pointer;
  }
  .cart-row-remove {
    font-family: var(--font-mono); font-size: 0.72rem; color: var(--steel);
    text-transform: uppercase; background: none; border: none; cursor: pointer;
  }
  .cart-row-remove:hover { color: var(--grip-blue); }
  .summary { background: var(--ash); border: 1px solid var(--line); padding: 1.75rem; position: sticky; top: 5rem; }
  .summary-line {
    display: flex; justify-content: space-between; margin-bottom: 0.9rem;
    font-family: var(--font-mono); font-size: 0.85rem; color: var(--steel);
  }
  .summary-total {
    display: flex; justify-content: space-between; font-size: 1.1rem;
    margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--line);
  }
  .summary .btn { width: 100%; justify-content: center; margin-top: 1.5rem; }
  .checkout-form { margin-top: 1.5rem; }
  .checkout-form .field { margin-bottom: 1rem; }
  .checkout-form label {
    display: block; font-family: var(--font-mono); font-size: 0.72rem;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--steel); margin-bottom: 0.5rem;
  }
  .checkout-form input, .checkout-form textarea {
    width: 100%; background: var(--void); border: 1px solid var(--line);
    color: var(--chalk); padding: 0.7rem 0.9rem; font-family: var(--font-body); font-size: 0.9rem;
  }
  .checkout-form textarea { min-height: 70px; resize: vertical; }
  .field-error {
    color: #ff5c5c; font-family: var(--font-mono); font-size: 0.78rem;
    margin-top: 0.6rem; display: none;
  }
  @media (max-width: 760px) {
    .cart-layout { grid-template-columns: 1fr; }
    .cart-row {
      display: grid; grid-template-columns: 70px 1fr;
      grid-template-areas: "media info" "media price" "media remove";
      row-gap: 0.6rem; align-items: start;
    }
    .cart-row-media { grid-area: media; width: 70px; height: 80px; }
    .cart-row > div:nth-child(2) { grid-area: info; }
    .cart-row .price { grid-area: price; }
    .cart-row-remove { grid-area: remove; justify-self: start; }
    .summary { position: static; }
  }
`;
