# Subscription Management API

A secure and extensible backend API for managing users, plans, and subscriptions — built with NestJS, TypeScript, and PostgreSQL.

---

## Table of Contents

- [Subscription Management API](#subscription-management-api)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Features](#features)
    - [Authentication \& Security](#authentication--security)
    - [User Module](#user-module)
    - [Plan Module](#plan-module)
    - [Subscription Module](#subscription-module)
    - [Additional Features](#additional-features)
  - [Tech Stack](#tech-stack)
  - [Architecture Overview](#architecture-overview)
  - [Prerequisites](#prerequisites)
  - [Quick start](#quick-start)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
  - [Folder Structure](#folder-structure)
  - [Roadmap](#roadmap)
    - [Completed](#completed)
    - [Next Steps](#next-steps)
  - [License](#license)

---

## About the Project

This project is a **Subscription Management API** designed as a generic backend foundation
for systems that require user authentication, authorization and subscription-based access control.

It focuses on modeling a flexible subscription domain while applying modern backend engineering practices such as:

- Modular architecture
- Layered design (Controller → Service → Repository)
- DTO validation
- JWT authentication
- Role-based Access Control (RBAC)

The project is intentionally generic and not tied to any specific business or billing provider, and is designed to be consumed by other services through a well-defined API.

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
- One-to-many relationship between users and subscriptions

### Plan Module
- CRUD operations for subscription plans
- Support for multiple pricing configurations
- Flexible attributes using JSON-based fields
- DTO-based validation

### Subscription Module
- Subscription creation and cancellation
- Prevention of duplicate active subscriptions per plan
- Subscription lifecycle derived from temporal fields
- Historical data preservation

### Additional Features
- Centralized exception handling
- Global validation pipes
- OpenAPI (Swagger) documentation for API exploration and integration
- Consistent and maintainable project structure

---

## Tech Stack
| Technology | Purpose |
|-----------|----------|
| **NestJS (Node.js)** | Backend framework |
| **TypeScript** | Type-safe development |
| **PostgreSQL** | Database |
| **TypeORM** | ORM & migrations |
| **Passport + JWT** | Authentication |
| **Jest** | Unit testing |
| **Docker** | Containerization |

---

## Architecture Overview

Layered architecture:

Controller → Service → Repository → Database


Each domain (Users, Plans, Subscriptions) has its own module with clean separation of concerns.

## Prerequisites

- Node.js v20.19.2+
- pnpm
- PostgreSQL
- Redis

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

5. **Start the development server**
```bash
pnpm run start:dev
```

## Environment Variables

Running `cp .env.example .env` will create a `.env` file in the project root:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=subscription_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

REDIS_URL=redis://localhost:6379
```

Configure your environment variables as needed.

## Available Scripts

```bash

# Development
pnpm run start:dev	   # Run in watch mode
pnpm run start:debug   # Run in debug mode

# Production
pnpm run build	       # Build project
pnpm run start:prod    # Start production server

# Database & Migrations
pnpm run migration:generate  # Generates new migration
pnpm run migration:run       # Executes pending migrations
pnpm run migration:revert    # Revert last migration

# Tests
pnpm run test   # Run tests
```

## Folder Structure

```
src/
├── common/
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

## Roadmap

### Completed
- Project setup
- Database configuration
- User, Plan, Subscription modules
- JWT authentication
- RBAC
- BaseEntity inheritance
- Subscription business logic


### Next Steps
- Cron jobs for automatic expiration
- Webhook integration example (out of core scope)
- Unit tests (basic)
- Admin panel (Next.js)
- Full E2E tests

## License

This project is licensed under the MIT License.