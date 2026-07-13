# Phase 6: Reader, Library, and Reading Lists - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 6-Reader, Library, and Reading Lists
**Areas discussed:** Auth and profile QA depth, Reading-list mutation safety, Library and management authorization, Visual parity focus

---

## Auth and Profile QA Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Representative flows | Sign in with mock Google, inspect profile/TOS plus password or confirmation form surfaces, and backfill route behavior with specs. | ✓ |
| Full form tour | Visit every visible Devise/profile form in browser, even if several are low-risk or data-light. | |
| Smoke only | Verify sign-in and a few protected redirects visually, relying mostly on automated tests. | |

**User's choice:** Representative flows.
**Notes:** The phase should not spend browser QA time touring every low-risk Devise form. Use representative visual coverage and targeted specs for route behavior.

---

## Reading-List Mutation Safety

| Option | Description | Selected |
|--------|-------------|----------|
| Disposable browser list | Create a temporary reading list in browser, edit/save/delete it if the UI supports cleanup, and use specs/Jest for edge cases. | ✓ |
| Specs-first writes | Use request/Jest coverage for create/edit/save/delete, with browser QA limited to viewing forms and controls. | |
| Existing data only | Avoid creating records; inspect existing lists and document gaps if local data is thin. | |

**User's choice:** Disposable browser list.
**Notes:** Browser QA should create and clean up a temporary reading list when practical, with specs covering edge cases and non-visual behavior.

---

## Library and Management Authorization

| Option | Description | Selected |
|--------|-------------|----------|
| Use mock admin, supplement gaps | Sign in as mock admin, inspect any reachable library/management routes, and cover missing manager/request paths with controller/request specs. | ✓ |
| Seed manager data | Create or adjust local test data specifically so browser QA can exercise manager-only routes. | |
| Redirect-only for missing data | Treat protected redirects/not-found states as enough when manager data is unavailable. | |

**User's choice:** Use mock admin, supplement gaps.
**Notes:** Protected manager routes should receive meaningful coverage. If browser data is missing, specs must cover the authorization and route behavior.

---

## Visual Parity Focus

| Option | Description | Selected |
|--------|-------------|----------|
| Reading-list editor first | Give the closest Blueprint parity attention to the reading-list editor and save controls, then auth/profile forms and library management. | ✓ |
| Auth/profile first | Prioritize Devise/profile/TOS forms, then reading-list and library surfaces. | |
| All evenly | Apply the same visual depth to auth, profile, reading-list, and library screens. | |

**User's choice:** Reading-list editor first.
**Notes:** The reading-list editor and save controls are the primary visual parity target, followed by auth/profile forms and then library management screens.

---

## the agent's Discretion

- The agent may choose the exact representative Devise/profile forms.
- The agent may choose disposable reading-list test content and cleanup mechanics.
- The agent may decide whether missing manager/library data is best handled through narrow local setup or targeted specs, provided the QA evidence documents the tradeoff.

## Deferred Ideas

None.
