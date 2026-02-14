# Specification

## Summary
**Goal:** Make the app fully usable without authentication and add a new WCA competition-based “Practice” flow that fetches upcoming competitions, lets users pick an event, and generates a 5-scramble practice set with browser-only persistence.

**Planned changes:**
- Remove all login/signup/auth UI entry points (login/account modals and any header/account controls tied to auth state) so timer features work without logging in.
- Remove email/password auth methods from the backend canister interface (e.g., signup/login/logout) and update frontend bindings accordingly.
- Add a new main navigation entry point labeled “Practice” that is accessible without login.
- Implement Practice browse screen: fetch upcoming competitions client-side from the official WCA API, show loading/error states, and display competitions in a scrollable list with name and location metadata when available.
- Add Practice list filtering: country filter and case-insensitive search by competition name or country name, with a way to clear filters.
- After selecting a competition, show its available events and allow selecting a single event to practice.
- Add Practice “ready” screen that generates and displays exactly 5 random WCA-standard scrambles for the selected event, with “Scramble 1/5” style and next/previous navigation without regenerating the set unless explicitly refreshed.
- Persist Practice session state in the browser only (selected competition, selected event, 5 scrambles, current scramble index) so refresh restores the session, and provide a UI control to reset/clear the saved session.
- Apply a coherent dark, competition-focused theme for the Practice screens (charcoal/graphite base with high-contrast accents; avoid blue & purple) with English UI text.

**User-visible outcome:** Users can use the timer and stats without any login, and can open “Practice” to browse and filter upcoming WCA competitions, pick a competition and event, then practice through a saved set of 5 scrambles that survives page refresh until they reset it.
