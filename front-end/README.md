# Closet Organizer Frontend

React + Vite client for the closet organizer project.

This app started from a Figma-exported bundle, but the current code is wired to the Rails backend and supports live data fetching plus item create, edit, and delete flows.

Original design source:
[Closet Organizer Mockup](https://www.figma.com/design/uZi7nkn4N3N3KNIANPF5yR/Closet-Organizer-Mockup)

## Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Motion
- Radix UI components
- Lucide icons

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Default dev URL:

```text
http://127.0.0.1:5173
```

To run the full monorepo together, use [start.sh](../start.sh) from the repository root.

## Backend Connection

The frontend API layer lives in `src/app/lib/closet.ts`.

- `VITE_API_BASE_URL` defaults to `/api`
- Vite proxies `/api` to the Rails backend
- `BACKEND_HOST` and `BACKEND_PORT` control the proxy target during local development

If the Rails API is running on the default port, no extra configuration is required.

## Current Routes

Routes are derived in `src/app/App.tsx` with `window.location` and `history.pushState`.

- `/` closet home for the first user returned by the API
- `/users` all users directory
- `/users/:id` user detail page
- `/items/:id` clothing item detail editor
- `/items/new?userId=:id` item creation page

## Important Source Files

- `src/app/App.tsx`
  Main entry point and route/state coordinator
- `src/app/lib/closet.ts`
  Shared types, formatting helpers, and fetch helpers
- `src/app/components/ClothingCard.tsx`
  Clothing grid card used on the home page
- `src/app/components/FilterBar.tsx`
  Search and season filtering controls
- `src/app/components/UsersDirectoryPage.tsx`
  All-users directory screen
- `src/app/components/UserDetailPage.tsx`
  User summary and closet contents screen
- `src/app/components/ItemDetailPage.tsx`
  Edit/delete flow for a clothing item
- `src/app/components/CreateItemPage.tsx`
  New clothing item flow

## Current Behavior Notes

- The home screen loads the first user returned by `GET /users`.
- Search currently checks item name, size, and tag fields such as brand, color, material, season, and style.
- The repo still contains Figma-era helper files and a large reusable UI component set under `src/app/components/ui/`.
- `src/app/components/OutfitBuilder.tsx` still exists in the repo, but it is not one of the main routed screens.

## Build

Create a production build:

```bash
npm run build
```
