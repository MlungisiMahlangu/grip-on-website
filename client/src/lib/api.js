// Fetch wrapper for /api/* endpoints with mock data fallback for GitHub Pages.

import * as mockData from './mockData';

const BASE = '/api';
const USE_MOCK = import.meta.env.PROD && !import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  // Use mock data if no API is available
  if (USE_MOCK) {
    return mockRequest(path, options);
  }

  const apiUrl = import.meta.env.VITE_API_URL || BASE;
  const res = await fetch(`${apiUrl}${path}`, {
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

async function mockRequest(path, options = {}) {
  // Mock API responses for GitHub Pages
  if (path.startsWith('/products') && options.method !== 'POST') {
    if (path === '/products/categories') {
      return mockData.fetchCategories();
    }
    if (path === '/products') {
      return mockData.fetchProducts();
    }
    const idMatch = path.match(/\/products\/(\d+)/);
    if (idMatch) {
      return mockData.fetchProduct(idMatch[1]);
    }
    // Handle query params
    const url = new URL(path, 'http://localhost');
    const params = Object.fromEntries(url.searchParams);
    return mockData.fetchProducts(params);
  }
  if (path === '/orders' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    return mockData.createOrder(body);
  }
  if (path === '/contact' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    return mockData.submitContact(body);
  }
  return {};
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
