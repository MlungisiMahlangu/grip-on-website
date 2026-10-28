# Grip On — Gym Wear E-Commerce

Modern React + Express e-commerce site migrated from the static HTML/CSS/JS site in `/docs`.

## Tech Stack

- **Frontend**: React 18, React Router 6, Vite, react-helmet-async
- **Backend**: Node.js, Express 4, Zod (validation), Helmet, CORS, Rate Limiting
- **Deployment**: Vercel (monorepo with serverless API functions)

## Project Structure

```
grip-on/
├── client/                  # React 18 + Vite
│   ├── src/
│   │   ├── components/      # Header, Footer, ProductCard, etc.
│   │   ├── pages/           # Home, Shop, Product, Cart, About, Contact
│   │   ├── context/         # CartContext, ToastContext
│   │   ├── hooks/           # useProducts, useDebounce, useScrollReveal
│   │   ├── lib/api.js       # Fetch wrapper for /api/*
│   │   ├── styles/          # Global CSS (style.css, home.css)
│   │   └── config.js        # Brand config (WhatsApp, Instagram, etc.)
│   └── public/images/       # Static assets
├── server/                  # Express API
│   └── src/
│       ├── app.js           # Express app (exported, no listen)
│       ├── index.js         # Local dev entry (listen on PORT)
│       ├── routes/          # products, orders, contact
│       ├── services/        # productService (repository layer)
│       ├── data/            # Product data (swap for DB later)
│       └── middleware/      # Error handler, validation schemas
├── api/index.js             # Vercel serverless entry
└── vercel.json              # Build + routing config
```

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and Express API (port 4000) concurrently.

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

## Build

```bash
npm run build
```

Output: `client/dist/`

## Environment Variables

Copy `.env.example` to `.env` and adjust:

| Variable | Description |
|---|---|
| `PORT` | Server port (default 4000) |
| `CLIENT_ORIGIN` | CORS origin for local dev |
| `NODE_ENV` | `development` or `production` |
| `VITE_WHATSAPP` | WhatsApp number for checkout |
| `VITE_INSTAGRAM` | Instagram profile URL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List products (?category=, ?q=, ?sort=) |
| GET | `/api/products/categories` | List categories |
| GET | `/api/products/:id` | Single product |
| POST | `/api/orders` | Create order (validates + recalculates total) |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/contact/newsletter` | Subscribe to newsletter |

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial migration to React + Express"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repo
3. Vercel auto-detects the settings from `vercel.json`
4. Click **Deploy**

### 3. Connect Custom Domain

1. In your Vercel project → **Settings** → **Domains**
2. Add your domain (e.g. `griponwear.co.za`)
3. Update DNS records as shown:
   - **Type**: A or CNAME
   - **Value**: provided by Vercel
4. Wait for DNS propagation (up to 24h)

## Next Steps

- [ ] **Database**: Replace `server/src/data/products.js` with MongoDB/PostgreSQL via the service layer
- [ ] **Admin panel**: CRUD for products and orders
- [ ] **Payments**: Integrate PayFast or Yoco for card payments alongside WhatsApp checkout
- [ ] **Image optimisation**: Use Vercel Image Optimization or Cloudinary
- [ ] **Performance**: Add React.lazy() for route-based code splitting
- [ ] **Testing**: Add Vitest for unit tests, Playwright for E2E

## Data Fixes Applied During Migration

| ID | Issue | Fix |
|---|---|---|
| 7 | `colour: "PEACH"` but image is `hoodie-charcoal.jpg` | Changed to `"Charcoal"` |
| 11 | `colour: "RED"` but image is `bottle-black.jpg` | Changed to `"Black"` |
| 12 | `colour: "WHITE"` but image is `bottle-pink.jpg` | Changed to `"Pink"` |

## Legacy

The original static site is preserved in `/docs`. It's safe to remove once the new site is verified in production.
