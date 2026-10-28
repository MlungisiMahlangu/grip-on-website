import { Link } from 'react-router-dom';
import { BRAND } from '../config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h4>Grip On</h4>
            <p>Gym wear built to hold. Designed and tested by people who actually train.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/shop">All products</Link>
            <Link to="/shop?category=shirts">Shirts</Link>
            <Link to="/shop?category=hoodies">Hoodies</Link>
            <Link to="/shop?category=accessories">Accessories</Link>
          </div>
          <div>
            <h4>Info</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div>
            <h4>Follow</h4>
            <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 {BRAND.name}</span>
          <span>{BRAND.location}</span>
          <span>
            Designed & built by {BRAND.designer} · {BRAND.designerPhone}
          </span>
        </div>
      </div>
    </footer>
  );
}
