import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { id, name, category, colour, price, image, tag } = product;

  const badge = tag ? (
    <span className={`product-badge product-badge-${tag}`}>
      {tag === 'new' ? 'New' : 'Low stock'}
    </span>
  ) : null;

  return (
    <Link className="product-card" to={`/product/${id}`}>
      <div className="product-card-media">
        {badge}
        <img src={image} alt={`${name} — ${colour}`} />
      </div>
      <div className="product-card-body">
        <div className="product-card-cat">
          {category} · {colour}
        </div>
        <div className="product-card-name">{name}</div>
        <div className="product-card-price price">R{price}</div>
      </div>
    </Link>
  );
}
