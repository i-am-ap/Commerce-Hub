# Deployment Guide

## Local Docker

1. Copy `.env.example` into `.env`, `client/.env`, and `server/.env`.
2. Replace secrets for JWT, Cloudinary, Google OAuth, and payment providers.
3. Start the stack:

```bash
docker compose up --build
```

4. Seed demo data:

```bash
docker compose exec server npm run seed
```

5. Open:
   - App: `http://localhost`
   - API docs: `http://localhost/docs`
   - Health: `http://localhost/health`

## AWS EC2 + S3 Strategy

1. Launch an Ubuntu EC2 instance and open ports `80`, `443`, and `22`.
2. Install Docker and Docker Compose on the instance.
3. Clone this repository into `/var/www/commerce-hub`.
4. Configure `server/.env` with production secrets and domains.
5. Build and run with `docker compose up -d --build`.
6. Point your domain to the EC2 instance and terminate SSL with Nginx or an AWS ALB.
7. Optional S3 path:
   - Build the client with `npm run build --workspace client`.
   - Upload `client/dist` to an S3 bucket configured for static hosting or behind CloudFront.
   - Keep the API on EC2 and set `VITE_API_BASE_URL` to the public API domain.

## GitHub Actions Secrets

Add the following repository secrets for automated deployment:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

If you also want production integrations in CI, add your provider secrets and map them into the workflow as environment variables.

