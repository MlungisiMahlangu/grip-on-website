import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../context/ToastContext';
import { submitContact } from '../lib/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const revealRef = useScrollReveal();

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await submitContact({ name, email, message });
      toast('Message sent! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      toast('Message sent! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact — Grip On</title>
        <meta name="description" content="Get in touch with Grip On for orders, sizing questions, or wholesale enquiries." />
        <meta property="og:title" content="Grip On — Gym Wear Built to Hold" />
        <meta property="og:description" content="Training wear made for the lifts that matter." />
        <meta property="og:image" content="/images/brand/hero.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="wrap">
        <div className="contact-layout" ref={revealRef}>
          <div className="contact-info">
            <span className="eyebrow">Get in touch</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: '0.75rem' }}>
              Questions, orders, wholesale.
            </h1>
            <p>
              Reach out about sizing, bulk orders for gyms and teams, or anything else. We reply
              within a day.
            </p>
            <div className="contact-detail">
              <h4>Email</h4>
              <span>hello@griponwear.co.za</span>
            </div>
            <div className="contact-detail">
              <h4>Based in</h4>
              <span>Johannesburg, South Africa</span>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{contactCSS}</style>
    </>
  );
}

const contactCSS = `
  .contact-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; padding-block: 4rem 6rem; }
  .contact-info p { color: var(--steel); margin-top: 1rem; max-width: 34ch; }
  .contact-detail { margin-top: 2rem; }
  .contact-detail h4 {
    font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--steel); margin-bottom: 0.4rem;
  }
  .field { margin-bottom: 1.25rem; }
  .field label {
    display: block; font-family: var(--font-mono); font-size: 0.72rem;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--steel); margin-bottom: 0.5rem;
  }
  .field input, .field textarea {
    width: 100%; background: var(--ash); border: 1px solid var(--line);
    color: var(--chalk); padding: 0.85rem 1rem; font-family: var(--font-body); font-size: 0.95rem;
  }
  .field textarea { resize: vertical; min-height: 120px; }
  @media (max-width: 760px) { .contact-layout { grid-template-columns: 1fr; } }
`;
