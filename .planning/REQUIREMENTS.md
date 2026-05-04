# Requirements: Gala Upgrade Stabilization

**Defined:** 2026-05-03
**Core Value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Developer can run or connect to the Rails app at `localhost:3000` for route QA.
- [ ] **FOUND-02**: Application layout loads global JavaScript and CSS without duplicating BlueprintJS styles or breaking prior page-specific assumptions.
- [ ] **FOUND-03**: BlueprintJS compatibility behavior supports legacy `.pt-*` expectations and current `.bp4-*` classes where the app still depends on old styling.
- [ ] **FOUND-04**: QA gate records route group, representative URLs, browser result, console/network issues, automated tests run, and commit hash before advancing.

### Public Routes

- [ ] **PUB-01**: Error pages `403`, `404`, `422`, and `500` render without broken layout or missing styles.
- [ ] **PUB-02**: Health and diagnostic endpoints `up` and `runtime/stats` keep expected response formats and authorization behavior.
- [ ] **PUB-03**: Locale redirect routes preserve path/format behavior without causing frontend asset or layout regressions.
- [ ] **PUB-04**: Legacy published `/read/...` redirects remain intact.

### Catalog

- [ ] **CAT-01**: Root catalog route `/` renders catalog UI with expected Blueprint input, button, menu, and non-ideal-state styling.
- [ ] **CAT-02**: Catalog catch-all routes continue to hand off to React Router without Rails routing regressions.
- [ ] **CAT-03**: Catalog library and language routes render and respond correctly.
- [ ] **CAT-04**: Catalog search UI remains visually usable and does not show console/runtime errors.

### Cases

- [ ] **CASE-01**: Case index, show, create, edit, update, destroy, copy, delete confirmation, archive, settings, translations, and library routes keep existing behavior.
- [ ] **CASE-02**: Case React Router suffix routes under `/cases/:case_slug/...` render the same case shell and preserve nested route behavior.
- [ ] **CASE-03**: Case overview/editor Blueprint controls such as buttons, dialogs, editable text, popovers, tags, switches, and inputs retain acceptable spacing, icons, and interaction states.
- [ ] **CASE-04**: Case comments, forums, comment threads, activities, locks, taggings, podcasts, pages, cards, edgenotes, quizzes, stats, and Wikidata links remain functional after style fixes.

### Reader Workflows

- [ ] **READ-01**: Reader Devise routes for sign in, registration, confirmation, and session handling render without layout or Blueprint regressions.
- [ ] **READ-02**: Profile, persona, reader index, terms-of-service edit/update, roles, enrollments, magic link, and my-cases routes keep expected behavior.
- [ ] **READ-03**: Reading-list, saved-reading-list, save/unsave, library, library management, case-library-request, and managership routes remain styled and usable.

### Deployments and Integrations

- [ ] **DEP-01**: Deployment index, show, new, create, edit, update, and submissions routes remain functional and styled.
- [ ] **DEP-02**: Canvas deployment and LTI content-item/auth strategy routes preserve CSRF-skip validation boundaries and do not regress visual or redirect behavior.
- [ ] **DEP-03**: SPARQL/Wikidata routes retain current behavior while any discovered malformed-input regressions are documented for separate fix scope unless directly blocking QA.

### Admin and Operations

- [ ] **ADM-01**: Admin root and Administrate resources render with usable styling after the global asset loading change.
- [ ] **ADM-02**: Admin case copy and nested admin resources keep expected authorization and routing behavior.
- [ ] **ADM-03**: Sidekiq web route remains editor-only and is not broken by layout/style changes.

### Regression Gates

- [ ] **QA-01**: Each phase includes a route checklist derived from `config/routes.rb`.
- [ ] **QA-02**: Each phase performs browser QA on representative routes with console and network checks.
- [ ] **QA-03**: Each phase runs targeted automated tests where practical, choosing from `bundle exec rspec`, `./run-rspec.sh`, `bundle exec rake test:unit`, and `yarn test`.
- [ ] **QA-04**: Each phase commits only after the current route group passes QA or has documented, non-blocking exceptions.

### Cleanup

- [ ] **CLEAN-01**: Remove or consolidate duplicate BlueprintJS compatibility CSS/JS once all route groups pass.
- [ ] **CLEAN-02**: Remove dead imports, stale pack assumptions, unused compatibility shims, and misleading comments introduced during the upgrade.
- [ ] **CLEAN-03**: Final pass runs broad regression checks and updates documentation or planning notes with remaining known risks.

## v2 Requirements

### Future Modernization

- **MOD-01**: Migrate React/Flow/Redux frontend toward a current React and TypeScript architecture.
- **MOD-02**: Replace deprecated frontend packages such as old Babel proposal plugins, `babel-eslint`, and obsolete drag/drop libraries.
- **MOD-03**: Add automated visual regression screenshots for route groups.
- **MOD-04**: Add endpoint-specific security hardening for SPARQL, link expansion, dynamic lockable class resolution, and Sentry parameter filtering.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full UI redesign | Milestone goal is compatibility and stabilization, not new product design |
| BlueprintJS replacement | Current work must make the upgraded BlueprintJS stack behave acceptably |
| React architecture rewrite | Too broad for route-by-route upgrade stabilization |
| Production infrastructure changes | QA target is local Rails app on `localhost:3000` |
| New user-facing product features | Route behavior should be preserved while upgrade regressions are fixed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| PUB-01 | Phase 2 | Pending |
| PUB-02 | Phase 2 | Pending |
| PUB-03 | Phase 2 | Pending |
| PUB-04 | Phase 2 | Pending |
| CAT-01 | Phase 3 | Pending |
| CAT-02 | Phase 3 | Pending |
| CAT-03 | Phase 3 | Pending |
| CAT-04 | Phase 3 | Pending |
| CASE-01 | Phase 4 | Pending |
| CASE-02 | Phase 4 | Pending |
| CASE-03 | Phase 4 | Pending |
| CASE-04 | Phase 5 | Pending |
| READ-01 | Phase 6 | Pending |
| READ-02 | Phase 6 | Pending |
| READ-03 | Phase 6 | Pending |
| DEP-01 | Phase 7 | Pending |
| DEP-02 | Phase 7 | Pending |
| DEP-03 | Phase 7 | Pending |
| ADM-01 | Phase 8 | Pending |
| ADM-02 | Phase 8 | Pending |
| ADM-03 | Phase 8 | Pending |
| QA-01 | All phases | Pending |
| QA-02 | All phases | Pending |
| QA-03 | All phases | Pending |
| QA-04 | All phases | Pending |
| CLEAN-01 | Phase 9 | Pending |
| CLEAN-02 | Phase 9 | Pending |
| CLEAN-03 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-05-03*
*Last updated: 2026-05-03 after initial definition*
