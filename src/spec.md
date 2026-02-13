# Specification

## Summary
**Goal:** Always reset the inspection countdown to 15.00 seconds (and reset warning triggers) immediately after each solve completes.

**Planned changes:**
- When the solve finishes and the timer transitions to the "stopped" state, reset the inspection countdown state to exactly 15,000ms.
- Reset the inspection warning state after each solve so the 8-second and 5-second warnings can trigger normally on the next inspection.
- Ensure the reset behavior works consistently for both Spacebar and touch/pointer interactions.

**User-visible outcome:** After every solve, the next inspection always starts from 15.00 seconds with warnings behaving normally, rather than resuming from the previous inspection’s remaining time.
