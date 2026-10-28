import { Router } from 'express';
import { orderSchema } from '../middleware/validation.js';
import { getProductById } from '../services/productService.js';

const router = Router();

// POST /api/orders — validate, recalculate total server-side, return orderId + total.
// TODO: persist orders to a database.
router.post('/', (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { name, phone, address, items } = parsed.data;

  // Recalculate total from server-side product data — never trust client prices.
  let total = 0;
  for (const item of items) {
    const product = getProductById(item.id);
    if (!product) {
      return res.status(400).json({
        error: { message: `Product ${item.id} not found` },
      });
    }
    total += product.price * item.qty;
  }

  const orderId = `GO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Log order (replace with database insert later).
  console.log(`[ORDER] ${orderId} | ${name} | ${phone} | ${address} | ${items.length} items | R${total}`);

  res.status(201).json({ orderId, total });
});

export default router;
