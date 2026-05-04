# Project Structure Index

Last updated: 2026-05-04

This file is intentionally concise and focused on repository structure.
For project background, scope, and roadmap, see `wiki.md`.

## Top-Level Layout

```text
project-closet-organizer/
├── .github/                    # CI and automation
├── back-end/                   # Rails API app
├── front-end/                  # React + Vite UI app
├── Procfile                    # Heroku runtime entrypoint for back-end/
├── package.json                # Frontend build glue for deployment
├── README.md                   # Project overview and setup
├── wiki.md                     # Scope notes, roadmap, and references
├── PROJECT_INDEX.md            # This structure index
├── CHANGELOG.md                # Release notes and tag-aligned history
└── start.sh                    # Boots backend and frontend together
```

## Backend (`back-end`)

- `app/models`: `user`, `clothing_item`, `outfit`, `outfit_item`, `outfit_upload`, and `outfit_detection`
- `app/controllers`: auth/session handling, JSON CRUD controllers, upload flows, and SPA fallback
- `app/services/`: OpenRouter detection, crop refinement, crop verification, and image-cleaning logic
- `config/routes.rb`: API routes plus HTML fallback routes
- `db/seeds.rb`: demo admin user and closet seed generation
- `test/`: model, integration, and service tests

## Frontend (`front-end`)

- `src/app/App.tsx`: route handling, auth-aware layout, and top-level page composition
- `src/app/components/`: routed pages, shared presentation components, and UI primitives
- `src/app/lib/closet.ts`: API calls, shared types, and formatting helpers
- `src/app/lib/useItemPhotoState.ts`: shared photo upload and preview state management
- `src/styles/`: fonts, theme, and global styling

## CI

- `.github/workflows/ci.yml`: backend lockfile check, security checks, linting, and tests

## Docs

- `README.md`: current application overview and setup
- `wiki.md`: project background, Milestone 1 scope, and roadmap
- `back-end/README.md`: backend API and environment details
- `front-end/README.md`: frontend routes and integration notes
