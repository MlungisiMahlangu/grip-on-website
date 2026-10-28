// Fetch wrapper for /api/* endpoints.

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.q) qs.set('q', params.q);
  if (params.sort) qs.set('sort', params.sort);
  const query = qs.toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

export function fetchProduct(id) {
  return request(`/products/${id}`);
}

export function fetchCategories() {
  return request('/products/categories');
}

export function createOrder(body) {
  return request('/orders', { method: 'POST', body: JSON.stringify(body) });
}

export function submitContact(body) {
  return request('/contact', { method: 'POST', body: JSON.stringify(body) });
}

export function submitNewsletter(body) {
  return request('/contact/newsletter', { method: 'POST', body: JSON.stringify(body) });
}
