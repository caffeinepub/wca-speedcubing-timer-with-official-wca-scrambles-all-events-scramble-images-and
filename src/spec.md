# Specification

## Summary
**Goal:** Prompt unauthenticated first-time visitors to sign in with Internet Identity via an auto-shown modal, while also providing a header login control to open the same modal later.

**Planned changes:**
- Add first-visit logic in `TimerScreen` to automatically open a login modal on page load when the user is not authenticated and no localStorage “shown” flag is set.
- Persist a localStorage flag after the modal is dismissed or after successful login so the modal does not auto-open again in the same browser.
- Add an accessible login icon/button in the `TimerScreen` header that opens the same login modal on demand.
- Create a reusable `LoginModal` component that encapsulates modal UI and uses `useInternetIdentity` for login status/actions, with an English CTA button that calls `useInternetIdentity().login()` only on user click.

**User-visible outcome:** On first visit while not signed in, users see a login popup with a “Sign in” button; later, they can open the same popup anytime via a header login icon/button.
