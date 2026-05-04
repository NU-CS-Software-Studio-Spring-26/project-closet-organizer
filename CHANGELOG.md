# Changelog

## v1.0.5 - 2026-05-04

- Fixed the manual add-item back button so it consistently returns users to the closet page.
- Restricted users-directory navigation to admin users by adding an admin-only `Users` header button and removing non-admin UI paths into `/users`.
- Preserved the existing route-level authorization while making the UI navigation match the intended access rules more closely.

## v1.0.4 - 2026-05-04

- Merged the tag-based closet search and relaxed item schema work with the new outfits and lookbook experience from `main`.
- Preserved the polished closet filter bar updates alongside the My Outfits page, outfit draft persistence, and outfits CRUD support.
- Synced the branch to the current Milestone 1 codebase and tagged the combined release head.

## v1.0.3 - 2026-05-04

- Reworked clothing item metadata into a relaxed tag-based schema for create, edit, seed, and API payload flows.
- Added closet search, tag filtering, and sort controls aligned with the new tag-driven item model.
- Polished the closet filter bar layout so the search field and dropdown controls feel cleaner and more consistent.

## v1.0.2 - 2026-05-03

- Fixed deployed routing so browser visits to `/users` and `/users/:id` render the frontend app instead of raw JSON responses.
- Preserved JSON authorization behavior for API requests while restoring correct SPA fallback behavior for HTML requests.
- Added full outfits support across back-end and front-end, including outfit CRUD endpoints, user-scoped authorization, and outfit-to-item associations.
- Introduced new data models and schema updates for outfits and outfit items, including ownership validation and uniqueness constraints.
- Added the My Outfits experience with create/edit/delete flows and outfit item grouping from closet pieces.
- Added persistent outfit draft behavior so selected item IDs are saved per user and restored from local storage.
- Added and refined flash/toast notifications for outfit load/save/update/delete outcomes and draft confirmations.
- Added automated test coverage for outfit flows and validations, including integration tests and model tests for Outfit and OutfitItem.

## v1.0.1 - 2026-05-03

- Refined unauthorized user flows for admin-only pages and protected routes.
- Prevented unauthorized users from briefly seeing restricted page content before redirecting or showing an access-restricted view.
- Simplified the logged-out landing page shell and polished header/footer copy.

## v1.0.0 - 2026-05-03

- Milestone 1 MVP release for Closet Organizer.
- Added Google-authenticated access to the closet experience.
- Restricted the users directory to admin users only.
- Improved the shared app shell, logged-out route protection, and landing-page authorization messaging.
