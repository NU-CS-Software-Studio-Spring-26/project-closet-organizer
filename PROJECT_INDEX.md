# Project Structure Index

Last updated: 2026-05-02

This file is intentionally concise and focused on repository structure.
For project background, roadmap, and references, see wiki.md.

## Top-Level Layout

```text
project-closet-organizer/
├── .github/                    # CI and automation
├── back-end/                   # Rails API app
├── front-end/                  # React + Vite UI app
├── Procfile                    # Heroku runtime entrypoint for back-end/
├── package.json                # Frontend build glue for deployment
├── README.md                   # Assignment-facing overview and setup
├── wiki.md                     # Extended project documentation
├── PROJECT_INDEX.md            # This structure index
└── start.sh                    # Boots backend and frontend together
```

## Backend (back-end)

- app/models: user, clothing_item, outfit_upload, and outfit_detection domain models
- app/controllers: JSON CRUD controllers plus outfit upload handling
- app/services/outfit_photo_detector.rb: OpenRouter-powered outfit detection service
- config/routes.rb: API route definitions
- db/seeds.rb: seed data generation
- test/: model and integration tests

## Frontend (front-end)

- src/app/App.tsx: route handling and top-level view composition
- src/app/components/: routed pages, shared presentation components, and UI primitives
- src/app/lib/closet.ts: API calls and shared types/helpers
- src/app/lib/useItemPhotoState.ts: shared photo upload state management
- src/styles/: fonts, theme, and global styling

## CI

- .github/workflows/ci.yml: backend security checks, linting, and tests

## Docs

- README.md: overview, current capabilities, setup, and documentation map
- wiki.md: background, scope notes, roadmap, references, and ideas
