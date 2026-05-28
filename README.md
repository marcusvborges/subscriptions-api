# Subscription Management API

![Node](https://img.shields.io/badge/node-20-green)
![NestJS](https://img.shields.io/badge/nestjs-backend-red)
![TypeScript](https://img.shields.io/badge/typescript-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-db-blue)
![Docker](https://img.shields.io/badge/docker-blue)
![License](https://img.shields.io/github/license/marcusvborges/subscriptions-api)

A modular and production-oriented backend API for managing users, plans, and subscriptions.

---

## About the Project

This project is a production-oriented **Subscription Management API** designed to explore scalable backend architecture patterns for SaaS applications.

The system focuses on:

- Authentication & authorization
- Subscription lifecycle management
- RBAC access control
- Refresh token rotation
- Modular domain organization
- Extensibility for future multi-tenant evolution

The project is intentionally generic and not tied to any billing provider, allowing it to be reused across different systems that require subscription-based access control.

---

## Features

### Authentication & Security
- Login & registration with hashed passwords
- JWT authentication (access & refresh tokens)
- Refresh token rotation
- Route protection using Passport guards
- Role-based Access Control (USER, ADMIN, SUPERADMIN)
- Cookie-based authentication support
- Secure logout with refresh token invalidation

### User Module
- User CRUD operations with soft delete
- Role management
- Secure password handling
- One-to-many relationship between users and subscriptions

### Plan Module
- CRUD operations for subscription plans
- Multiple billing intervals support
- Flexible attributes using JSON-based fields
- DTO validation
- Plan pricing abstraction

### Subscription Module
- Subscription creation and cancellation
- Prevention of duplicate active subscriptions
- Subscription lifecycle management
- Historical data preservation
- Temporal subscription validation

### Additional Features
- Global validation pipes
- Centralized configuration module
- Structured seed system
- OpenAPI (Swagger) documentation
- Dockerized infrastructure
- Type-safe environment validation
- Database migrations

---

## Tech Stack
| Technology | Purpose |
|-----------|----------|
| **NestJS (Node.js)** | Backend framework |
| **TypeScript** | Type-safe development |
| **PostgreSQL** | Relational database |
| **TypeORM** | ORM & migrations |
| **Passport + JWT** | Authentication |
| **Jest** | Testing |
| **Docker** | Containerization |
| **Swagger** | API documentation |

---

## Architecture Overview

The project follows a modular layered architecture inspired by clean architecture principles.

```text
Controller → Service → Repository → Database
```

The application is organized using a modular domain-oriented structure.

```
src/modules
├── auth/            # Authentication & authorization
├── user/            # User management
├── plan/            # Subscription plans & pricing
├── subscription/    # Subscription lifecycle
├── cache/           # Redis caching abstraction
├── database/        # Database configuration & migrations
├── config/          # Environment & app configuration
└── hash/            # Password hashing abstraction
```

Each module encapsulates its own controllers, services, DTOs, entities, and business rules, helping maintain separation of concerns, scalability, and maintainability.

## Prerequisites

- Node.js v20+
- pnpm
- Docker
- Docker Compose

## Quick start

1. **Clone and install the dependencies**
```bash
git clone https://github.com/marcusvborges/subscriptions-api.git
cd subscriptions-api
pnpm install
```

2. **Define the environment variables**
```bash
cp .env.example .env
```

3. **Initialize the dependencies with Docker**
```bash
docker-compose up -d
```

4. **Execute the database migrations**
```bash
pnpm run migration:run
```

5. **Run database seeders**
```bash
pnpm run seed:all
```

6. **Start the development server**
```bash
pnpm run start:dev
```

---

## Environment Variables

Running `cp .env.example .env` will generate a local .env file.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=subscription_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

REDIS_URL=redis://localhost:6379
```

---

## API Documentation

Swagger UI is available at:

http://localhost:3000/api/docs

---

## Database Seeding
The project includes structured database seeders for development and testing purpose.

### Available Seeders
- Plans
- Plan Prices

### Execute Seeders

```bash
pnpm run seed:all
```

---

## Available Scripts

```bash

# Development
pnpm run start:dev
pnpm run start:debug

# Production
pnpm run build
pnpm run start:prod

# Tests
pnpm run test

# Database & Migrations
pnpm run migration:generate
pnpm run migration:run
pnpm run migration:revert

# Seeders
pnpm run seed:all
```

---

## Testing

The project includes unit tests for core business services using:

- Jest
- NestJS Testing Module
- Mocked TypeORM repositories

### Run Tests

```bash
pnpm run test
```

### Run Test Coverage

```bash
pnpm run test:cov
```

### Current Coverage Focus

- PlanService
- SubscriptionService
- Business rule validation
- Subscription lifecycle scenarios
- Edge cases and failure handling

The testing strategy avoids direct database access during unit tests to ensure fast and deterministic execution.

---

## Folder Structure

```
src/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── utils/
├── modules/
│   ├── auth/
│   ├── cache/
│   ├── config/
│   ├── database/
│   ├── hash/
│   ├── plan/
│   ├── subscription/
│   ├── user/
└── main.ts
```

---

## Future Architectural Goals
- Event-driven architecture
- Queue-based background processing
- Redis-based async workflows
- Multi-tenant subscription model
- Organization & Membership architecture
- Payment provider abstraction
- Billing webhooks
- Audit logging
- Domain-driven design evolution

---

## Roadmap

### Completed
- Project setup
- Docker infrastructure
- PostgreSQL integration
- Redis integration
- Typed configuration module
- User module
- Plan module
- Subscription module
- JWT authentication
- Refresh token rotation
- RBAC authorization
- Structured seed system
- Swagger documentation
- TypeORM migrations
- Unit tests for core business services


### In Progress
- Expanded test coverage
- Full E2E tests
- Queue integration
- Cache abstraction improvements

### Planned
- Cron jobs for subscription expiration
- Event-driven workflows
- Multi-tenant architecture
- Admin dashboard (Next.js)
- Billing provider integration examples
- Background job processing

---

## License

This project is licensed under the MIT License.