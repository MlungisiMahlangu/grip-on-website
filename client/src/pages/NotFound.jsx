import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Grip On</title>
      </Helmet>
      <main className="wrap" style={{ textAlign: 'center', paddingBlock: '8rem 5rem' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', marginBottom: '1rem' }}>404</h1>
        <p style={{ color: 'var(--steel)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Page not found. The gear you're looking for isn't here.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </main>
    </>
  );
}
