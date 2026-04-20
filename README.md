# Project Closet Organizer

This repository is now organized as a small monorepo with separate frontend and backend applications.

## Structure

- `front-end/`: React + Vite application for the user interface
- `back-end/`: Ruby on Rails application that will provide the REST API and backend services
- `.github/`: repository-level automation and CI configuration

## Working Directories

Run frontend work from:

```bash
cd front-end
```

Run backend work from:

```bash
cd back-end
```

## CI

GitHub Actions now targets the Rails app from `back-end/`. The frontend remains a separate application and can have its own build and test workflow added as it matures.
