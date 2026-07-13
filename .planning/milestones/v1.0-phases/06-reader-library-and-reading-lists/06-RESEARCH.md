# Phase 6: Reader, Library, and Reading Lists - Research

**Researched:** 2026-05-04
**Domain:** Rails reader authentication, profile, library management, and reading-list workflows
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Auth and Profile QA Depth
- **D-01:** Use representative browser flows for Devise and profile/TOS routes rather than visiting every low-risk form in browser.
- **D-02:** Browser QA should sign in through `/readers/sign_in` and click `a.oauth-icon-google`, using `config/initializers/mock_omniauth.rb` to authenticate the mock admin `dev@learnmsc.org`.
- **D-03:** Inspect representative signed-in account surfaces such as profile edit/show and terms-of-service handling, plus at least one public Devise form surface such as sign-in, password reset, confirmation, registration, or unlock depending on route availability.
- **D-04:** Backfill route behavior, redirects, and authorization branches with targeted request/controller specs where browser coverage would be repetitive or data-light.

### Reading-List Mutation Safety
- **D-05:** Use a disposable browser-created reading list for the main visual and functional reading-list QA path.
- **D-06:** Exercise create, edit, item selection, save/unsave, and delete/cleanup when the UI and local data make cleanup practical.
- **D-07:** Use existing local cases/enrollments first for list item selection. Do not build broad seed-data infrastructure just for this phase.
- **D-08:** Cover edge cases and hidden-field behavior with focused Jest/request specs, especially around `app/javascript/reading_list` and nested `reading_list_items_attributes`.

### Library and Management Authorization
- **D-09:** Use the mock admin session for reachable library, managership, case-library-request, reader, enrollment, editorship, and my-cases surfaces.
- **D-10:** If local data does not include manager-accessible libraries or pending case-library requests, document the browser gap and supplement manager/request paths with controller/request specs.
- **D-11:** Do not treat anonymous redirect behavior as sufficient for manager-focused routes when the route's visible affordance or authorization behavior is central to the phase.
- **D-12:** Create or modify local data only when it is narrow, disposable, and clearly safer than overbuilding seed setup.

### Visual Parity Focus
- **D-13:** Give the closest Blueprint parity attention to the reading-list editor, item chooser, hidden-form-backed item list, and save/unsave controls.
- **D-14:** Auth/profile forms are the second visual priority: verify form density, inputs, labels, button sizing, OAuth button presentation, flashes, and TOS flow.
- **D-15:** Library and management screens are the third visual priority: verify tables/lists, management buttons, destructive controls, confirmation flows, and visible authorization affordances.
- **D-16:** Keep visual fixes route-driven and narrow. Add `.bp4-*` companions or scoped compatibility styles only where Phase 6 surfaces visibly need them.

### Carried Forward
- **D-17:** `config/routes.rb` remains the source of truth for route coverage.
- **D-18:** Browser QA should use `localhost:3000` for the app and `http://host.docker.internal:3000` from Playwright MCP when running in the browser container.
- **D-19:** Check browser console and network errors before marking the route group complete.
- **D-20:** Existing React 16 warnings, accepted local Mapbox style noise, and unrelated third-party/browser noise should be classified rather than failed unless visible behavior breaks.
- **D-21:** Docker Compose is the preferred runtime for targeted app tests because the host Ruby does not match the app runtime.

### the agent's Discretion
- The agent may choose the exact representative Devise/profile forms based on route reachability and local data, as long as the QA evidence explains the sample.
- The agent may choose the disposable reading-list title/content and cleanup approach.
- The agent may decide whether a missing manager/library browser path is better covered by a narrow local record setup or a targeted spec, but must document the choice.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| READ-01 | Reader Devise routes for sign in, registration, confirmation, and session handling render without layout or Blueprint regressions. | Use Devise route/controller patterns, `layouts/devise.html.erb`, `devise/sessions/_sign_in.html.haml`, and mock OmniAuth sign-in for browser QA. [VERIFIED: config/routes.rb, app/views/devise, config/initializers/mock_omniauth.rb] |
| READ-02 | Profile, persona, reader index, TOS edit/update, roles, enrollments, magic link, and my-cases routes keep expected behavior. | Use `ReadersController`, `PersonasController`, `MagicLinksController`, existing TOS request specs, and targeted specs for repetitive redirects/authorization. [VERIFIED: app/controllers/readers_controller.rb, app/controllers/personas_controller.rb, app/controllers/magic_links_controller.rb, spec/requests/reader_spec.rb] |
| READ-03 | Reading-list, saved-reading-list, save/unsave, library, library management, case-library-request, and managership routes remain styled and usable. | Use reading-list React island plus Rails nested attributes, Stimulus save/unsave controller, Pundit policies, and library/managership/request controllers. [VERIFIED: app/javascript/reading_list, app/javascript/controllers/reading_list_controller.js, app/controllers/libraries_controller.rb, app/controllers/managerships_controller.rb] |
| QA-01 | Each phase includes a route checklist derived from `config/routes.rb`. | Route table below enumerates the Phase 6 routes from `config/routes.rb`. [VERIFIED: config/routes.rb] |
| QA-02 | Each phase performs browser QA on representative routes with console and network checks. | Browser QA must use `localhost:3000`/`host.docker.internal:3000`, mock Google login, and classify known console noise. [VERIFIED: AGENTS.md, 06-CONTEXT.md, STATE.md] |
| QA-03 | Each phase runs targeted automated tests where practical. | Use `yarn test` for reading-list React/Stimulus-adjacent logic and `./run-rspec.sh` or `bundle exec rspec` for request/controller specs. [VERIFIED: package.json, .rspec, .planning/codebase/TESTING.md] |
| QA-04 | Each phase commits only after QA passes or documented non-blocking exceptions exist. | Commit after the Phase 6 QA gate; document browser gaps caused by missing local data only when specs cover behavior. [VERIFIED: AGENTS.md, 06-CONTEXT.md] |
</phase_requirements>

