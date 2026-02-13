# Specification

## Summary
**Goal:** Fix email/password signup/login doing nothing by aligning frontend auth calls with the backend canister’s exported auth methods and return types.

**Planned changes:**
- Update the Motoko actor to export `signup`, `login`, `validateSession`, and `logout` with stable, structured Result-style return values (session token + user info on success; readable error message on failure).
- Update the React email/password auth hook to match the backend return shapes, show loading state, and surface all failures (including thrown/network errors) inside the login/signup modal.
- Regenerate/update frontend backend-actor type declarations so the compiled actor includes `signup`, `login`, `validateSession`, and `logout`, preventing runtime interface mismatches.

**User-visible outcome:** Users can sign up and log in with email/password and will either be authenticated (modal closes) or see a clear error message; sessions restore correctly on page load and logout invalidates the session.
