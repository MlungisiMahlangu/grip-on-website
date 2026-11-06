import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { searchTerm } from "@/lib/admin/queries";
import type {
  AdminSettings,
  ContactMessage,
  ContactMessageStatus,
  CustomerSummary,
  DiscountCode,
  Order,
  Profile,
  StoreSettings,
  Subscriber,
  UserRole,
} from "@/lib/supabase/types";

export const DISCOUNTS_PER_PAGE = 25;
export const CUSTOMERS_PER_PAGE = 25;
export const MESSAGES_PER_PAGE = 20;
export const SUBSCRIBERS_PER_PAGE = 50;
export const USERS_PER_PAGE = 50;

const uuidSchema = z.uuid();

export type DiscountListResult = {
  discounts: DiscountCode[];
  count: number;
  page: number;
  pageCount: number;
};

export async function getAdminDiscounts(filters: {
  query?: string;
  page?: number;
}): Promise<DiscountListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * DISCOUNTS_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("discount_codes")
    .select("*", { count: "exact" })
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (term) query = query.or(`code.ilike.%${term}%,description.ilike.%${term}%`);

  const { data, error, count } = await query.range(from, from + DISCOUNTS_PER_PAGE - 1);
  if (error) throw new Error(`Discount query failed: ${error.message}`);

  const total = count ?? 0;

  return {
    discounts: data ?? [],
    count: total,
    page,
    pageCount: Math.max(1, Math.ceil(total / DISCOUNTS_PER_PAGE)),
  };
}

export async function getAdminDiscount(id: string): Promise<DiscountCode | null> {
  if (!uuidSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export type CustomerListResult = {
  customers: CustomerSummary[];
  count: number;
  page: number;
  pageCount: number;
};

export async function getAdminCustomers(filters: {
  query?: string;
  page?: number;
}): Promise<CustomerListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * CUSTOMERS_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("customer_summaries")
    .select("*", { count: "exact" })
    .order("last_order_at", { ascending: false });

  if (term) {
    query = query.or(
      [
        `email.ilike.%${term}%`,
        `first_name.ilike.%${term}%`,
        `last_name.ilike.%${term}%`,
        `city.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query.range(from, from + CUSTOMERS_PER_PAGE - 1);
  if (error) throw new Error(`Customer query failed: ${error.message}`);

  const total = count ?? 0;

  return {
    customers: data ?? [],
    count: total,
    page,
    pageCount: Math.max(1, Math.ceil(total / CUSTOMERS_PER_PAGE)),
  };
}

export type CustomerDetail = {
  summary: CustomerSummary;
  orders: Order[];
};

export async function getAdminCustomer(emailParam: string): Promise<CustomerDetail | null> {
  const email = emailParam.trim().toLowerCase();
  if (!z.email().safeParse(email).success) return null;

  const supabase = await createClient();
  const [summaryResult, ordersResult] = await Promise.all([
    supabase.from("customer_summaries").select("*").eq("email", email).maybeSingle(),
    supabase
      .from("orders")
      .select("*")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false }),
  ]);

  if (summaryResult.error) throw new Error(summaryResult.error.message);
  if (!summaryResult.data) return null;
  if (ordersResult.error) throw new Error(ordersResult.error.message);

  return {
    summary: summaryResult.data,
    orders: ordersResult.data ?? [],
  };
}

const MESSAGE_STATUSES: ContactMessageStatus[] = ["new", "read", "archived"];

export type MessageListResult = {
  messages: ContactMessage[];
  count: number;
  page: number;
  pageCount: number;
  statusCounts: Record<ContactMessageStatus, number>;
};

export async function getAdminMessages(filters: {
  status?: ContactMessageStatus | "all";
  query?: string;
  page?: number;
}): Promise<MessageListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * MESSAGES_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (term) {
    query = query.or(
      [
        `name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `subject.ilike.%${term}%`,
        `message.ilike.%${term}%`,
      ].join(","),
    );
  }

  const [listResult, newResult, readResult, archivedResult] = await Promise.all([
    query.range(from, from + MESSAGES_PER_PAGE - 1),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "read"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
  ]);

  const failed = [listResult, newResult, readResult, archivedResult].find((result) => result.error);
  if (failed?.error) throw new Error(`Message query failed: ${failed.error.message}`);

  const total = listResult.count ?? 0;

  return {
    messages: listResult.data ?? [],
    count: total,
    page,
    pageCount: Math.max(1, Math.ceil(total / MESSAGES_PER_PAGE)),
    statusCounts: {
      new: newResult.count ?? 0,
      read: readResult.count ?? 0,
      archived: archivedResult.count ?? 0,
    },
  };
}

export async function getAdminMessage(id: string): Promise<ContactMessage | null> {
  if (!uuidSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export type SubscriberListResult = {
  subscribers: Subscriber[];
  count: number;
  page: number;
  pageCount: number;
  activeCount: number;
  inactiveCount: number;
};

export async function getAdminSubscribers(filters: {
  status?: "all" | "active" | "inactive";
  query?: string;
  page?: number;
}): Promise<SubscriberListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * SUBSCRIBERS_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);
  if (term) query = query.ilike("email", `%${term}%`);

  const [listResult, activeResult, inactiveResult] = await Promise.all([
    query.range(from, from + SUBSCRIBERS_PER_PAGE - 1),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("is_active", false),
  ]);

  const failed = [listResult, activeResult, inactiveResult].find((result) => result.error);
  if (failed?.error) throw new Error(`Subscriber query failed: ${failed.error.message}`);

  const total = listResult.count ?? 0;

  return {
    subscribers: listResult.data ?? [],
    count: total,
    page,
    pageCount: Math.max(1, Math.ceil(total / SUBSCRIBERS_PER_PAGE)),
    activeCount: activeResult.count ?? 0,
    inactiveCount: inactiveResult.count ?? 0,
  };
}

export type SettingsBundle = {
  settings: StoreSettings | null;
  admin: AdminSettings | null;
};

export async function getAdminSettingsBundle(): Promise<SettingsBundle> {
  const supabase = await createClient();
  const [settingsResult, adminResult] = await Promise.all([
    supabase.from("settings").select("*").eq("id", true).maybeSingle(),
    supabase.from("admin_settings").select("*").eq("id", true).maybeSingle(),
  ]);

  if (settingsResult.error) throw new Error(settingsResult.error.message);
  if (adminResult.error) throw new Error(adminResult.error.message);

  return { settings: settingsResult.data, admin: adminResult.data };
}

export type AdminUserListResult = {
  profiles: Profile[];
  count: number;
  page: number;
  pageCount: number;
  adminCount: number;
  customerCount: number;
};

export async function getAdminUsers(filters: {
  query?: string;
  role?: UserRole | "all";
  page?: number;
}): Promise<AdminUserListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * USERS_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("role", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters.role && filters.role !== "all") query = query.eq("role", filters.role);

  if (term) {
    query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  }

  const [listResult, adminResult, customerResult] = await Promise.all([
    query.range(from, from + USERS_PER_PAGE - 1),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
  ]);

  const failed = [listResult, adminResult, customerResult].find((result) => result.error);
  if (failed?.error) throw new Error(`User query failed: ${failed.error.message}`);

  const total = listResult.count ?? 0;

  return {
    profiles: listResult.data ?? [],
    count: total,
    page,
    pageCount: Math.max(1, Math.ceil(total / USERS_PER_PAGE)),
    adminCount: adminResult.count ?? 0,
    customerCount: customerResult.count ?? 0,
  };
}

export { MESSAGE_STATUSES };
