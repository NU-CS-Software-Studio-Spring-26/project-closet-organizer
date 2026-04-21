# Project Closet Organizer

Project Closet Organizer is a small monorepo with a Rails JSON API in `back-end/` and a React + Vite client in `front-end/`. The current app lets you browse closet owners, view clothing items, create new items, and edit or delete existing ones through the frontend while persisting data in the Rails backend.

## Repository Layout

- `front-end/` React 19 + Vite client application
- `back-end/` Rails 8 API with SQLite, models, controllers, seeds, and tests
- `.github/` repository automation, Dependabot, and CI
- `start.sh` root-level launcher that boots both apps together
- `PROJECT_INDEX.md` codebase index with the current structure and implementation notes

## Current App Flows

Frontend routes currently handled in `front-end/src/app/App.tsx`:

- `/` closet home for the first user returned by the API
- `/users` directory of all users
- `/users/:id` user detail page with closet summary and item list
- `/items/:id` editable clothing item detail page
- `/items/new?userId=:id` clothing item creation flow

Backend resources currently exposed from `back-end/config/routes.rb`:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /clothing_items`
- `GET /clothing_items/:id`
- `POST /clothing_items`
- `PATCH /clothing_items/:id`
- `DELETE /clothing_items/:id`
- `GET /up` health check

## Getting Started

### Start Both Apps

From the repository root:

```bash
./start.sh
```

This starts:

- Rails at `http://127.0.0.1:3000`
- Vite at `http://127.0.0.1:5173`

The script stops any existing processes already bound to those ports before starting the repo again. Override ports if needed:

```bash
BACKEND_PORT=3001 FRONTEND_PORT=5174 ./start.sh
```

### Start Apps Separately

Backend:

```bash
cd back-end
bin/setup
bin/rails db:prepare db:seed
bin/dev
```

Frontend:

```bash
cd front-end
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the Rails app using `BACKEND_HOST` and `BACKEND_PORT`.

## Project Docs

- Root overview: [README.md](./README.md)
- Full index: [PROJECT_INDEX.md](./PROJECT_INDEX.md)
- Backend guide: [back-end/README.md](./back-end/README.md)
- Frontend guide: [front-end/README.md](./front-end/README.md)

## CI

GitHub Actions currently validates the Rails app in `back-end/` with:

- Brakeman
- Bundler Audit
- RuboCop
- Rails tests

Frontend build and test automation has not been added to CI yet.
