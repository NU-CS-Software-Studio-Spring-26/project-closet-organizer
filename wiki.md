# Project Closet Organizer Wiki

## Project Purpose

Project Closet Organizer helps users keep track of wardrobe items in one place. The current milestone focuses on core CRUD functionality and a connected user experience between list and detail views.

## Problem Statement

Closet information is often spread across memory, notes, and photos. This project provides a simple system to:

- Record clothing items with structured attributes
- Associate items with users
- Edit and remove outdated entries
- Browse data through a clear UI flow

## Current Scope (Milestone 0)

- Two core models: users and clothing items
- CRUD support for both resources through the Rails API
- Frontend routes for home, users list, user detail, item detail, and item creation
- Seed data for demo and testing

## Object-Oriented Design Board

Miro board link:

- https://miro.com/app/board/uXjVGhqlLR8=/


## Future Features (Post-MVP)

- Authentication and per-user login sessions
- Search and filter presets by season, style, and color
- Outfit builder and saved outfit collections
- Image upload and visual closet gallery
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
- Backend tests run in GitHub Actions.
- Deployment target for assignment is Heroku 
