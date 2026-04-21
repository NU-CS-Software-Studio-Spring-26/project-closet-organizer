# Digital Closet Organizer API

Rails 8 JSON backend for the closet organizer app.

## Stack

- Ruby 3.2.2
- Rails 8.1.3
- SQLite
- Puma
- bcrypt via `has_secure_password`

## What It Does

The backend currently exposes CRUD endpoints for:

- users
- clothing items

Clothing items belong to users and store flexible metadata in a JSON `tags` field for:

- `material`
- `season`
- `style`
- `brand`
- `color`

## Local Setup

```bash
bin/setup
bin/rails db:prepare db:seed
bin/dev
```

By default the app runs on `http://127.0.0.1:3000`.

If you are running the full repo from the root, use [start.sh](../start.sh) instead.

## API Routes

```text
GET    /up
GET    /
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
GET    /clothing_items
POST   /clothing_items
GET    /clothing_items/:id
PATCH  /clothing_items/:id
DELETE /clothing_items/:id
```

Notes:

- `/` resolves to `clothing_items#index`
- responses default to JSON
- `ApplicationController` returns `404` JSON for missing records and `422` JSON for validation failures

## Data Model

### `User`

- `username`
- `preferred_style`
- `password_digest`
- `has_many :clothing_items`
- `has_secure_password`

### `ClothingItem`

- `name`
- `size`
- `date`
- `tags`
- `user_id`
- `belongs_to :user`

Supported `size` enum values:

- `xs`
- `small`
- `medium`
- `large`
- `xl`

## Seeds

`db/seeds.rb` currently creates:

- one demo user: `demo_user`
- 20 clothing items with randomized sizes and tag values

Load them with:

```bash
bin/rails db:seed
```

## Tests and Quality Checks

Run the backend test suite:

```bash
bin/rails db:test:prepare test
```

Run lint and security checks:

```bash
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit
```

## Frontend Integration

The frontend talks to this app through `/api` in development. `front-end/vite.config.ts` proxies those requests to the Rails server and strips the `/api` prefix before forwarding them here.
