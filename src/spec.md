# Specification

## Summary
**Goal:** Replace the existing Internet Identity login flow with a custom email/password signup + login system backed by the Motoko canister, including session tokens so users stay logged in across refreshes.

**Planned changes:**
- Add Motoko backend support for email/password `signup` and `login`, storing per-user salt + password hash (no plaintext passwords) and treating emails case-insensitively.
- Add backend session token management: issue token on login, validate token to fetch current user (email + user id), and logout/invalidate token; persist backend state across upgrades (adding migration only if needed).
- Update `frontend/src/components/LoginModal.tsx` to an English email/password modal with both “Sign up” and “Log in”, including basic form validation.
- Integrate the updated modal into `frontend/src/components/TimerScreen.tsx` to preserve current behavior: auto-open on first visit for logged-out users and open via the existing header login icon.
- Implement a new frontend auth hook/provider that stores the session token locally, restores auth on refresh by validating the token with the backend, and exposes `signup`, `login`, `logout`, `isAuthenticated`, and current user info without relying on Internet Identity for app logic.

**User-visible outcome:** Users can sign up and log in with email/password, remain logged in across page refreshes via a session token, and log out; the app no longer prompts for Internet Identity.
