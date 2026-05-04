# Project Closet Organizer Wiki

## Project Purpose

Project Closet Organizer helps users keep track of wardrobe items in one place. The current implementation includes core CRUD functionality, photo-backed item management, and an early outfit-import workflow that detects visible pieces from a single uploaded image.

## Problem Statement

Closet information is often spread across memory, notes, and photos. This project provides a simple system to:

- Record clothing items with structured attributes
- Associate items with users
- Edit and remove outdated entries
- Browse data through a clear UI flow

## Current Scope (Milestone 0)

- Two core models: users and clothing items
- CRUD support for both resources through the Rails API
- Frontend routes for landing, closet, users list, user detail, item detail, item creation, and outfit import
- Seed data for demo and testing

## Current Implementation Notes

- The backend now also includes `outfit_uploads` and `outfit_detections` for the outfit-import flow.
- Clothing item photos and outfit source photos are stored through Active Storage.
- Outfit detection is currently handled by an OpenRouter request configured in the backend environment.
- The frontend still uses a lightweight custom router in `front-end/src/app/App.tsx` rather than React Router.

## Object-Oriented Design Board

Miro board link:

- https://miro.com/app/board/uXjVGhqlLR8=/


## Future Features (Post-MVP)

- Authentication and per-user login sessions
- Search and filter presets by season, style, and color
- Outfit builder and saved outfit collections
- Convert outfit detections directly into saved clothing items
- Item availability and laundry/rotation tracking
- Export/import closet data

## Similar Products and References

- Stylebook (https://www.stylebookapp.com/)
- Acloset (https://www.acloset.app/)
- Whering (https://whering.co.uk/)

## Product Ideas and Notes

- Add recommendation hints based on style preferences
- Add weather-aware outfit suggestions
- Track worn dates to improve rotation

## Working Notes

- Backend and frontend are in one monorepo.
- The active Rails backend lives in `back-end/`; the old duplicate root Rails scaffold has been removed.
- Backend tests run in GitHub Actions.
- Frontend tests are not currently part of CI.
- Deployment target for assignment is Heroku.
