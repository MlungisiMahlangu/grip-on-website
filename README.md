# Grip On

Premium, production-ready e-commerce rebuild for Grip On, a South African gym-apparel brand.

**Status: Phase 7 — launch polish built.** The storefront, COD checkout, admin back office and operations layer are live. Phase 7 adds sitemap, robots, a Google Merchant feed, legal pages, keep-alive monitoring, and the accessibility, performance and SEO pass. The final build is verified; the only remaining external step is buying and pointing the production domain.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS 4
- Motion (Framer Motion)
- Zustand (persisted cart and wishlist)
- Supabase (Postgres, Auth, Storage, RLS, RPCs) — schema, typed clients and seed in Phase 2
- Zod, React Hook Form, Resend, lucide-react
- Target deployment: Netlify (also Vercel / Cloudflare Pages)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs on **http://localhost:3000**, matching the Supabase Auth Site URL for local development.

| Script | Purpose |
|---|---|
| `npm run dev` | Start development on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3000 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:seed` | Upload images and seed the Supabase catalogue |
| `npm run format` | Prettier |

## What is built (Phase 1)

- Design tokens and typography: near-black, bone, editorial light sections, orange accent (`#FF6A00`), Anton + Inter Tight + JetBrains Mono.
- Brand artwork: traced lowercase `wordmark.svg`, overhead-press `logo-lifter.svg`, app icon.
- Announcement bar, sticky/condensing header, desktop collections mega menu, full-screen mobile menu.
- Cart drawer shell with focus trap and empty state.
- Marquee, footer, shared buttons, loading, error and 404 states.
- Responsive homepage foundation: full-bleed hero, manifesto, brand story, value props, community band.
- SEO baseline: metadata, Open Graph, Organization/WebSite JSON-LD, `en-ZA`, one H1.

**Imagery:** the supplied lifestyle shots in `public/media/phase1/` still power the hero, story, community and mega-menu panels. Product photography comes from Supabase Storage.

**Policy pages:** `/privacy`, `/terms` and `/shipping-returns` were added in Phase 7 and are linked from the footer and checkout.

## What is built (Phase 2)

- Migration `supabase/migrations/20261106090000_phase2_foundation.sql`:
  - Profiles with `customer` / `admin` roles, an auth trigger and a backfill for existing users.
  - Collections, products, colours, variants and per-variant stock.
  - Orders, order items, status events, public store settings and private admin settings.
  - `create_order` RPC: locks variants, recalculates prices and delivery on the server, decrements stock, and rejects invalid SA phones, provinces and postal codes.
  - `track_order` RPC: order number plus email or phone, returning only safe customer-facing fields.
  - 22 RLS policies: customers see only their own orders, guests cannot read order tables, only admins write catalogue data.
  - Public `product-images` storage bucket with admin-only uploads.
- Typed Supabase clients for browser, server and service-role contexts, plus database types and a storage URL helper.
- `scripts/seed.mjs`: uploads 67 images, seeds 7 collections, 9 products, 33 colours and 158 variants with fixed low/sold-out stock, writes store settings, and promotes the admin login.

The migration was validated locally against Postgres with 33 checks covering checkout, stock locking, order tracking, guest orders and RLS, then applied to the hosted project. The catalogue and storage bucket are seeded.

### Phase 2 setup

1. **Apply the migration** — in the Supabase dashboard open **SQL Editor**, paste the contents of `supabase/migrations/20261106090000_phase2_foundation.sql`, and run it. Alternatively, with the Supabase CLI logged in and the project linked, run `npx supabase db push`.
2. **Confirm the admin login** — in **Authentication → Users**, confirm the email of the account that should administer the store. Add `ADMIN_EMAIL=...` to `.env.local` if it differs from `OWNER_EMAIL`. If neither is set and the project has exactly one auth user, the seed promotes that user.
3. **Seed the catalogue** — `npm run db:seed`. This creates the storage bucket if the SQL was not run, uploads all product and lifestyle images under `products/` and `lifestyle/`, and writes the catalogue.
4. **Check the result** — the seed prints collection, product, colour, variant and image counts, and tells you which admin was promoted.

Local auth URLs in Supabase should stay at `http://localhost:3000` while developing. Add the production domain to **Site URL** and **Redirect URLs** before launch.

## What is built (Phase 3)

