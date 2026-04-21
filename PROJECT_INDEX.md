# Project Structure Index

Last indexed: 2026-04-21

## Overview

This repository is a monorepo with:

- `front-end/` for the React + Vite client
- `back-end/` for the Rails JSON API
- root-level scripts and docs for local development

The frontend is no longer just a static mockup. It fetches live data from the Rails API, supports multiple routes, and performs create, update, and delete operations for clothing items.

## Top-Level Structure

```text
project-closet-organizer/
├── .github/                    # CI and Dependabot configuration
├── back-end/                   # Rails 8 application
├── front-end/                  # React 19 + Vite client
├── storage/                    # Root SQLite files used in local development
├── tmp/                        # Root cache/runtime artifacts
├── PROJECT_INDEX.md            # This file
├── README.md                   # Root project guide
└── start.sh                    # Boots backend and frontend together
```

## Root

- `README.md`
  Repo overview, startup instructions, and links to app-level docs.
- `PROJECT_INDEX.md`
  Structural index of the codebase.
- `start.sh`
  Starts Rails and Vite together, clears conflicting processes on the configured ports, and keeps both services attached to one terminal session.
- `.github/workflows/ci.yml`
  Backend-focused CI running security checks, linting, and Rails tests.
- `.github/dependabot.yml`
  Dependency update automation.

## Frontend

Path: `front-end/`

Purpose:

- Provides the browser UI for browsing closets and editing clothing items.
- Uses client-side route parsing in `src/app/App.tsx` instead of a dedicated router package.
- Talks to Rails through `/api` requests proxied by Vite during development.

Important files:

- `front-end/package.json`
  React 19, Vite 8, Tailwind 4, Radix UI, Motion, Lucide, Recharts, and related UI dependencies.
- `front-end/vite.config.ts`
  Configures React, Tailwind, the Figma asset resolver, and the `/api` proxy to Rails.
- `front-end/index.html`
  Vite HTML entry.
- `front-end/src/main.tsx`
  Frontend bootstrap.
- `front-end/src/app/App.tsx`
  Top-level route handling and home page state orchestration.
- `front-end/src/app/lib/closet.ts`
  Shared types, formatting helpers, and all frontend API calls.

Frontend route map:

- `/`
  Loads the first user returned by `GET /users` and renders that user's closet.
- `/users`
  Lists all users from the API.
- `/users/:id`
  Shows a user summary with closet statistics and clickable clothing items.
- `/items/:id`
  Shows an editable clothing item detail form with save and delete actions.
- `/items/new?userId=:id`
  Shows the creation form for a new clothing item tied to a user.

Frontend source layout:

```text
front-end/src/
├── app/
│   ├── App.tsx                         # Route parser and top-level state
│   ├── lib/
│   │   └── closet.ts                   # API layer and shared types/helpers
│   └── components/
│       ├── ClothingCard.tsx            # Closet grid card
│       ├── CreateItemPage.tsx          # New item form
│       ├── FilterBar.tsx               # Search and season filtering
│       ├── ItemDetailPage.tsx          # Edit/delete item screen
│       ├── UserDetailPage.tsx          # Single user profile and item list
│       ├── UsersDirectoryPage.tsx      # All-users directory
│       ├── OutfitBuilder.tsx           # Present in repo, not a primary route
│       ├── figma/ImageWithFallback.tsx # Figma-export image helper
│       └── ui/                         # Large reusable UI component set
├── imports/                            # Imported design reference assets
└── styles/                             # Fonts, theme, Tailwind, and global CSS
```

Frontend implementation notes:

- `src/app/lib/closet.ts` uses `VITE_API_BASE_URL`, defaulting to `/api`.
- `vite.config.ts` proxies `/api` to `http://$BACKEND_HOST:$BACKEND_PORT` and strips the `/api` prefix before forwarding to Rails.
- The home page search matches item name, size, and selected tag fields such as brand, color, material, season, and style.
- The current home view assumes the first user returned by the API is the primary closet owner.
- `front-end/node_modules/` and `front-end/dist/` exist in the workspace and should be treated as generated artifacts, not source.

## Backend

Path: `back-end/`

Purpose:

- Exposes JSON CRUD endpoints for users and clothing items.
- Stores data in SQLite for local development.
- Serializes clothing items with embedded user summaries and users with embedded clothing items.

Important files:

- `back-end/Gemfile`
  Rails 8 stack with SQLite, Puma, bcrypt, solid_* gems, Brakeman, Bundler Audit, and RuboCop.
- `back-end/config/routes.rb`
  JSON API routes plus `/up` health check.
- `back-end/app/controllers/application_controller.rb`
  CORS handling, error rendering, and shared JSON payload helpers.
- `back-end/app/controllers/users_controller.rb`
  CRUD actions for users.
- `back-end/app/controllers/clothing_items_controller.rb`
  CRUD actions for clothing items and tag normalization.
- `back-end/app/models/user.rb`
  `has_secure_password`, `has_many :clothing_items`, username validation.
- `back-end/app/models/clothing_item.rb`
  `belongs_to :user`, enum size, presence validations.
- `back-end/db/schema.rb`
  Current schema definition.
- `back-end/db/seeds.rb`
  Demo seed that creates one user and 20 clothing items.

Backend API surface:

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

Backend payload behavior:

- `UsersController#index` and `show` include each user's clothing items ordered by name.
- `ClothingItemsController#index` includes each item's associated user summary.
- `ApplicationController` allows CORS from `localhost` and `127.0.0.1` on the configured frontend port.
- Validation failures render `{ errors: [...] }` with HTTP `422 Unprocessable Content`.
- Missing records render `{ error: ... }` with HTTP `404 Not Found`.

Database shape:

- `users`
  Columns: `username`, `preferred_style`, `password_digest`, timestamps
- `clothing_items`
  Columns: `name`, `size`, `date`, `tags`, `user_id`, timestamps
- `tags`
  Stored as JSON and currently used for `material`, `season`, `style`, `brand`, and `color`

Tests:

- `back-end/test/models/`
  Model coverage for `User` and `ClothingItem`
- `back-end/test/integration/users_flow_test.rb`
  Covers index, show, create, update without password change, and delete
- `back-end/test/integration/clothing_items_flow_test.rb`
  Covers index, show, create, update, and delete

Deployment and operations:

- `back-end/config/deploy.yml`
  Kamal deployment configuration
- `back-end/bin/brakeman`
  Security scan
- `back-end/bin/bundler-audit`
  Dependency vulnerability scan
- `back-end/bin/rubocop`
  Ruby linting
- `back-end/bin/ci`
  Local CI helper script generated by Rails

## CI and Automation

Current CI is backend-only and lives in `.github/workflows/ci.yml`.

It runs:

- Brakeman
- Bundler Audit
- RuboCop
- `bin/rails db:test:prepare test`

There is no frontend CI job yet for `npm run build` or frontend tests.

## Runtime and Generated Artifacts

These paths are present in the workspace but are not primary source locations:

- `front-end/node_modules/`
- `front-end/dist/`
- `back-end/tmp/`
- `back-end/log/`
- `back-end/storage/`
- `storage/development.sqlite3`
- `storage/development.sqlite3-shm`
- `storage/development.sqlite3-wal`
- `tmp/cache/`

## Current State Summary

- The backend already supports live CRUD for users and clothing items.
- The frontend is API-driven and includes multi-page closet browsing and editing flows.
- The frontend still contains imported Figma-era assets and a large shared UI component library.
- The home page currently uses the first API user as the default closet owner.
- CI coverage is present for the backend only.
