import { Router } from 'express';
import { getAllProducts, getProductById, getCategories } from '../services/productService.js';

const router = Router();

// GET /api/products — list with optional ?category=, ?q=, ?sort=
router.get('/', (req, res) => {
  const { category, q, sort } = req.query;
  const products = getAllProducts({ category, q, sort });
  res.json(products);
});

// GET /api/products/categories — list distinct categories
router.get('/categories', (_req, res) => {
  res.json(getCategories());
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: { message: 'Product not found' } });
  }
  res.json(product);
});

export default router;
