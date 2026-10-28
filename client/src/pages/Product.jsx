import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import { fetchProducts } from '../lib/api';

const SIZES = ['S', 'M', 'L', 'XL'];

export default function Product() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addItem } = useCart();
  const toast = useToast();

  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (product) {
      fetchProducts({ category: product.category })
        .then((data) => setRelated(data.filter((p) => p.id !== product.id).slice(0, 4)))
        .catch(() => {});
    }
  }, [product]);

  function handleAddToCart() {
    addItem(product.id, selectedSize, qty);
    toast(`Added ${product.name} to cart`);
  }

  if (loading) {
    return (
      <main className="wrap">
        <div className="product-detail">
          <div className="skeleton" style={{ aspectRatio: '4/5' }} />
          <div>
            <div className="skeleton" style={{ height: 32, marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 20, width: '30%' }} />
          </div>
        </div>
        <style>{productDetailCSS}</style>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="wrap">
        <p style={{ gridColumn: '1/-1', paddingBlock: '4rem', textAlign: 'center', color: 'var(--steel)' }}>
          Product not found. <Link to="/shop" style={{ color: 'var(--grip-blue)' }}>Back to shop</Link>
        </p>
        <style>{productDetailCSS}</style>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} — Grip On`}</title>
        <meta
          name="description"
          content={`${product.name} in ${product.colour} — R${product.price}. Shop Grip On gym wear.`}
        />
        <meta property="og:title" content={`${product.name} — Grip On`} />
        <meta property="og:description" content={`Training wear made for the lifts that matter.`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
      </Helmet>

      <main className="wrap">
        <div className="product-detail">
          <div className="product-media">
            <img
              src={product.image}
              alt={`${product.name} — ${product.colour}`}
              className="product-media-img"
            />
          </div>
          <div className="product-info">
            <span className="eyebrow">
              {product.category} · {product.colour}
            </span>
            <h1>{product.name}</h1>
            <span className="price">R{product.price}</span>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--steel)',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ✓ In stock · Ships within 2-3 days
            </p>

            <div className="option-group">
              <span className="option-label">
                Size{' '}
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  style={{
                    color: 'var(--grip-blue)',
                    textTransform: 'none',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    letterSpacing: 'inherit',
                  }}
                >
                  — Size guide
                </button>
              </span>
              <div className="size-options">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={`size-btn${s === selectedSize ? ' active' : ''}`}
                    data-size={s}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="qty-row">
              <span className="option-label" style={{ margin: 0 }}>
                Qty
              </span>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span id="qtyValue">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              style={{ width: '100%', justifyContent: 'center', padding: '1.1rem' }}
            >
              Add to cart — R{product.price * qty}
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ paddingBlock: '3rem 5rem' }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">You may also like</span>
                <h2>Related products</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

      <style>{productDetailCSS}</style>
    </>
  );
}

const productDetailCSS = `
  .product-detail {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 3rem; padding-block: 3rem 5rem;
  }
  .product-media {
    aspect-ratio: 4/5; background: var(--ash);
    border: 1px solid var(--line); overflow: hidden;
  }
  .product-media-img {
    width: 100%; height: 100%; object-fit: contain;
    transition: transform 0.3s ease;
  }
  .product-media:hover .product-media-img {
    transform: scale(1.15);
  }
  .product-info .eyebrow { margin-bottom: 0.75rem; }
  .product-info h1 {
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    margin-bottom: 0.75rem; text-transform: none;
  }
  .product-info .price {
    font-size: 1.4rem; color: var(--grip-blue);
    display: block; margin-bottom: 1.5rem;
  }
  .option-group { margin-bottom: 1.75rem; }
  .option-label {
    font-family: var(--font-mono); font-size: 0.72rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--steel); display: block; margin-bottom: 0.6rem;
  }
  .size-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .size-btn {
    border: 1px solid var(--line); padding: 0.55rem 1rem;
    font-family: var(--font-mono); font-size: 0.8rem;
    background: none; color: var(--chalk); cursor: pointer;
  }
  .size-btn.active { border-color: var(--grip-blue); color: var(--grip-blue); }
  .qty-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .qty-row button {
    border: 1px solid var(--line); width: 2.25rem; height: 2.25rem;
    font-family: var(--font-mono); background: none; color: var(--chalk); cursor: pointer;
  }
  @media (max-width: 760px) {
    .product-detail { grid-template-columns: 1fr; }
  }
`;
