# Project Scope — Subscription Management API

## Objective
Provide a generic and extensible backend foundation for subscription-based systems,
focusing on authentication, authorization, and subscription lifecycle management.

This project is NOT intended to be a full billing or payment solution.

## What this project IS

- A backend API for managing users, plans and subscriptions
- A generic subscription domain, not tied to any specific business
- Focused on technical quality, architecture and security
- Designed to be extensible for future features

## What this project IS NOT

- A real payment or billing system
- Integrated with payment providers (Stripe, PayPal, etc.)
- A complete SaaS platform
- Focused on business-specific rules (proration, trials, coupons)

## Existing Domains

- Auth
- Users
- Plans
- Subscriptions

## Core Business Rules

1. A user can have multiple subscriptions, but only one active subscription per plan
2. Subscription lifecycle is derived from temporal fields (active, canceledAt, expiresAt)
3. Canceled subscriptions retain historical data
4. The domain supports subscription-based access control via guards or policies
5. Duplicate active subscriptions are prevented
