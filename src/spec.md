# Specification

## Summary
**Goal:** Make authentication work end-to-end by adding missing backend email/password auth methods and ensuring Internet Identity uses `mcubes.net` as the displayed/derived origin while supporting future domain changes without changing user principals.

**Planned changes:**
- Implement Motoko canister methods in `backend/main.mo`: `signup(email, password)`, `login(email, password)`, `validateSession(token)`, and `logout(token)` returning `Result` shapes expected by the existing frontend hook.
- Update frontend configuration so Internet Identity uses `mcubes.net` as the derivation origin shown during login, without changing immutable hooks.
- Add/configure a clear configuration point for Internet Identity alternative origins and route the chosen stable `ii_derivation_origin` through the existing `loadConfig()` / `config.ii_derivation_origin` mechanism to preserve principals across future domain changes.

**User-visible outcome:** Users can sign up, sign in, restore sessions, and log out using email/password without runtime “is not a function” errors, and Internet Identity login shows `mcubes.net` while remaining compatible with future domain moves (when configured).