## Summary

Phase 6 should be planned as a route-driven stabilization pass over existing Rails-rendered account/library pages plus a small React/Stimulus reading-list island. The primary stack is already fixed by the repo: Rails 8.1.3, Devise 4.9.4, Pundit 2.1.0, React 16.12.0, Stimulus 1.1.1, Shakapacker 10.0.0, and BlueprintJS 4.20.2 with legacy `.pt-*` compatibility expectations. [VERIFIED: Gemfile.lock, yarn.lock, package.json]

The highest-risk workflow is reading-list mutation because UI state in `app/javascript/reading_list` becomes Rails nested attributes submitted to `ReadingListsController#reading_list_params`. The second risk area is protected-route authorization: library management, reader roles, TOS, profile, and case-library-request routes depend on Devise session state and Pundit policy branches. [VERIFIED: app/javascript/reading_list/HiddenFormInputs.jsx, app/controllers/reading_lists_controller.rb, app/policies/*_policy.rb]

**Primary recommendation:** Plan one browser QA path that signs in with mock Google, creates/edits/saves/unsaves a disposable reading list, and samples profile/library management surfaces; supplement repetitive protected branches with request/controller specs and reading-list hidden-input behavior with Jest.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Reader authentication and session handling | Rails backend | Rails views | Devise owns sessions/controllers/routes; views render forms and OAuth affordances. [VERIFIED: config/routes.rb, app/controllers/readers/sessions_controller.rb, app/views/devise] |
| Profile, persona, and TOS updates | Rails backend | Rails views | `ReadersController` and `PersonasController` authorize and persist changes; HAML views render forms. [VERIFIED: app/controllers/readers_controller.rb, app/controllers/personas_controller.rb] |
| Reading-list create/edit mutation | Rails backend | Browser React island | Rails owns persistence and strong params; React owns item selection/editor state and hidden inputs. [VERIFIED: app/controllers/reading_lists_controller.rb, app/javascript/reading_list] |
| Reading-list save/unsave | Rails backend | Browser Stimulus | `ReadingListSavesController` mutates saved lists; Stimulus toggles visible save/tag state. [VERIFIED: app/controllers/reading_list_saves_controller.rb, app/javascript/controllers/reading_list_controller.js] |
| Library/managership/request authorization | Rails backend | Rails views | Pundit policies and controller scopes decide access; views expose management affordances conditionally. [VERIFIED: app/controllers/libraries_controller.rb, app/controllers/managerships_controller.rb, app/policies/library_policy.rb] |
| Route QA evidence | Browser/client | Test runner | Browser verifies rendered layout/console/network; specs verify data-light authorization and redirects. [VERIFIED: AGENTS.md, .planning/codebase/TESTING.md] |

## Project Constraints (from AGENTS.md)

- Use `.planning/` artifacts for GSD planning. [VERIFIED: AGENTS.md]
- Work phases sequentially from `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- Use `config/routes.rb` as the source of truth for route coverage. [VERIFIED: AGENTS.md]
- Use `localhost:3000` for browser QA. [VERIFIED: AGENTS.md]
- Check browser console and network errors before marking a route group complete. [VERIFIED: AGENTS.md]
- Run targeted tests for touched files; relevant commands include `yarn test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`. [VERIFIED: AGENTS.md]
- Commit after each phase QA gate passes. [VERIFIED: AGENTS.md]
- Keep fixes narrow and route-driven; avoid broad redesigns or unrelated dependency upgrades. [VERIFIED: AGENTS.md]
- Current BlueprintJS packages are 4.x, but visual compatibility target is the prior BlueprintJS 2.3.1-era Gala experience. [VERIFIED: AGENTS.md]
- Be careful around global asset loading in `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, and `app/javascript/shared/blueprintLegacyNamespace.js`. [VERIFIED: AGENTS.md]
- Avoid duplicating Blueprint CSS or adding route-specific shims before confirming the route group actually needs them. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Rails | 8.1.3 | MVC routes, controllers, views, ActiveRecord persistence | Existing app framework; Phase 6 routes are Rails resources and Devise routes. [VERIFIED: Gemfile.lock, config/routes.rb] |
| Devise | 4.9.4 | Reader authentication, registration, confirmations, sessions | Existing `devise_for :readers` setup; Devise provides controller/view helpers such as scoped authentication helpers. [VERIFIED: Gemfile.lock, config/routes.rb] [CITED: github.com/heartcombo/devise] |
| Pundit | 2.1.0 | Authorization policies and scoped collections | Existing policies gate readers, reading lists, libraries, and management routes. [VERIFIED: Gemfile.lock, app/policies] [CITED: github.com/varvet/pundit] |
| React | 16.12.0 | Reading-list editor island | Existing reading-list editor uses hooks and renders inside Stimulus. [VERIFIED: yarn.lock, app/javascript/reading_list/ReadingListEditor.jsx] |
| Stimulus | 1.1.1 | Rails view controller for reading-list editor mount and save/unsave UI | Existing `reading_list_controller.js` uses targets/actions and mounts React. [VERIFIED: yarn.lock, app/javascript/controllers/reading_list_controller.js] [CITED: stimulus.hotwired.dev/reference/actions] |
| BlueprintJS core | 4.20.2 | Button, input, form, table, tag, callout class styling | Current package; phase target is legacy visual parity through `.pt-*` and selective `.bp4-*` companions. [VERIFIED: yarn.lock, app/views/reading_lists, app/views/libraries] |
| Shakapacker | 10.0.0 | JavaScript pack/build integration | Existing frontend asset pipeline; do not change it in this phase. [VERIFIED: Gemfile.lock, yarn.lock] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| RSpec Rails | 7.1.0 | Request/controller/model/policy tests | Use for Devise redirects, TOS behavior, profile/persona, saved-list JSON, library authorization, and request management branches. [VERIFIED: Gemfile.lock, spec/requests] |
| Jest | 24.9.0 | Frontend tests | Use for reading-list hidden input and pure UI state behavior. [VERIFIED: yarn.lock, jest.config.js] |
| Capybara | 3.40.0 | Feature specs | Avoid as a primary gate unless needed; Phase 4 recorded local Selenium setup issues. [VERIFIED: Gemfile.lock, STATE.md] |
| FactoryBot Rails | installed | Test data factories | Use existing `reader`, `reading_list`, `library`, `managership`, `enrollment`, and related factories for focused specs. [VERIFIED: spec/factories] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Browser visiting every Devise form | Representative browser sample plus request specs | Matches locked decisions and avoids repetitive low-value browser checks. [VERIFIED: 06-CONTEXT.md] |
| Broad seed-data setup for all protected routes | Disposable narrow local data or specs | Reduces mutation risk and keeps the phase route-driven. [VERIFIED: 06-CONTEXT.md] |
| New frontend form library | Existing BlueprintFormBuilder plus React island | Current forms already use BlueprintFormBuilder and legacy classes; new form stack is out of scope. [VERIFIED: app/views/readers/_form.html.haml, app/views/reading_lists/_form.html.erb] |
| Dependency upgrade to latest Blueprint/React/Devise | Existing locked dependencies | Upgrade work is explicitly out of scope for route stabilization. [VERIFIED: AGENTS.md, REQUIREMENTS.md] |

**Installation:** No dependency installation is recommended for this phase. [VERIFIED: AGENTS.md]

**Version verification:** Checked `Gemfile.lock`, `yarn.lock`, and `package.json` for installed versions. Escalated `npm view` registry checks found current registry versions `@blueprintjs/core` 6.12.1 (modified 2026-04-23), `react` 19.2.5 (modified 2026-05-04), `shakapacker` 10.0.0 (modified 2026-04-09), `jest` 30.3.0 (modified 2026-03-10), and `stimulus` 3.2.2 (modified 2023-08-07). These registry latest versions are not recommended for this phase because project constraints forbid unrelated upgrades. [VERIFIED: npm registry, yarn.lock, Gemfile.lock, AGENTS.md]

## Phase 6 Route Checklist

| Route Area | Representative Paths | Primary QA Mode |
|------------|----------------------|-----------------|
| Devise reader routes | `/readers/sign_in`, `/readers/sign_up`, `/readers/password/new`, `/readers/confirmation/new`, `/readers/unlock/new` | Browser sample plus request specs for session/redirect behavior. [VERIFIED: config/routes.rb, app/views/devise] |
| Profile/persona/TOS | `/profile`, `/profile/edit`, `/profile/persona/edit`, `/readers/:id/edit_tos` | Browser after mock sign-in; existing and added request specs for update branches. [VERIFIED: config/routes.rb, app/controllers/readers_controller.rb, app/controllers/personas_controller.rb] |
| Reader/admin-adjacent routes | `/readers`, `/readers/:reader_id/roles`, `/enrollments`, `/editorships/:id`, `/my_cases` | Browser sample as mock admin where reachable; specs for authorization/JSON branches. [VERIFIED: config/routes.rb] |
| Libraries and management | `/libraries`, `/libraries/:slug/edit`, `/libraries/:slug/managerships/new`, `/managerships`, `/case_library_requests` | Browser sample with mock admin/local data; specs when manager/request data is missing. [VERIFIED: config/routes.rb, app/controllers/libraries_controller.rb] |
| Reading lists | `/reading_lists/new`, `/reading_lists/:uuid`, `/reading_lists/:uuid/edit`, `/reading_lists/:uuid/save`, `/saved_reading_lists` | Deep browser flow plus Jest/request specs. [VERIFIED: config/routes.rb, app/views/reading_lists, app/javascript/reading_list] |
| Magic link | `/magic_link?key=...` | Browser or request spec with deployment factory depending on local data. [VERIFIED: config/routes.rb, app/controllers/magic_links_controller.rb] |

## Architecture Patterns

### System Architecture Diagram

```text
Browser route visit
  -> Rails router (config/routes.rb)
    -> Devise authentication gate where required
      -> Pundit policy/scope for protected domain actions
        -> Rails controller loads/persists records
          -> Rails HAML/ERB view renders Blueprint legacy classes
            -> Shakapacker controllers pack starts Stimulus
              -> reading-list Stimulus controller mounts React editor
                -> React editor mutates item state
                  -> HiddenFormInputs emits nested Rails params
                    -> ReadingListsController strong params persist items

Reading-list show save/unsave branch:
Browser button click
  -> Stimulus data-action reading-list#save / #unsave
    -> Orchard POST/DELETE /reading_lists/:uuid/save
      -> ReadingListSavesController
        -> current_reader.saved_reading_lists mutation
          -> Stimulus toggles save button / saved tag
```

### Recommended Project Structure

```text
app/controllers/
├── readers_controller.rb                 # profile, reader index, TOS
├── personas_controller.rb                # profile persona update
├── reading_lists_controller.rb           # reading-list CRUD
├── reading_list_saves_controller.rb      # save/unsave mutation
├── saved_reading_lists_controller.rb     # saved-list JSON
├── libraries_controller.rb               # library list/edit/manage shell
├── managerships_controller.rb            # library manager JSON/forms
└── case_library_requests_controller.rb   # pending request management

app/javascript/
├── reading_list/                         # React editor and hidden inputs
└── controllers/reading_list_controller.js # Stimulus mount/save controller

app/views/
├── devise/                               # public auth forms
├── readers/                              # profile/TOS/readers
├── reading_lists/                        # reading-list form/show/save button
├── libraries/                            # library index/edit/partials
└── managerships/                         # manager invite form

spec/
├── requests/                             # route behavior and JSON contracts
├── controllers/                          # controller branches where established
├── policies/                             # authorization expectations
└── factories/                            # focused test data
```

### Pattern 1: Rails Form + React Island + Hidden Inputs

**What:** Keep the Rails form as the source of submission and let React manage only the item editor state. Hidden inputs translate React state into `reading_list[reading_list_items_attributes]`. [VERIFIED: app/views/reading_lists/_form.html.erb, app/javascript/reading_list/HiddenFormInputs.jsx]

**When to use:** Any reading-list create/edit fix involving case selection, item notes, ordering, or deletions.

**Example:**

```erb
<!-- Source: app/views/reading_lists/_form.html.erb -->
<div
  data-controller="reading-list"
  data-target="reading-list.editor"
  data-reading-list-items="<%= ActiveModel::Serializer.for(reading_list.items).to_json %>"
></div>
```

### Pattern 2: Pundit-Gated Management Affordances

**What:** Controllers call `authorize`/`policy_scope`; views conditionally display edit/delete/create affordances with `policy(...)`. Pundit documents that `authorize` infers the policy and action, while `policy_scope` resolves scoped collections. [VERIFIED: app/controllers/libraries_controller.rb, app/views/libraries/index.html.haml] [CITED: github.com/varvet/pundit]

**When to use:** Library edit, library create/delete, reader role, managership, and case-library-request routes.

**Example:**

```haml
-# Source: app/views/libraries/index.html.haml
- if policy(library).update?
  = link_to edit_library_path(library),
            class: %i[pt-button pt-minimal pt-icon-cog],
            aria: { label: I18n.t('helpers.edit') } do
    -# Empty
```

### Pattern 3: Stimulus Save/Unsave State Toggle

**What:** Use Stimulus `data-action` and targets for small DOM interactions, backed by server mutation. Stimulus actions connect DOM events to controller methods, and targets expose named DOM elements as controller properties. [VERIFIED: app/javascript/controllers/reading_list_controller.js] [CITED: stimulus.hotwired.dev/reference/actions] [CITED: stimulus.hotwired.dev/reference/targets]

**When to use:** Reading-list save/unsave behavior and any narrow repair to the show page controls.

**Example:**

```javascript
// Source: app/javascript/controllers/reading_list_controller.js
async save () {
  await Orchard.graft(`/reading_lists/${this.id}/save`)

  this.saveButtonTarget.classList.add('hidden')
  this.savedTagTarget.classList.remove('hidden')
}
```

### Anti-Patterns to Avoid

- **Adding global Blueprint CSS for a single Phase 6 issue:** Confirm the route group needs the style and prefer scoped `.bp4-*` companions. [VERIFIED: AGENTS.md]
- **Replacing Rails forms with new React forms:** Existing server forms, strong params, and tests depend on nested attributes. [VERIFIED: app/controllers/reading_lists_controller.rb]
- **Using anonymous redirect checks as library-management coverage:** Manager-focused routes require authorized visible affordance or spec coverage. [VERIFIED: 06-CONTEXT.md]
- **Creating broad seed infrastructure:** Use existing data first, then narrow disposable records or specs. [VERIFIED: 06-CONTEXT.md]
- **Changing auth/session flows while fixing layout:** Devise behavior is established and not the target of this phase. [VERIFIED: REQUIREMENTS.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication/session handling | Custom login/session controller | Existing Devise controllers/routes/helpers | Devise already owns reader sessions, registrations, confirmations, passwords, rememberable behavior, and helpers. [VERIFIED: config/routes.rb] [CITED: github.com/heartcombo/devise] |
| Authorization | Ad hoc `if current_reader.editor?` checks | Pundit policies and scopes | Existing policies encode library, reader, and reading-list permissions; views already use `policy(...)`. [VERIFIED: app/policies] |
| Reading-list param serialization | Manual string-concatenated field names in views | Existing `HiddenFormInputs` component | Existing Jest coverage verifies nested attributes, positions, ids, and `_destroy`. [VERIFIED: app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx] |
| Save/unsave AJAX | New fetch helper | `Orchard.graft` and `Orchard.prune` | Existing shared helper handles app request conventions and is already used by the controller. [VERIFIED: app/javascript/controllers/reading_list_controller.js, app/javascript/shared/orchard.js] |
| Browser login setup | Manual database session hacks | Mock OmniAuth Google login | Existing development/test mock signs in `dev@learnmsc.org`. [VERIFIED: config/initializers/mock_omniauth.rb] |

**Key insight:** This phase is stabilizing existing route behavior; custom replacements increase regression risk because the app already has domain-specific controller, policy, form builder, and frontend helper contracts. [VERIFIED: REQUIREMENTS.md, AGENTS.md]

## Common Pitfalls

### Pitfall 1: Hidden Inputs Drift from Rails Strong Params
**What goes wrong:** React item changes render correctly but create/update silently drops fields or deletes the wrong items.
**Why it happens:** `HiddenFormInputs` and `ReadingListsController#reading_list_params` must agree on `id`, `position`, `notes`, `case_slug`, and `_destroy`.
**How to avoid:** Run/extend `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx` and add request coverage for nested attributes if controller behavior changes. [VERIFIED: app/controllers/reading_lists_controller.rb, app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx]
**Warning signs:** Items disappear after save, ordering resets, deleted items return, or submitted params omit `reading_list_items_attributes`.

### Pitfall 2: Save/Unsave UI Looks Updated but Server State Fails
**What goes wrong:** The save button toggles, but `/saved_reading_lists` does not reflect the saved state.
**Why it happens:** Stimulus optimistically toggles after `Orchard.graft/prune`; failures must surface in console/network QA.
**How to avoid:** Check browser network for POST/DELETE `/reading_lists/:uuid/save` and run saved-list request specs. [VERIFIED: app/controllers/reading_list_saves_controller.rb, spec/requests/saved_reading_lists_index_spec.rb]
**Warning signs:** 401/404/422/500 network responses, duplicate saves, or saved tag state reset after refresh.

### Pitfall 3: Missing Local Data Hides Authorization Regressions
**What goes wrong:** Browser QA only observes redirects or empty pages, missing manager/request affordance regressions.
**Why it happens:** Local admin may not have a manager-accessible library, pending request, or enrolled cases.
**How to avoid:** Use narrow disposable records when practical; otherwise add request/controller specs for manager/request branches and document browser gaps. [VERIFIED: 06-CONTEXT.md]
**Warning signs:** Library edit route cannot be reached, case-library request list is empty, or only anonymous redirects were inspected.

### Pitfall 4: Blueprint Prefix Mismatch
**What goes wrong:** Buttons, inputs, icons, tags, tables, or cards lose spacing/icons after Blueprint 4.
**Why it happens:** Blueprint 3 changed class prefix from `pt-` to `bp3-`; Blueprint 4 changed namespace to `bp4-` and changed several component visuals. [CITED: github.com/palantir/blueprint/wiki/Blueprint-3.0] [CITED: github.com/palantir/blueprint/wiki/Blueprint-4.0]
**How to avoid:** Add scoped `.bp4-*` companions only where Phase 6 surfaces visibly need them; preserve legacy `.pt-*` for compatibility. [VERIFIED: AGENTS.md]
**Warning signs:** Missing icons, full-width inputs not filling, disabled buttons not styled, tag/callout/table density changes.

### Pitfall 5: Host Ruby Does Not Match App Runtime
**What goes wrong:** Host `bundle exec` can fail or run under the wrong Ruby.
**Why it happens:** Environment audit found host Ruby 2.6.10 while the app Gemfile targets Rails 8.1 and project state says Docker Compose is preferred. [VERIFIED: local `ruby --version`, STATE.md]
**How to avoid:** Prefer `./run-rspec.sh` or Docker Compose for Rails specs; use host `yarn test` for Jest if dependencies are installed. [VERIFIED: STATE.md, .planning/codebase/TESTING.md]
**Warning signs:** Bundler/RubyGems warnings, Ruby version errors, or gem load failures.

## Code Examples

### Reading-List Strong Params

```ruby
# Source: app/controllers/reading_lists_controller.rb
def reading_list_params
  params.require(:reading_list).permit(
    :title, :description,
    reading_list_items_attributes: %i[id position notes case_slug _destroy]
  )
end
```

### Existing Hidden-Input Test Pattern

```javascript
// Source: app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx
expect(form).toHaveFormValues({
  'reading_list[reading_list_items_attributes][0][case_slug]': 'mi-wolves',
  'reading_list[reading_list_items_attributes][0][notes]': 'Cool!',
  'reading_list[reading_list_items_attributes][0][id]': '',
  'reading_list[reading_list_items_attributes][0][position]': '1',
})
```

### Existing TOS Request Pattern

```ruby
# Source: spec/requests/reader_spec.rb
reader = create :reader, terms_of_service: nil
sign_in reader
post update_tos_reader_path(reader),
     params: { id: reader, reader: { terms_of_service: '1' } }
expect(reader.reload.terms_of_service)
  .to eq Rails.application.config.current_terms_of_service
```

### Mock Admin Browser Login

```ruby
# Source: config/initializers/mock_omniauth.rb
OmniAuth.config.mock_auth[:google] = DEV_MOCK_AUTH_HASH
```

Browser QA should visit `/readers/sign_in` and click `a.oauth-icon-google`; the mock identity is `dev@learnmsc.org`. [VERIFIED: 06-CONTEXT.md, config/initializers/mock_omniauth.rb]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Blueprint `pt-` namespace | Blueprint 4 uses `bp4-` namespace; Gala still carries legacy `.pt-*` classes for visual parity | Blueprint 4.0 migration guide, edited 2022-06-15 | Phase fixes must bridge classes narrowly, not remove legacy classes. [CITED: github.com/palantir/blueprint/wiki/Blueprint-4.0] [VERIFIED: AGENTS.md] |
| Full browser coverage for every route variant | Representative browser QA plus targeted specs | Locked in Phase 6 discussion on 2026-05-04 | Planner should avoid exhaustive browser route explosion. [VERIFIED: 06-CONTEXT.md] |
| Host Rails test execution as default | Docker Compose preferred for Rails specs | Carried forward from prior phase state | Plan Rails verification through Docker when host Ruby blocks execution. [VERIFIED: STATE.md] |

**Deprecated/outdated:**
- Broad UI redesign or Blueprint replacement: out of scope for v1 stabilization. [VERIFIED: REQUIREMENTS.md]
- Route-specific compatibility shims without observed need: forbidden by project guidance. [VERIFIED: AGENTS.md]
- Capybara feature specs as the main Phase 6 evidence: risky locally because Phase 4 recorded Selenium setup failure. [VERIFIED: STATE.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Existing local app data may include at least one usable case or library for browser QA. [ASSUMED] | User Constraints / Route Checklist | Browser QA may need narrow disposable records or specs instead. |
| A2 | Docker Compose services can run the Rails test suite in the intended app runtime. [ASSUMED] | Environment Availability / Validation Architecture | Planner may need to add setup/remediation if Docker services are not healthy. |

## Open Questions

1. **Which local records exist for reading-list item selection and library management?**
   - What we know: Use existing local cases/enrollments first and avoid broad seeds. [VERIFIED: 06-CONTEXT.md]
   - What's unclear: The current database contents were not inspected during research.
   - Recommendation: During execution, inspect via browser first; create only narrow disposable records if the route cannot be meaningfully exercised.

2. **Can the Rails specs run through Docker without environment repair?**
   - What we know: Docker CLI is installed; host Ruby is 2.6.10 and project state prefers Docker. [VERIFIED: local environment audit, STATE.md]
   - What's unclear: Running Docker Compose was not performed in research.
   - Recommendation: Planner should use `./run-rspec.sh` first and fall back to documented Docker Compose command if needed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Jest/frontend tooling | yes | v24.15.0 | Use Docker/known project runtime if Node version causes package issues. [VERIFIED: local `node --version`] |
| Yarn | Jest/frontend tooling | yes | 1.22.22 | npm scripts only if Yarn unavailable. [VERIFIED: local `yarn --version`] |
| Docker | Preferred Rails test runtime | yes | 29.4.1 | Host bundle only if Ruby/gems are compatible. [VERIFIED: local `docker --version`] |
| Bundler | Rails tests | yes | 2.4.19 | Docker Compose test runner. [VERIFIED: local `bundle --version`] |
| Ruby host | Rails tests | available, wrong version risk | 2.6.10 | Docker Compose test runner. [VERIFIED: local `ruby --version`, STATE.md] |
| Browser app server | Browser QA | not checked | expected `localhost:3000` | Start app through existing project workflow before QA. [VERIFIED: AGENTS.md] |

**Missing dependencies with no fallback:**
- None identified during research. [VERIFIED: local environment audit]

**Missing dependencies with fallback:**
- Host Ruby runtime mismatch risk; use Docker Compose / `./run-rspec.sh`. [VERIFIED: STATE.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | RSpec Rails 7.1.0; Jest 24.9.0 [VERIFIED: Gemfile.lock, yarn.lock] |
| Config file | `.rspec`, `spec/rails_helper.rb`, `jest.config.js` [VERIFIED: .rspec, jest.config.js] |
| Quick run command | `yarn test app/javascript/reading_list` for frontend; `./run-rspec.sh spec/requests/reader_spec.rb spec/requests/saved_reading_lists_index_spec.rb` for existing Rails request checks [VERIFIED: package.json, .planning/codebase/TESTING.md] |
| Full suite command | `yarn test` and `./run-rspec.sh` [VERIFIED: package.json, .planning/codebase/TESTING.md] |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| READ-01 | Devise forms render and session routes redirect/authenticate correctly | browser + request | `./run-rspec.sh spec/requests/reader_spec.rb` plus new Devise request specs if behavior changes | partial |
| READ-02 | Profile/persona/TOS/reader/admin-adjacent routes keep behavior | request/controller + browser | `./run-rspec.sh spec/requests/reader_spec.rb spec/requests/persona_update_spec.rb` | partial |
| READ-03 | Reading-list CRUD, save/unsave, saved-list JSON, library management stay usable | Jest + request + browser | `yarn test app/javascript/reading_list && ./run-rspec.sh spec/requests/saved_reading_lists_index_spec.rb` plus new focused specs | partial |
| QA-01 | Route checklist derives from `config/routes.rb` | review artifact | no automated command | yes |
| QA-02 | Browser QA captures route result, console, and network | manual/browser | Playwright MCP against `http://host.docker.internal:3000` | manual |
| QA-03 | Targeted automated tests run | command evidence | `yarn test ...`, `./run-rspec.sh ...` | yes |
| QA-04 | Commit only after QA gate | git/process | `git status`, phase commit | manual |

### Sampling Rate

- **Per task commit:** Run the narrow Jest or RSpec file related to touched code. [VERIFIED: AGENTS.md]
- **Per wave merge:** Run `yarn test app/javascript/reading_list` and relevant Phase 6 request specs. [VERIFIED: package.json, .planning/codebase/TESTING.md]
- **Phase gate:** Browser QA representative routes, console/network inspection, targeted Jest/RSpec green or documented non-blocking exception. [VERIFIED: AGENTS.md, 06-CONTEXT.md]

### Wave 0 Gaps

- [ ] `spec/requests/reading_lists_spec.rb` - covers READ-03 CRUD, authorization, nested attribute persistence if implementation touches controller behavior.
- [ ] `spec/requests/reading_list_saves_spec.rb` - covers READ-03 save/unsave status and saved state if implementation touches save controls.
- [ ] `spec/requests/libraries_management_spec.rb` or controller specs - covers READ-03 manager/request branches if local browser data is missing.
- [ ] Devise/profile request spec additions - covers READ-01/READ-02 branches selected as representative but not browser-tested.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Devise reader authentication and OmniAuth mock only for local QA. [VERIFIED: Gemfile.lock, config/routes.rb, config/initializers/mock_omniauth.rb] |
| V3 Session Management | yes | Devise session handling; do not hand-roll session mutation. [VERIFIED: app/controllers/readers/sessions_controller.rb] |
| V4 Access Control | yes | Pundit policies/scopes for reader, reading-list, and library management authorization. [VERIFIED: app/policies] |
| V5 Input Validation | yes | Rails strong params and model validations; reading-list nested attributes permit list is explicit. [VERIFIED: app/controllers/reading_lists_controller.rb] |
| V6 Cryptography | no direct implementation | No custom crypto planned; Devise/Warden and Rails own auth/session internals. [VERIFIED: phase scope, Gemfile.lock] |

### Known Threat Patterns for Rails/Devise/Pundit

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized library/list mutation | Elevation of privilege | Keep `authenticate_reader!` and `authorize` checks; add request specs for owner/manager/editor branches. [VERIFIED: app/controllers/reading_lists_controller.rb, app/controllers/libraries_controller.rb, app/policies] |
| Mass assignment through nested attributes | Tampering | Use strong params allowlist and tests for accepted fields only. [VERIFIED: app/controllers/reading_lists_controller.rb] |
| CSRF or unauthenticated save/unsave | Tampering | Use existing Rails authenticity/session stack and Devise authentication gate. [VERIFIED: app/controllers/reading_list_saves_controller.rb] |
| Exposing hidden management affordances | Information disclosure / elevation of privilege | Use Pundit-backed conditional view rendering and route specs. [VERIFIED: app/views/libraries/index.html.haml, app/policies/library_policy.rb] |

## Sources

### Primary (HIGH confidence)
- `AGENTS.md` - repository execution rules and Blueprint compatibility constraints.
- `.planning/phases/06-reader-library-and-reading-lists/06-CONTEXT.md` - locked Phase 6 decisions.
- `.planning/REQUIREMENTS.md` - READ and QA requirements.
- `.planning/STATE.md` - phase position, Docker preference, known browser noise.
- `config/routes.rb` - Phase 6 route source of truth.
- `Gemfile.lock`, `yarn.lock`, `package.json` - checked-in stack versions.
- npm registry - latest package versions and modified timestamps for `@blueprintjs/core`, `react`, `shakapacker`, `jest`, and `stimulus`.
- `app/controllers/readers_controller.rb`, `personas_controller.rb`, `reading_lists_controller.rb`, `reading_list_saves_controller.rb`, `libraries_controller.rb`, `managerships_controller.rb`, `case_library_requests_controller.rb`, `magic_links_controller.rb` - route behavior.
- `app/javascript/reading_list`, `app/javascript/controllers/reading_list_controller.js` - reading-list editor and save/unsave behavior.
- `spec/requests/reader_spec.rb`, `spec/requests/saved_reading_lists_index_spec.rb`, `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx` - existing validation patterns.

### Secondary (MEDIUM confidence)
- https://github.com/heartcombo/devise - Devise controller filters/helpers.
- https://github.com/varvet/pundit - Pundit `authorize`, `policy_scope`, and policy patterns.
- https://stimulus.hotwired.dev/reference/actions - Stimulus actions.
- https://stimulus.hotwired.dev/reference/targets - Stimulus targets.
- https://github.com/palantir/blueprint/wiki/Blueprint-3.0 - Blueprint namespace migration from `pt-`.
- https://github.com/palantir/blueprint/wiki/Blueprint-4.0 - Blueprint 4 `bp4-` namespace and visual changes.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from checked-in lockfiles, route/source files, and npm registry latest checks; latest packages are intentionally not recommended for no-upgrade stabilization.
- Architecture: HIGH - verified from controllers, views, policies, and JavaScript entry points.
- Pitfalls: HIGH - derived from existing implementation boundaries, prior phase state, and official framework docs.

**Research date:** 2026-05-04
**Valid until:** 2026-06-03 for this stabilization plan, unless dependencies or route scope change.
