import { Router } from 'express';
import { contactSchema, newsletterSchema } from '../middleware/validation.js';

const router = Router();

// POST /api/contact — validate and log.
router.post('/', (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { name, email, message } = parsed.data;
  console.log(`[CONTACT] ${name} <${email}>: ${message}`);

  res.json({ ok: true });
});

// POST /api/newsletter — validate and log.
router.post('/newsletter', (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    });
  }

  console.log(`[NEWSLETTER] ${parsed.data.email}`);
  res.json({ ok: true });
});

export default router;
