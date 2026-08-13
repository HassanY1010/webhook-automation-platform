# Deployment & Production Setup Guide

## Quick Start Deployment with Docker Compose

### 1. Environment Preparation
Copy `.env.example` to `.env` and set production secrets:
```bash
cp .env.example .env
```

Set strong keys for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_MASTER_KEY`:
```env
ENCRYPTION_MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 2. Launch Stack
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Database Migration & Seeding
```bash
pnpm db:migrate
pnpm db:seed
```

## Cloud Platform Instructions

- **VPS / DigitalOcean**: Deploy using Docker Compose behind Nginx reverse proxy with Certbot SSL.
- **Railway / Render**: Deploy `apps/api`, `apps/worker`, and `apps/web` as individual services connected to managed PostgreSQL and Redis addons.
- **AWS ECS / Kubernetes**: Build Docker images from `infrastructure/docker/` and deploy services with horizontal auto-scaling based on queue depth.
