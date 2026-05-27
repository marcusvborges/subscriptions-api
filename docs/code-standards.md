# Coding Standards

## Services

- Must contain business rules
- Must not contain HTTP concerns
- Must throw domain exceptions when necessary

## Controllers

- Must remain thin
- Must delegate logic to services

## Repositories

- It does not contain its own file, as it is used natively by TypeORM
- Responsible for database access only
- Must not contain business rules

## DTOs

- Use class-validator
- Never expose entities directly

## Testing

- Unit tests should focus on business rules
- External dependencies must be mocked
- Services are the primary testing target

## Naming

- Use clear and explicit method names
- Avoid abbreviations