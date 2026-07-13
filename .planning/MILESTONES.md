# Milestones

## v1.0 Upgrade Stabilization (Shipped: 2026-05-12)

**Delivered:** Route-driven upgrade stabilization for the Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS migration.

**Phases completed:** 10 phases, 18 plans, 11 tasks

**Key accomplishments:**

- Jest coverage now locks Blueprint package CSS to Sprockets and preserves the application layout asset order.
- The legacy Blueprint bridge is now covered for existing nodes, mutation-observed nodes, class changes, duplicate prevention, and Rails-rendered exclusions.
- Phase 1 now has a reusable QA gate with passing automated checks and browser evidence held at human review for console/network noise.
- Route-derived case shell QA with existing local data, browser route evidence, and targeted controller verification
- Nested comment and forum JSON routes now have request coverage, browser QA evidence, and a fixed comment thread create path.
- Stats HTML, JSON, CSV, overview, date controls, map, and table routes passed without code changes.
- Quiz and submission JSON routes now have route-level request coverage, browser editor evidence, and a narrow payload compatibility fix.

**Archived:**

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- `.planning/milestones/v1.0-phases/`

**Known tech debt:** Nyquist validation artifacts are non-uniform across archived phases; see the milestone audit.

**What's next:** Define v1.1 with `$gsd-new-milestone`.

---
