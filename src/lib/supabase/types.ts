export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type ProductType = "tee" | "hoodie" | "tank" | "bottoms" | "accessory";
export type GarmentSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONE_SIZE";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "cod";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type DiscountKind = "percent" | "fixed";
export type ContactMessageStatus = "new" | "read" | "archived";
export type SubscriberSource = "checkout" | "contact" | "admin" | "footer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  details: string[];
  price_cents: number;
  compare_at_price_cents: number | null;
  product_type: ProductType;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductCollection = {
  product_id: string;
  collection_id: string;
  sort_order: number;
};

export type ProductColour = {
  id: string;
  product_id: string;
  slug: string;
  name: string;
  hex: string;
  front_image_path: string | null;
  back_image_path: string | null;
  gallery_paths: string[];
  is_active: boolean;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  colour_id: string;
  size: GarmentSize;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  delivery_notes: string | null;
  subtotal_cents: number;
  discount_code: string | null;
  discount_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  colour_name: string;
  size: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  image_path: string | null;
  created_at: string;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type StoreSettings = {
  id: boolean;
  accent_hex: string;
  announcement_text: string;
  free_delivery_threshold_cents: number;
  delivery_fee_cents: number;
  contact_email: string;
  instagram_url: string | null;
  maintenance_mode: boolean;
  maintenance_message: string;
  updated_at: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  kind: DiscountKind;
  value: number;
  min_subtotal_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  max_redemptions: number | null;
  times_redeemed: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DiscountRedemption = {
  id: string;
  discount_id: string;
  order_id: string;
  code: string;
  amount_cents: number;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  source: SubscriberSource;
  is_active: boolean;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerSummary = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  city: string;
  province: string;
  order_count: number;
  total_spent_cents: number;
  discount_total_cents: number;
  first_order_at: string;
  last_order_at: string;
};

export type AdminSettings = {
  id: boolean;
  whatsapp_number: string | null;
  updated_at: string;
};

export type CreatedOrder = {
  order_id: string;
  order_number: string;
  total_cents: number;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Profile,
        {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
      >;
      collections: Table<
        Collection,
        {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image_path?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        },
        Partial<Omit<Collection, "id" | "created_at">>
      >;
      products: Table<
        Product,
        {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          details?: string[];
          price_cents: number;
          compare_at_price_cents?: number | null;
          product_type: ProductType;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Product, "id" | "created_at">>
      >;
      product_collections: Table<
        ProductCollection,
        {
          product_id: string;
          collection_id: string;
          sort_order?: number;
        },
        Partial<ProductCollection>
      >;
      product_colours: Table<
        ProductColour,
        {
          id?: string;
          product_id: string;
          slug: string;
          name: string;
          hex: string;
          front_image_path?: string | null;
          back_image_path?: string | null;
          gallery_paths?: string[];
          is_active?: boolean;
          sort_order?: number;
        },
        Partial<Omit<ProductColour, "id" | "product_id">>
      >;
      product_variants: Table<
        ProductVariant,
        {
          id?: string;
          product_id: string;
          colour_id: string;
          size: GarmentSize;
          sku: string;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
        },
        Partial<Omit<ProductVariant, "id" | "created_at">>
      >;
      orders: Table<
        Order,
        {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          address_line1: string;
          address_line2?: string | null;
          suburb: string;
          city: string;
          province: string;
          postal_code: string;
          delivery_notes?: string | null;
          subtotal_cents: number;
          discount_code?: string | null;
          discount_cents?: number;
          delivery_fee_cents: number;
          total_cents: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Order, "id" | "created_at">>
      >;
      order_items: Table<
        OrderItem,
        {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          colour_name: string;
          size: string;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          image_path?: string | null;
          created_at?: string;
        },
        Partial<Omit<OrderItem, "id" | "created_at">>
      >;
      order_events: Table<
        OrderEvent,
        {
          id?: string;
          order_id: string;
          status: OrderStatus;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        },
        Partial<Omit<OrderEvent, "id" | "created_at">>
      >;
      settings: Table<
        StoreSettings,
        {
          id?: boolean;
          accent_hex?: string;
          announcement_text?: string;
          free_delivery_threshold_cents?: number;
          delivery_fee_cents?: number;
          contact_email?: string;
          instagram_url?: string | null;
          maintenance_mode?: boolean;
          maintenance_message?: string;
          updated_at?: string;
        },
        Partial<Omit<StoreSettings, "id">>
      >;
      admin_settings: Table<
        AdminSettings,
        {
          id?: boolean;
          whatsapp_number?: string | null;
          updated_at?: string;
        },
        Partial<Omit<AdminSettings, "id">>
      >;
      discount_codes: Table<
        DiscountCode,
        {
          id?: string;
          code: string;
          description?: string | null;
          kind: DiscountKind;
          value: number;
          min_subtotal_cents?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          max_redemptions?: number | null;
          times_redeemed?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<DiscountCode, "id" | "created_at">>
      >;
      discount_redemptions: Table<
        DiscountRedemption,
        {
          id?: string;
          discount_id: string;
          order_id: string;
          code: string;
          amount_cents: number;
          created_at?: string;
        },
        Partial<Omit<DiscountRedemption, "id" | "created_at">>
      >;
      contact_messages: Table<
        ContactMessage,
        {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: ContactMessageStatus;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<ContactMessage, "id" | "created_at">>
      >;
      subscribers: Table<
        Subscriber,
        {
          id?: string;
          email: string;
          source?: SubscriberSource;
          is_active?: boolean;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Subscriber, "id" | "created_at">>
      >;
    };
    Views: {
      customer_summaries: {
        Row: CustomerSummary;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      can_access_order: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
      create_order: {
        Args: { payload: Json };
        Returns: CreatedOrder[];
      };
      track_order: {
        Args: { p_order_number: string; p_contact: string };
        Returns: Json;
      };
      validate_discount: {
        Args: { p_code: string; p_subtotal_cents: number };
        Returns: Json;
      };
      subscribe_email: {
        Args: { p_email: string; p_source: string };
        Returns: Json;
      };
      submit_contact_message: {
        Args: {
          p_name: string;
          p_email: string;
          p_phone: string | null;
          p_subject: string;
          p_message: string;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      product_type: ProductType;
      garment_size: GarmentSize;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
