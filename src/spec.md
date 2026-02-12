# Specification

## Summary
**Goal:** Build a responsive WCA speedcubing timer that supports all official WCA events with official scrambles, scramble visualizations when available, and WCA-style mobile/desktop controls.

**Planned changes:**
- Create a mobile/desktop responsive timer screen with dedicated areas for scramble text, scramble visualization, timer display, and brief English control instructions.
- Add an event selector containing all official WCA events; selection drives scramble generation and visualization behavior.
- Integrate the official WCA scramble generator and add a “New Scramble” action to fetch the next scramble for the selected event.
- Show a scramble image/visualization for the current scramble when supported; otherwise display a clear English fallback message.
- Implement WCA-style timing interactions: desktop Space hold-to-arm/release-to-start and Space to stop; mobile touch-and-hold to arm/release-to-start and tap to stop; include clear visual state feedback (idle/armed/running/stopped).
- Preserve the final time after stopping until the next solve, and prevent/disable scramble changes while the timer is running.
- Apply a consistent, distinctive visual theme across all components (not using a blue/purple primary palette).

**User-visible outcome:** Users can select any official WCA event, generate official scrambles (with a matching visualization when available), and time solves using WCA-style controls on both desktop (Space) and mobile (touch), with a clear themed UI and stable timer/scramble behavior.
