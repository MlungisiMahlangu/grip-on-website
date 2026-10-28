import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDebounce } from '../hooks/useDebounce';
import { fetchProducts } from '../lib/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const searchRef = useRef(null);
  const revealRef = useScrollReveal();

  const categoryFilter = searchParams.get('category') || 'all';
  const debouncedSearch = useDebounce(search, 300);

  // Fetch all products (filtering/sorting done client-side for responsiveness).
  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Extract categories from products.
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  // Filter + sort.
  const filtered = useMemo(() => {
    let list = [...products];

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.colour.toLowerCase().includes(q),
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [products, categoryFilter, debouncedSearch, sort]);

  // Keyboard shortcut: "/" focuses search.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function handleCategoryChange(val) {
    if (val === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: val });
    }
  }

  return (
    <>
      <Helmet>
        <title>Shop All — Grip On Gym Wear</title>
        <meta name="description" content="Browse Grip On's full range: tees, vests, hoodies, joggers, tights and accessories." />
        <meta property="og:title" content="Grip On — Gym Wear Built to Hold" />
        <meta property="og:description" content="Training wear made for the lifts that matter." />
        <meta property="og:image" content="/images/brand/hero.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="wrap">
        <div className="shop-head" ref={revealRef}>
          <span className="eyebrow">Limited stock available</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Shop now</h1>
          <p style={{ color: 'var(--steel)', marginTop: '0.5rem', maxWidth: '50ch' }}>
            Every piece is made in small batches. When it's gone, it's gone.
          </p>
        </div>

        <div className="shop-filters">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>

          <input
            ref={searchRef}
            type="text"
            placeholder='Search... (press "/" to focus)'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            style={{
              background: 'var(--ash)',
              border: '1px solid var(--line)',
              color: 'var(--chalk)',
              padding: '0.6rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
              minWidth: '180px',
            }}
          />

          <span className="shop-count">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p>Failed to load products. Please try again later.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            Nothing here yet — check another category.
          </div>
        ) : (
          <div className="product-grid" id="shopGrid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        .shop-head { padding-block: 3rem 2rem; }
        .shop-filters {
          display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
          margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--line);
        }
        .shop-filters select {
          background: var(--ash); color: var(--chalk);
          border: 1px solid var(--line); padding: 0.6rem 1rem;
          font-family: var(--font-mono); font-size: 0.78rem;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .shop-count {
          color: var(--steel); font-family: var(--font-mono);
          font-size: 0.8rem; margin-left: auto;
        }
        .empty-state { text-align: center; padding-block: 5rem; color: var(--steel); }
      `}</style>
    </>
  );
}
