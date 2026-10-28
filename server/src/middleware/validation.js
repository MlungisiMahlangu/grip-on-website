import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.number().int().positive(),
  size: z.string().min(1),
  qty: z.number().int().positive(),
});

export const orderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(1, 'Message is required'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email'),
});
