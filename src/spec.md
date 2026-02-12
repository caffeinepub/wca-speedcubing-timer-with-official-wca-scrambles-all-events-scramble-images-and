# Specification

## Summary
**Goal:** Make WCA inspection work correctly: countdown progression, 8s/5s warnings, start-on-release controls, and +2/DNF timing rules.

**Planned changes:**
- Fix inspection countdown to visibly and smoothly decrease from 15.00 to 0.00, updating every frame during inspection and stopping when the solve starts.
- Implement reliable one-time inspection warnings: an 8-second warning sound, and at 5 seconds remaining show “5 sec” and play the 5-second warning sound.
- Ensure input behavior matches start-on-release: holding arms the timer, releasing starts the solve (for both Spacebar and touch/pointer); solve time does not increment while holding.
- Apply requested inspection penalty rules: clamp inspection display at 0.00 (no negatives); starting within 2 seconds after 0.00 applies +2 (display trailing “+”); starting after 2 seconds results in DNF.

**User-visible outcome:** Inspection counts down correctly from 15 to 0 with proper 8s/5s warnings, the timer starts on release (not while holding), and solves started late correctly show +2 or DNF based on the 2-second grace period.
