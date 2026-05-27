# AI Development Rules

## General

- Prefer maintainability over cleverness
- Follow NestJS best practices
- Prefer explicit code

## Architecture

- Respect module boundaries
- Never place business rules inside controllers
- Use dependency injection
- Keep services focused

## Testing

- Generate unit tests for business rules
- Mock repositories and external services
- Cover success and failure scenarios

## Future Architecture

- Prefer event-driven communication
- Prepare code for multi-tenant evolution
- Keep subscription logic extensible