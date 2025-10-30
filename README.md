# Country Currency & Exchange API

Fetches country data and exchange rates, computes estimated GDP, caches in MySQL, and exposes CRUD + status + summary image endpoints.

## Features
- `POST /countries/refresh` — fetch countries & exchange rates and cache them
- `GET /countries` — list cached countries with optional `region`, `currency` and `sort=gdp_desc`
- `GET /countries/:name` — fetch a single country by name (case-insensitive)
- `DELETE /countries/:name` — delete a country record
- `GET /status` — total countries & last refresh timestamp
- `GET /countries/image` — serves summary image generated on refresh

## Requirements
- Node.js 18+
- MySQL server
- npm

## Setup

1. Clone repo
```bash
$ git clone https://github.com/jimmie-01/country_currency_exchange_api.git
```
2. Change Directory into:
```sh 
$ cd country-currency-exchange-api
```
3. Install
```sh
$ npm install
```
4. Create MYSQL Database
```sh
$ CREATE DATABASE country_cache CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
5. Copy the follow into .env
```sh
$ DB_HOST=localhost
$ DB_PORT=3306
$ DB_USER=root
$ DB_PASS=your_password
$ DB_NAME=country_cache
$ PORT=3000
```

