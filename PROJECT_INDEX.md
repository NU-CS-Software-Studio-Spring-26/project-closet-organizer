# Project Structure Index

Last updated: 2026-04-21

This file is intentionally concise and focused on repository structure.
For project background, roadmap, and references, see wiki.md.

## Top-Level Layout

```text
project-closet-organizer/
├── .github/                    # CI and automation
├── back-end/                   # Rails API app
├── front-end/                  # React + Vite UI app
├── storage/                    # Local SQLite artifacts
├── tmp/                        # Runtime/cache artifacts
├── README.md                   # Assignment-facing overview and setup
├── wiki.md                     # Extended project documentation
├── PROJECT_INDEX.md            # This structure index
└── start.sh                    # Boots backend and frontend together
```

## Backend (back-end)

- app/models: User and ClothingItem domain models
- app/controllers: JSON CRUD controllers
- config/routes.rb: API route definitions
- db/seeds.rb: seed data generation
- test/: model and integration tests

## Frontend (front-end)

- src/app/App.tsx: route handling and top-level view composition
- src/app/components/: page and UI components
- src/app/lib/closet.ts: API calls and shared types/helpers
- src/styles/: fonts, theme, and global styling

## CI

- .github/workflows/ci.yml: backend security checks, linting, and tests

## Docs

- README.md: MVP, team info, deployment link, communication rules, setup
- wiki.md: task context, Miro link, future features, references, ideas
