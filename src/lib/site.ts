import { BUSINESS } from "@/lib/business";

export const SITE = {
  name: BUSINESS.name,
  tagline: "Grip on the work.",
  description:
    "Gym apparel built for the work. Student-founded in Johannesburg, made in small runs and delivered across South Africa.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://griponwear.co.za",
  email: BUSINESS.email,
  phone: BUSINESS.phone,
  location: BUSINESS.location,
  instagram: BUSINESS.instagram.url,
  announcement: "Free delivery in Johannesburg",
  freeDeliveryArea: "Johannesburg",
  deliveryInfo:
    "Free delivery in Johannesburg. Outside Johannesburg, we contact you to confirm the courier cost and options before dispatch.",
} as const;

export const COLLECTIONS = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "The latest gear, fresh off the line.",
  },
  {
    slug: "tees",
    name: "Tees",
    description: "Everyday training tees built to move.",
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    description: "Heavyweight layers for cold starts.",
  },
  {
    slug: "tanks",
    name: "Tanks",
    description: "Cut for the gym, not the mirror.",
  },
  {
    slug: "bottoms",
    name: "Bottoms",
    description: "Shorts that stay out of the way.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "The kit that finishes the session.",
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    description: "The pieces the community keeps coming back for.",
  },
] as const;

export const NAV_ITEMS = [
  { label: "Shop", href: "/shop", mega: false },
  { label: "Collections", href: "/shop", mega: true },
  { label: "Our Story", href: "/about", mega: false },
  { label: "Contact", href: "/contact", mega: false },
] as const;

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "New arrivals", href: "/collections/new-arrivals" },
      { label: "Tees", href: "/collections/tees" },
      { label: "Hoodies", href: "/collections/hoodies" },
      { label: "Bottoms", href: "/collections/bottoms" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Our story", href: "/about" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "Terms of sale", href: "/terms-of-sale" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
] as const;

export const VALUE_PROPS = [
  {
    title: "Nationwide delivery",
    body: "Courier to your door, anywhere in South Africa.",
  },
  {
    title: "Cash on delivery",
    body: "Pay when your order arrives. No card needed.",
  },
  {
    title: "Made to train",
    body: "Heavyweight fabrics and reinforcements where it counts.",
  },
  {
    title: "14-day returns",
    body: "Wrong size? Send it back within 14 days.",
  },
] as const;
