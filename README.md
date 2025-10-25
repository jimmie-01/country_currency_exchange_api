# Country Currency Exchange API

Lightweight REST API for looking up and converting exchange rates between countries/currencies using Node.js, Express and SQL (PostgreSQL). Designed for easy local development, CI testing, and production deployment.

## Features
- Query available currencies
- Query exchange rates (base → target)
- Convert amounts between currencies
- CRUD for currency and rate data (for trusted/admin clients)
- SQL-first schema with migrations and seed data
- Clear JSON responses and error codes

## Tech stack
- Node.js (LTS)
- Express
- SQL

## Prerequisites
- Node.js >= 18
- PostgreSQL >= 12 (or a Docker environment)
- npm or yarn

## Quickstart (development)
1. Clone project
2. Install deps:
	- npm install
3. Create .env from template (see below)
4. Run DB (locally or docker)
5. Run migrations and seeds
	- npm run migrate
	- npm run seed
6. Start server:
	- npm run dev
7. API served at http://localhost:3000 (default)

## .env example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/exchange_db

## Database schema (recommended)
SQL example (Postgres):

```sql
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE, -- ISO 4217 e.g. USD, EUR
  name TEXT NOT NULL,
  symbol TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  base_currency_id INTEGER NOT NULL REFERENCES currencies(id) ON DELETE CASCADE,
  target_currency_id INTEGER NOT NULL REFERENCES currencies(id) ON DELETE CASCADE,
  rate NUMERIC(24,12) NOT NULL CHECK (rate > 0),
  source TEXT, -- optional source identifier
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (base_currency_id, target_currency_id)
);
```
