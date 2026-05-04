# Digital Closet Organizer API

Rails 8 JSON backend for the closet organizer app.

## Stack

- Ruby 3.2.2
- Rails 8.1.3
- SQLite
- Puma
- bcrypt via `has_secure_password`
- Active Storage for image uploads

## What It Does

The backend currently exposes CRUD endpoints for:

- users
- clothing items
- outfit uploads

Clothing items belong to users and store flexible metadata in a JSON `tags` field for:

- `material`
- `season`
- `style`
- `brand`
- `color`

Outfit uploads belong to users, store a source image through Active Storage, and create ordered `outfit_detections` after analysis.

## Local Setup

```bash
bin/setup
bin/rails db:prepare db:seed
bin/dev
```

By default the app runs on `http://127.0.0.1:3000`.

If you are running the full repo from the root, use [start.sh](../start.sh) instead.

## Bundler and Deploys

Heroku resolves gems from the repository root `Gemfile`, which in turn loads this backend `Gemfile`.

If you add, remove, or change a gem here, update and commit both lockfiles:

```bash
bundle install
cd back-end && bundle install
```

The root `Gemfile.lock` is what Heroku uses during deploy, and `back-end/Gemfile.lock` is what local backend commands use.

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
POST   /outfit_uploads
GET    /outfit_uploads/:id
```

Notes:

- `/` resolves to `clothing_items#index`
- responses default to JSON
- CORS headers are added for allowed frontend dev origins
- `ApplicationController` returns `404` JSON for missing records and `422` JSON for validation failures

## Data Model

### `User`

- `username`
- `preferred_style`
- `password_digest`
- `has_many :clothing_items`
- `has_many :outfit_uploads`
- `has_secure_password`

### `ClothingItem`

- `name`
- `size`
- `date`
- `tags`
- `user_id`
- `photo` via Active Storage
- `belongs_to :user`

Supported `size` enum values:

- `xs`
- `small`
- `medium`
- `large`
- `xl`

### `OutfitUpload`

- `user_id`
- `status`
- `provider`
- `vision_model`
- `error_message`
- `detected_at`
- `raw_response`
- `source_photo` via Active Storage
- `has_many :outfit_detections`

Supported `status` enum values:

- `pending`
- `processing`
- `succeeded`
- `failed`

### `OutfitDetection`

- `outfit_upload_id`
- `category`
- `confidence`
- `suggested_name`
- `details`
- `position`

## Seeds

`db/seeds.rb` currently creates:

- one populated user: `alexis_ward`
- one empty user: `annabel_goldman`
- 20 clothing items with randomized sizes and tag values for the populated user

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

Current backend test coverage includes model tests plus integration tests for users, clothing items, and outfit uploads.

## Environment

See `back-end/.env.example` for expected variables.

- `OPENROUTER_API_KEY` is required for outfit detection.
- `OPENROUTER_MODEL` defaults to `openai/gpt-4.1-mini`.
- `OUTFIT_CROP_CYCLE_LIMIT` defaults to `1` and controls how many crop refinement/verification cycles run per detected item.
- Active Storage can be configured for S3-style storage through the provided AWS variables.

## Frontend Integration

The frontend talks to this app through `/api` in development. `front-end/vite.config.ts` proxies those requests to the Rails server and strips the `/api` prefix before forwarding them here.
