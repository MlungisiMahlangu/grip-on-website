import type {
  DeliveryArea,
  GarmentSize,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/supabase/types";

export type TrackedOrderItem = {
  product_name: string;
  colour_name: string;
  size: GarmentSize;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  image_path: string | null;
};

export type TrackedOrderEvent = {
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

export type TrackedOrder = {
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  subtotal_cents: number;
  discount_code: string | null;
  discount_cents: number;
  delivery_fee_cents: number;
  delivery_area: DeliveryArea;
  delivery_quote_required: boolean;
  total_cents: number;
  customer_first_name: string;
  city: string;
  province: string;
  items: TrackedOrderItem[];
  events: TrackedOrderEvent[];
};
