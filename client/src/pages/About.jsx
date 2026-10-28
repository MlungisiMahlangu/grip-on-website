import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function About() {
  const revealRef = useScrollReveal();

  return (
    <>
      <Helmet>
        <title>About — Grip On</title>
        <meta name="description" content="Grip On is gym wear made by people who train. Learn the story behind the brand." />
        <meta property="og:title" content="Grip On — Gym Wear Built to Hold" />
        <meta property="og:description" content="Training wear made for the lifts that matter." />
        <meta property="og:image" content="/images/brand/hero.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="wrap">
        <div className="about-hero" ref={revealRef}>
          <span className="eyebrow">About Grip On</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginTop: '0.75rem' }}>
            Made by people who train.
          </h1>
          <p>
            Grip On started on a gym floor, not a design board. We make training wear for the
            moment your hands start to slip and your form is the only thing keeping the set alive.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-media">
            <div className="placeholder-media">
              <img src="/images/brand/Brand1.jpg" alt="Brand / workshop photo" />
            </div>
          </div>
          <div>
            <span className="eyebrow">The idea</span>
            <h2 style={{ fontSize: '1.75rem', margin: '0.75rem 0 1rem' }}>
              No noise. Just gear that holds.
            </h2>
            <p style={{ color: 'var(--steel)', lineHeight: 1.7 }}>
              Every Grip On piece is built around one question: does this help the lift, or is it
              just decoration? That's why the range stays simple, heavyweight cotton for the
              Tshirts, real compression for the tights, and a logo you'll actually want to wear
              outside the gym too.
            </p>
          </div>
        </div>

        <div className="value-list">
          <div className="value-item">
            <span className="value-num">01</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                Tested under load
              </h3>
              <p style={{ color: 'var(--steel)', marginTop: '0.4rem' }}>
                Every fabric is worn through real training blocks before it goes on the site, not
                just modeled.
              </p>
            </div>
          </div>
          <div className="value-item">
            <span className="value-num">02</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                Built to last seasons, not sets
              </h3>
              <p style={{ color: 'var(--steel)', marginTop: '0.4rem' }}>
                Stitching and fabric weight chosen for years of washes, not just good first
                impressions.
              </p>
            </div>
          </div>
          <div className="value-item">
            <span className="value-num">03</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                Small batch, on purpose
              </h3>
              <p style={{ color: 'var(--steel)', marginTop: '0.4rem' }}>
                We'd rather sell out of a colourway than compromise on the fabric to keep it always
                in stock.
              </p>
            </div>
          </div>
        </div>

        <div className="about-grid" style={{ paddingBlock: '3rem 5rem' }}>
          <div>
            <span className="eyebrow">Our mission</span>
            <h2 style={{ fontSize: '1.75rem', margin: '0.75rem 0 1rem' }}>
              Gear that disappears into the work.
            </h2>
            <p style={{ color: 'var(--steel)', lineHeight: 1.7 }}>
              The best training wear is the kind you forget you're wearing. No adjusting, no
              slipping, no distractions. Just you and the bar. That's what we're building at Grip On
              — gear that gets out of your way so you can focus on what matters: the next rep, the
              next set, the next PR.
            </p>
            <p style={{ color: 'var(--steel)', lineHeight: 1.7, marginTop: '1rem' }}>
              We're based in Johannesburg, South Africa, and we ship nationwide. Every order is
              packed by hand and shipped within 2-3 business days.
            </p>
          </div>
          <div className="about-media">
            <div className="placeholder-media">
              <img src="/images/brand/hero2.jpg" alt="Grip On training gear" />
            </div>
          </div>
        </div>

        <section className="statement" style={{ marginTop: '2rem' }}>
          <div className="wrap" style={{ maxWidth: 640 }}>
            <h2>Ready to train in gear that holds?</h2>
            <p>
              Join hundreds of lifters across South Africa who trust Grip On for their toughest
              sessions.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>
              Shop the collection
            </Link>
          </div>
        </section>
      </main>

      <style>{aboutCSS}</style>
    </>
  );
}

const aboutCSS = `
  .about-hero { padding-block: 4rem 3rem; max-width: 46ch; }
  .about-hero p { color: var(--steel); margin-top: 1rem; font-size: 1.05rem; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding-block: 2rem 5rem; }
  .about-media { aspect-ratio: 4/5; background: var(--ash); border: 1px solid var(--line); }
  .about-media img { width: 100%; height: 100%; object-fit: cover; }
  .value-list { display: grid; gap: 1.5rem; padding-block: 2rem 5rem; }
  .value-item {
    display: grid; grid-template-columns: 60px 1fr; gap: 1.25rem;
    padding-block: 1.5rem; border-top: 1px solid var(--line);
  }
  .value-item:last-child { border-bottom: 1px solid var(--line); }
  .value-num { font-family: var(--font-mono); color: var(--grip-blue); }
  @media (max-width: 760px) { .about-grid { grid-template-columns: 1fr; } }
`;
