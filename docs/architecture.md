# Architecture Overview

## Backend Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Redis
- Docker

## Architectural Style

Layered architecture:

Controller -> Service -> Repository -> Database

## Module Organization

Each domain is isolated inside its own module.

Example:

- auth
- user
- plan
- subscription

## Principles

- Thin controllers
- Business rules inside services
- Repository abstraction
- DTO validation
- Dependency injection
- Separation of concerns
- Clean Code

## Future Evolution

- Event-driven architecture
- Background jobs
- Multi-tenancy
- Billing integrations