import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchProducts, submitNewsletter } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const toast = useToast();
  const revealRef = useScrollReveal();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchProducts()])
      .then(([products]) => {
        setFeatured(products.slice(0, 4));
        const cats = [...new Set(products.map((p) => p.category))];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleNewsletter(e) {
    e.preventDefault();
    try {
      await submitNewsletter({ email });
      toast('Thanks for subscribing!');
      setEmail('');
    } catch {
      toast('Thanks for subscribing!');
      setEmail('');
    }
  }

  return (
    <>
      <Helmet>
        <title>Grip On - Gym</title>
        <meta
          name="description"
          content="Training wear made for the lifts that matter. Shop Grip On tees, hoodies, joggers and accessories. Based in Johannesburg, South Africa."
        />
        <meta property="og:title" content="Grip On — Gym Wear Built to Hold" />
        <meta property="og:description" content="Training wear made for the lifts that matter." />
        <meta property="og:image" content="/images/brand/hero.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="hero">
        <div className="hero-bg-type" aria-hidden="true">
          <span>GRIP ON</span>
        </div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">New season live</span>
            <h1>
              Built to hold.
              <br />
              Not let go.
            </h1>
            <p>
              Training wear made for the lifts that matter. No noise, no logos you don't need —
              just gear that keeps up when it counts.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Shop now
              </Link>
              <Link to="/about" className="btn btn-outline">
                About us
              </Link>
            </div>
          </div>
          <div className="hero-media">
            <img src="/images/brand/hero.jpg" alt="Grip On athlete wearing the brand's gym Tshirt" />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="category-strip" id="categoryStrip">
          {['all', ...categories].map((c) => (
            <Link key={c} className="category-chip" to={`/shop?category=${c}`}>
              {c === 'all' ? 'All' : c}
            </Link>
          ))}
        </div>
      </div>

      <section className="wrap" id="featured" ref={revealRef}>
        <div className="section-head">
          <div>
            <span className="eyebrow">Limited stock</span>
            <h2>New arrivals</h2>
          </div>
          <Link to="/shop" className="btn btn-primary">
            Shop all
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="product-grid" id="featuredGrid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="statement">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <svg
            className="statement-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="10" y="30" width="6" height="10" fill="currentColor" />
            <rect x="84" y="30" width="6" height="10" fill="currentColor" />
            <rect x="16" y="33" width="68" height="4" fill="currentColor" />
            <path
              d="M38 37 L38 45 C38 55 34 58 30 62 C26 66 26 72 26 78 L26 90 L74 90 L74 78 C74 72 74 66 70 62 C66 58 62 55 62 45 L62 37 Z"
              fill="currentColor"
            />
          </svg>
          <h2>No grip, no growth.</h2>
          <p>
            Every piece is tested against the only opinion that matters: the last rep of the last
            set, when everything wants to slip.{' '}
            <strong>Join hundreds of lifters who train in Grip On.</strong>
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Shop now
          </Link>
        </div>
      </section>

      <section className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop by mission</span>
            <h2>Train. Recover. Repeat.</h2>
          </div>
        </div>
        <div className="feature-duo">
          <Link to="/shop?category=shirts" className="feature-panel">
            <div>
              <span className="eyebrow">For lifting days</span>
              <h3>
                Heavyweight Tshirts &amp; vests
              </h3>
              <span className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Shop shirts
              </span>
            </div>
          </Link>
          <Link to="/shop?category=hoodies" className="feature-panel">
            <div>
              <span className="eyebrow">For rest days</span>
              <h3>Hoodies &amp; joggers</h3>
              <span className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Shop hoodies
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="newsletter">
        <div className="wrap">
          <span className="eyebrow">Join the crew</span>
          <h2 style={{ marginTop: '0.5rem' }}>Get 10% off your first order</h2>
          <p
            style={{
              color: 'var(--steel)',
              marginTop: '0.75rem',
              maxWidth: '42ch',
              marginInline: 'auto',
            }}
          >
            Subscribe and be the first to know when new gear arrives. Plus get exclusive access to
            restocks and member-only deals.
          </p>
          <form className="newsletter-form" id="newsletterForm" style={{ marginTop: '2rem' }} onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--void)',
                border: '1px solid var(--line)',
                color: 'var(--chalk)',
                padding: '0.75rem 1rem',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button type="submit" className="btn btn-primary">
              Get my code
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