- Catalogue data layer in `src/lib/catalogue/`: one cached, typed Supabase read assembles products, colourways, variants, stock and collections; pure helpers handle search, filtering, sorting and URL params.
- Public catalogue reads use a stateless anon client, so product pages stay SSG/ISR and never touch cookies.
- Routes:
  - `/` — hero/foundation sections plus "New gear" featured products from Supabase.
  - `/shop` — filter by size, colour, collection and price; URL-driven chips that work without JS.
  - `/collections/[slug]` — collection landing with the same filters; unknown slugs return a real 404.
  - `/products/[slug]` — gallery, in-stock colourways only, sold-out sizes disabled, low-stock messaging, details, related products, Product JSON-LD. Statically generated for all 9 products.
  - `/search` — tokenised search over names, descriptions, details and colours.
  - `/wishlist` — persisted locally until accounts ship.
- Product cards swap front to back on hover/focus, show sold-out/low-stock badges and a 44px wishlist control.
- Header search, wishlist and bag icons with live counts; mobile menu quick links; full cart drawer with quantity controls, removal and free-delivery progress.
- Cart and wishlist persist in `localStorage` (Zustand). The bag drawer links straight into checkout.
- Accessibility: 44px tap targets, focus-visible states, `aria-live` stock messages, real 404 statuses, no horizontal overflow at 375px.

## What is built (Phase 4)

- Checkout at `/checkout` — React Hook Form + Zod, mobile-first, three numbered steps (contact, delivery address, payment). SA provinces, 4-digit postal codes and SA mobile formats are validated on the client and again on the server.
- Live order summary reads current variant stock and prices from Supabase; unavailable or low-stock lines are flagged before submit. Delivery is R99, free over R800, recalculated on the server.
- Payment abstraction in `src/lib/payments/` exposes one provider: cash on delivery. "Pay R X in cash on delivery" is shown against the submit button, and card/instant EFT are explicitly marked as not available yet.
- `placeOrder` server action validates the payload, calls the `create_order` RPC (server-side pricing and stock locking), writes an httpOnly `grip-order-access` cookie and sends order emails.
- `/order/[number]` — gated order confirmation. It only renders when the access cookie matches the order number, otherwise it returns a real 404. Shows items, totals, delivery city/province, COD amount and the status timeline.
- `/track-order` — public guest tracking with order number plus email or phone, powered by the `track_order` RPC. Unknown orders return a friendly empty state, not an error.
- Resend order emails: branded customer confirmation and owner notification with escaped user content. If `RESEND_API_KEY` is not set, email is skipped and logged; checkout still succeeds.
- Cart drawer now has a primary **Checkout · R X** action and keeps shopping secondary.
- Verified end to end in an isolated production build: add to cart → checkout → order confirmation → tracking → cleanup. Validation errors are inline and announced; no horizontal overflow at 375px.

### Phase 4 setup (optional email)

