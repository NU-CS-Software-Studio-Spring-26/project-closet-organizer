# Project Closet Organizer

Project Closet Organizer is a monorepo with a Rails JSON API in back-end and a React + Vite client in front-end. The app supports browsing users and clothing items and performing create, update, and delete operations for closet entries.

## MVP

Milestone 0 MVP:

- Manage closet data with at least two models: users and clothing items.
- View all entries and individual entries for the core data.
- Support create, update, and delete actions for individual records.
- Seed development data with at least 20 clothing item records.
- Provide a single, connected product experience through linked app views.

## Team Members

- Annabel Goldman
- Adedamola Adejumobi
- David Swims

## Deployment

Heroku deployment link:

- https://YOUR-HEROKU-APP-NAME.herokuapp.com

Replace the placeholder URL above with the live Heroku app URL used by the team.

## Communication

Team communication and decision-making rules:

- Primary async channel: group chat for daily updates, blockers, and status.
- Meeting cadence: brief sync at least twice per week, with extra sessions before deadlines.
- Branch and PR workflow: each feature goes through a pull request and at least one teammate review when possible.
- Decision rule: prefer consensus; if consensus cannot be reached quickly, majority vote decides and the outcome is documented in the PR.
- Ownership and support: each task has one owner, but all members are expected to be able to run, test, and explain every part of the milestone deliverables.

## Repository Layout

- front-end: React 19 + Vite client application
- back-end: Rails 8 API with SQLite, models, controllers, seeds, and tests
- .github: automation and CI workflows
- start.sh: root-level launcher that boots both apps together
- PROJECT_INDEX.md: concise structure index
- wiki.md: extended project notes, roadmap, references, and design links

## Getting Started

### Start Both Apps

From the repository root:

```bash
./start.sh
```

This starts:

- Rails at http://127.0.0.1:3000
- Vite at http://127.0.0.1:5173

Override ports if needed:

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

## Documentation

- Project overview: [README.md](./README.md)
- Structure index: [PROJECT_INDEX.md](./PROJECT_INDEX.md)
- Project wiki: [wiki.md](./wiki.md)
- Backend details: [back-end/README.md](./back-end/README.md)
- Frontend details: [front-end/README.md](./front-end/README.md)

## CI

GitHub Actions currently validates the Rails app in back-end using security checks, linting, and tests via .github/workflows/ci.yml.
