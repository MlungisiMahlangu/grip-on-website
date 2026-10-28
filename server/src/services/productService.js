// Product service — thin repository layer.
// Swap this for a database query later without touching routes.

import products from '../data/products.js';

export function getAllProducts({ category, q, sort } = {}) {
  let list = [...products];

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }

  if (q) {
    const query = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.colour.toLowerCase().includes(query),
    );
  }

  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));

  return list;
}

export function getProductById(id) {
  return products.find((p) => p.id === Number(id)) ?? null;
}

export function getCategories() {
  return [...new Set(products.map((p) => p.category))];
}

export function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