Add these to `.env.local` and to the host's environment:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Grip On <orders@yourdomain.co.za>"
OWNER_EMAIL=owner@yourdomain.co.za
```

Without a key, orders are still created and confirmations still render; only the emails are skipped. `RESEND_FROM_EMAIL` must be a verified sender in Resend, and `OWNER_EMAIL` receives the new-order notification.

## What is built (Phase 5)

- Route groups keep the two experiences independent: `(storefront)` wraps the public chrome, `admin/(dashboard)` has its own shell. The 404 page keeps the storefront header and footer.
- `/admin/login` — password sign-in through Supabase Auth. `src/proxy.ts` refreshes the session for every `/admin/*` request and redirects guests to the login page with a `next` parameter. The admin layout and every server action re-check that `profiles.role = 'admin'`, so customers who authenticate are rejected and signed out.
- Admin shell — fixed sidebar on desktop, focus-trapped drawer on mobile, active route states, view-store and sign-out actions.
- Dashboard — orders today, pending fulfilment, 30-day revenue (cancelled excluded), low-stock count, recent orders and a flagged-stock list. Revenue and dates use SAST day boundaries.
- Orders — search by number, name, email, phone or city, status tabs with counts, pagination, and a detail page with items, totals, delivery address, notes, timeline and payment state. Status moves through `pending → confirmed → packed → shipped → delivered`, or cancels from any open state. Invalid transitions are rejected on the server; cancelling returns stock to inventory; delivered marks COD as paid; each change writes an `order_events` row and sends a status email when Resend is configured.
- Products — create/edit the product shell (name, slug, tagline, description, detail lines, price, compare-at price, type, collections), feature/archive toggles, and full colourway management. Each colourway carries hex, front/back/gallery images, per-size stock and generated SKUs (`GO-{PRODUCT}-{COLOUR}-{SIZE}`).
- Image uploads go straight from the browser to the `product-images` bucket using the anon key plus storage RLS. Only storage paths are saved; `mediaUrl()` resolves public URLs. Uploads are limited to webp/jpeg/png/avif and 10MB.
- Collections — create, edit, archive and restore, with image upload and storefront ordering.
- Inventory — every variant with level filters (all/low/out), search, and inline stock updates.
- Realtime — the orders list and detail subscribe to `orders` and `order_events` and refresh with a debounce. The header shows the connection state and a manual refresh button.
- Product pages are now rendered on demand for slugs added after a build (`dynamicParams = true` with 60s revalidation), so a new product in the admin goes live without a redeploy.
- Verified end to end against the hosted database: guest rejected from admin, temporary admin sign-in, dashboard, order status flow including cancellation restock, product + colourway creation with a real storage upload, collection create/edit/archive, inventory update, mobile layouts at 375px with no horizontal overflow. All test data, uploads and the temporary admin were removed afterwards.

### Phase 5 setup

1. **Apply the realtime migration** — in the Supabase dashboard open **SQL Editor**, paste `supabase/migrations/20261106120000_phase5_realtime.sql`, and run it. It adds `orders` and `order_events` to the `supabase_realtime` publication; existing RLS still applies. Until this runs, the admin works but live refresh stays quiet (use the refresh button).
2. **Create the admin account** — in **Authentication → Users**, add a user with email and password, then in **SQL Editor** promote it:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@yourdomain.co.za');
   ```

   A trigger creates the profile row on sign-up. Do not store the password in the repo or in chat; rotate it if it has ever been shared.
3. **URL configuration** — Site URL `http://localhost:3000` for development, and add `http://localhost:3000/**` to Redirect URLs. Add the production domain when deploying.
4. Sign in at `/admin/login`. Customers cannot reach the area.

## What is built (Phase 6)

- Migration `supabase/migrations/20261106130000_phase6_operations.sql`:
  - `discount_codes` and `discount_redemptions`, with uppercase code check, percent/fixed value, minimum spend, SAST start/end window, redemption cap and active flag.
  - `contact_messages` (new/read/archived) and `subscribers` (checkout/contact/admin/footer sources).
  - `customer_summaries` as a `security_invoker` view over `orders`, so guest checkouts and registered customers appear together with order count, lifetime spend and last order.
  - `orders.discount_code` and `orders.discount_cents`, plus settings `maintenance_mode` / `maintenance_message`.
  - `validate_discount` for checkout previews, `create_order` rewritten to lock the discount row, validate the window/minimum/cap, price delivery on the discounted subtotal and write a redemption; cancelling an order releases the redemption and decrements `times_redeemed`.
  - `subscribe_email` and `submit_contact_message` RPCs so public writes never touch a privileged key.
- Admin discounts — list with search, status badges (active, scheduled, expired, paused, redeemed), redemption counts, pause/activate, and a create/edit form with SAST datetime inputs.
- Checkout — a discount field in the order summary. Codes are previewed through `validate_discount` and re-validated on the server inside `create_order`; the summary shows the discount line, recalculates delivery on the discounted subtotal, and blocks submit if a re-added item drops the bag below the minimum.
- Customers — searchable list from `customer_summaries` and a detail page with spend, discounts, order history, contact details and latest delivery address.
- Messages — the public `/contact` form persists to `contact_messages`, notifies the owner via Resend when configured, supports optional newsletter opt-in, and appears in the admin with status filters, read/archive controls and a reply link.
- Subscribers — admin list with active/inactive filters, manual add, pause/resume and CSV export; checkout and contact opt-ins feed the same table.
- Settings — announcement bar, accent colour (with computed readable `--accent-ink`), free-delivery threshold, delivery fee, contact email, Instagram link, maintenance mode/message and the stored admin WhatsApp number. Saving revalidates the whole storefront.
- Maintenance mode — the storefront shell is replaced by a standalone message; `/track-order` and `/order/*` stay available so existing customers can follow deliveries, and `create_order` rejects new orders server-side.
- Admin users — role tabs, search, promote/demote with a self-demote guard, and an invite flow through Supabase Auth email. Invited admins land on `/accept-invite`, set their own password and continue to `/admin`.
- New storefront pages: `/contact` (form first, direct details second) and `/about` (real brand story, no invented team or numbers). Both use the configured accent, email and Instagram.
- Footer, announcement bar, cart drawer and product page read delivery/contact details from settings instead of hard-coded constants.

### Phase 6 setup

1. **Apply the operations migration** — in the Supabase dashboard open **SQL Editor**, paste `supabase/migrations/20261106130000_phase6_operations.sql`, and run it. If Phase 5's realtime migration has not run yet, apply `20261106120000_phase5_realtime.sql` too.
2. **Redirect URLs** — keep `http://localhost:3000/**` (and the production domain) in **Authentication → URL Configuration**. The admin invite email redirects to `/accept-invite`.
3. **Admin invites and roles** — `SUPABASE_SERVICE_ROLE_KEY` must be set server-side for `inviteUserByEmail` and profile role updates. It never reaches the browser. Without it, invites and role changes return a configuration error.
4. **Contact notifications** — reuse `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `OWNER_EMAIL` from Phase 4. Without them, messages still save to the admin inbox; only the owner email is skipped.
5. **Verification** — typecheck, lint and production build pass. The hosted database was exercised end to end after the migration: discount create → checkout apply → order with server-priced discount and redemption → admin order detail; contact form → admin inbox → read/archive; checkout and contact subscribe → admin list and CSV export; settings save → announcement, accent and maintenance gate → revert; invite link → password set → admin sign-in and promote/demote. Test orders, stock, codes, subscribers, messages and temporary admins were removed afterwards.
6. **Email delivery** — Resend is wired for order, status and contact notifications. `griponwear.co.za` is the intended domain but is not owned yet, so the account still sends through `onboarding@resend.dev`; in that mode Resend only delivers to the account owner and logs a failure for other recipients. Orders and messages still save. Once the domain is purchased and verified in Resend, set `RESEND_FROM_EMAIL` to an address on it.

## What is built (Phase 7)

- **Sitemap and robots** — `/sitemap.xml` lists the home, shop, about, contact, track-order and legal pages plus every active collection and product. It regenerates hourly and uses each product's `updated_at` as `lastModified`. `/robots.txt` allows the storefront and disallows `/admin`, `/api/`, `/checkout`, `/order/`, `/accept-invite`, `/search` and `/wishlist`.
- **Google Merchant feed** — `/google-merchant.xml` is an RSS 2.0 feed with the `g:` namespace, one item per active variant (158 currently). Each item carries SKU, item group, product link, primary and secondary images, ZAR price (with `sale_price` when a compare-at price exists), availability, brand, colour, size, condition and Google product category. It regenerates hourly.
- **Legal pages** — `/privacy`, `/terms` and `/shipping-returns` are real, honest South African pages: POPIA rights and retention, CPA/ECTA rights, COD rules, the live delivery fee and threshold, 14-day returns and faulty-item handling. They share a compact `LegalPage` layout, sit in the footer's Legal column and are linked from the checkout acknowledgment copy. The page copy is plain-language and does not invent a registration number, physical address or policy that the store cannot honour.
- **SEO polish** — canonical URLs on every indexable page, `formatDetection` disabled for phone/email/address auto-linking, Supabase Storage preconnect and DNS prefetch, and the existing Organization/WebSite and Product structured data retained. Product and collection metadata still supply their own canonical and OG image.
- **Accessibility** — axe-core WCAG 2.1 A/AA audits run against the storefront (home, shop, product, checkout, contact, about, track-order, all legal pages) and the full admin area. Fixes include the bag count badge being removed from the accessible name, count-badge contrast on admin filters, a single primary heading on the admin sign-in page, and hints now linked to fields with `aria-describedby`. Buttons and links remain 44px minimum, focus is trapped in the cart/menu dialogs, and reduced-motion is respected by both Motion and the CSS animation layer.
- **Performance** — the sitemap and feed are ISR routes, catalogue reads remain cached and cookie-free, product images keep explicit `sizes`, the hero keeps `fetchPriority="high"`, and storage is preconnected before product images load. No page overflows horizontally at 375px.
- **Keep-alive** — `/api/keep-alive` runs a lightweight read against the public `settings` table. When `KEEP_ALIVE_TOKEN` is set, the route requires `Authorization: Bearer <token>`. `.github/workflows/keep-alive.yml` pings it daily at 06:00 UTC so a free Supabase project does not pause after seven quiet days. The endpoint returns JSON and is never cached.

### Phase 7 setup

1. **Production URL** — set `NEXT_PUBLIC_SITE_URL` to the live origin (for example `https://griponwear.co.za` once the domain is bought). Sitemap, robots, canonical URLs and the feed all derive from it. Until then, local development can keep `http://localhost:3000`.
2. **Keep-alive** — set `KEEP_ALIVE_TOKEN` in the hosting environment. In GitHub, add the repository variable `SITE_URL` (the deployed origin) and the secret `KEEP_ALIVE_TOKEN` with the same value. Run the workflow manually once to confirm it returns `{"ok":true}`. Leave the token unset only if you are comfortable with a public read-only health check.
3. **Search engines** — submit `${NEXT_PUBLIC_SITE_URL}/sitemap.xml` in Google Search Console and Bing Webmaster Tools after the domain resolves.
4. **Google Merchant Center** — add the store, then submit `${NEXT_PUBLIC_SITE_URL}/google-merchant.xml` as a scheduled feed (daily is enough; the route refreshes hourly). Shipping and return settings belong in Merchant Center and should match `/shipping-returns`.
5. **Resend** — leave the test sender until `griponwear.co.za` is purchased and verified. Update `RESEND_FROM_EMAIL` at that point; no code changes are needed.
6. **Verification** — `npm run typecheck`, `npm run lint` and `npm run build` pass. The feed and sitemap were parsed as valid XML (158 unique feed items, 24 sitemap URLs), `/robots.txt`, `/api/keep-alive` and both XML routes returned 200, and browser checks at 1440px and 375px showed no horizontal overflow or console errors. Axe reported no WCAG A/AA violations after the fixes above.

## Architecture

```text
src/
  app/                 App Router routes, global CSS, metadata, error states
    (storefront)/      Public storefront inside the shared site chrome
    (auth)/            Invite acceptance, outside the admin proxy
    admin/             Login, then the gated dashboard route group
    api/keep-alive/    Read-only database ping for scheduled uptime checks
    google-merchant.xml/  RSS 2.0 product feed for Merchant Center
    robots.ts          Crawl rules and sitemap pointer
    sitemap.ts         ISR sitemap from static routes and the catalogue
  components/
    admin/             Shell, forms, uploader, status controls, realtime refresh, UI primitives
    auth/              Accept-invite password form
    brand/             Wordmark + lifter mark
    cart/              Cart drawer with quantity controls
    catalogue/         Product cards, grids, filters, search, wishlist, product view
    checkout/          Checkout form, discount field and live order summary
    contact/           Contact form
    orders/            Shared order items/timeline cards and track-order form
    layout/            Announcement bar, header, menus, footer, legal layout, maintenance gate
    providers/         Motion config and storefront settings context
    ui/                Shared button styling and form fields
  hooks/               Focus trap / dialog behaviour, hydration detection
  lib/
    admin/             Admin auth, queries, validation schemas and server actions
    catalogue/         Catalogue queries, filtering, sorting and URL params
    checkout/          Checkout schema, discount preview and server actions
    contact/           Contact validation and submission
    email/             Resend order, status and contact emails
    orders/            Order access cookie, tracking, settings, formatting
    payments/          Payment provider abstraction (COD)
    supabase/          Browser, server, public and admin clients; types; media URLs
    color.ts           Accent contrast helper
    env.ts             Validated public environment
    fonts.ts           Font variables
    site.ts            Navigation and store constants
    utils.ts           Class and currency helpers
  proxy.ts             Admin session refresh and guest redirect
  store/               Persisted cart and wishlist, UI state
public/
  brand/               SVG brand assets
  media/phase1/        Temporary review imagery
scripts/
  seed.mjs             Uploads assets and seeds the catalogue
supabase/
  migrations/          Schema, RLS, RPCs, storage policies, realtime publication
```

The final data flow is server-first: Supabase reads in Server Components, every write through server actions or route handlers, and all prices, stock and discounts recalculated on the server. The service role key never reaches the browser.

## Roadmap

1. **Foundations — done**
2. **Backend — migrated and seeded**
3. **Storefront catalogue — done**
4. **Cart, checkout, COD orders, emails, confirmation, track order — done**
5. **Admin: auth, dashboard, orders + realtime, products + image uploader, collections, inventory — done**
6. **Admin: discounts, customers, messages, subscribers, settings, maintenance, admin users — done**
7. **Polish: motion, accessibility, performance, SEO, sitemap, Google feed, legal pages, docs, keep-alive — done**

## Design notes

- The accent is intentionally **orange**, not the lime suggested in the brief; lime has been rejected repeatedly and orange is the established Grip On direction. It is a single CSS variable (`--accent`) and can be changed in admin settings. The matching text colour (`--accent-ink`) is computed from the accent's luminance so buttons keep readable contrast.
- Copy uses "we/our", never a single founder.
- No fake reviews, stats, team members or placeholder pages.

## Assets and environment

- `grip-on-assets/` is the supplied source pack (67 referenced WebP images + `manifest.json`). It is not served by the app. `npm run db:seed` uploads it to the public `product-images` bucket; the original folder can stay out of the bundle.
- `.env.local` holds the real project URL and keys and is git-ignored. `.env.example` contains placeholders only. The service-role key is server-only and must never be exposed to the browser.
- The dev server uses port 3000 so it matches the local Supabase Auth redirect configuration.
