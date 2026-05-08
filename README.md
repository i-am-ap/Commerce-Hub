# Commerce Hub

Commerce Hub is a full-stack multi-role e-commerce platform inspired by Amazon. It includes a React + Vite storefront, an Express + MongoDB API, JWT authentication with refresh tokens in HTTP-only cookies, seller/admin dashboards, live notifications, personalized recommendations, Swagger docs, Docker orchestration, and CI/CD scaffolding.

## Highlights

- Customer flows: browse, search, filter, add to cart, apply coupons, checkout, review products, track orders, and view recommendations.
- Seller flows: upload product images, create products from a dashboard UI, manage inventory, and review seller orders/revenue.
- Admin flows: approve sellers, manage users, and monitor platform analytics.
- Backend features: Redis-backed refresh sessions, Socket.io notifications, optional ElasticSearch integration, Cloudinary uploads, Stripe/Razorpay payment abstraction, Helmet/CORS/rate limiting, and seed data.
- Frontend features: Tailwind + ShadCN-style UI primitives, Redux Toolkit state, React Router navigation, Google Analytics hooks, and responsive dashboards.

## Folder Structure

```text
client/
  src/
    app/
    components/
    features/
    hooks/
    lib/
    pages/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    sockets/
    seed/
docker-compose.yml
nginx/
docs/
```

## Quick Start

1. Install dependencies:

```bash
npm install
npm install --workspace server
npm install --workspace client
```

2. Copy env files:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB and Redis locally, or use Docker.

4. Run the app:

```bash
npm run dev
```

5. Seed demo data:

```bash
npm run seed
```

## Demo Credentials

- Admin: `admin@commercehub.dev` / `Admin@123`
- Seller: `seller@commercehub.dev` / `Seller@123`
- Customer: `customer@commercehub.dev` / `Customer@123`

## API Docs

- Swagger UI: `http://localhost:5000/docs`
- Health endpoint: `http://localhost:5000/health`

## Recommended Environment Variables

At minimum configure:

- MongoDB: `MONGO_URI`
- Redis: `REDIS_URL`
- JWT: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- Frontend API: `VITE_API_BASE_URL`, `VITE_SOCKET_URL`
- Payments: `STRIPE_SECRET_KEY` or `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`
- Media: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Google OAuth: `GOOGLE_CLIENT_ID`
- Analytics: `VITE_GA_MEASUREMENT_ID`

## Deployment

See [docs/deployment.md](docs/deployment.md) for Docker, Nginx, EC2, S3, and GitHub Actions deployment guidance.
