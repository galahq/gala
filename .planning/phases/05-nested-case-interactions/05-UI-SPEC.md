---
phase: 05
slug: nested-case-interactions
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-04
---

# Phase 05 - UI Design Contract

Visual and interaction contract for the Phase 5 Nested Case Interactions route group.

This contract preserves the approximate pre-upgrade Gala / BlueprintJS 2.3.1-era experience while running the current Rails, Shakapacker, React 16, and BlueprintJS 4 stack. Phase 5 is a stabilization pass for existing nested case widgets, not a redesign.

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | BlueprintJS 4.x with Gala legacy compatibility |
| Icon library | Blueprint icon names through existing Blueprint components/classes |
| Font | existing Gala application fonts and typography only |

No new component library, icon system, layout framework, generated UI registry, or global visual redesign is allowed in this phase.

## Phase Surfaces

Phase 5 UI work covers these nested case surfaces:

| Surface | Primary Files | Contract |
|---------|---------------|----------|
| Comments and conversation | `app/javascript/comments`, `app/javascript/conversation`, `app/controllers/comment_threads_controller.rb`, `app/controllers/comments_controller.rb` | Comment thread lists, selected thread, response forms, edit/delete controls, attachment chooser, empty states, and toasts remain usable, compact, and nonblank. |
| Pages and cards | `app/javascript/page`, `app/javascript/redux/reducers/cards.js`, `app/javascript/redux/reducers/pagesById.js`, `app/controllers/pages_controller.rb`, `app/controllers/cards_controller.rb` | Page/card create/update/delete and card comment-thread affordances preserve existing editor density, Draft editor rhythm, and JSON mutation behavior. |
| Edgenotes | `app/javascript/edgenotes`, `app/controllers/edgenotes_controller.rb`, `app/controllers/edgenotes/link_expansions_controller.rb` | Edgenote library, editor dialog, preview, attachment controls, pull quote/image/link expansion surfaces, and visibility toggles retain their current dialog/form density and do not introduce blank or overlapping states. |
| Podcasts | `app/javascript/podcast`, `app/controllers/podcasts_controller.rb` | Podcast editor fields, credits list, artwork/audio inputs, and save/delete controls keep existing form structure and Blueprint-compatible buttons/inputs. |
| Forums and locks | `app/javascript/redux/actions/forum.js`, `app/javascript/redux/actions/lock.js`, `app/javascript/redux/reducers/forums.js`, `app/javascript/redux/reducers/locks.js`, `app/controllers/forums_controller.rb`, `app/controllers/locks_controller.rb` | Forum loading and lock controls remain invisible or low-noise when idle, and blocking/edit-lock states remain clear without disrupting layout. |
| Stats and map | `app/javascript/controllers/case_stats_controller.js`, `app/javascript/stats`, `app/controllers/cases/stats_controller.rb`, `app/views/cases/stats` | Stats page, overview cards, two-calendar date range controls, loading/error states, country table, and Mapbox map remain visible and usable; accepted local Mapbox production-style errors are classified only when visible behavior is intact. |
| Quizzes and submissions | `app/javascript/suggested_quizzes`, `app/javascript/quiz`, `app/controllers/quizzes_controller.rb` | Suggested quiz list/editor, quiz show, question/option editor, destructive confirmation, and submission controls retain existing Blueprint form and button behavior. |
| Wikidata and SPARQL | `app/javascript/wikidata`, `app/controllers/wikidata_links_controller.rb`, `app/controllers/sparql_controller.rb` | Wikidata search, add/remove list, sortable linked item list, and SPARQL-backed results keep existing compact metadata-editor behavior and classify remote failures separately from local UI regressions. |
| Tags and activities | `app/javascript/overview/keywords`, `app/controllers/taggings_controller.rb`, `app/controllers/activities_controller.rb`, `app/controllers/case_elements_controller.rb` | Tag controls and activity/page creation affordances remain compact, reversible where tested, and aligned with current case editor behavior. |

The Phase 4 core case shell is the baseline. Phase 5 work must not change shell-level layout unless a nested surface cannot be reached or mounted otherwise.

## Spacing Scale

Use existing Gala spacing and Blueprint density. New spacing values should be chosen from this scale unless editing existing CSS with a nearby established value.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline labels, compact widget gaps |
| sm | 8px | Button groups, form control gaps, tags, response action rows |
| md | 16px | Form groups, editor sections, dialog inner rhythm |
| lg | 24px | Stats sections, edgenote editor sections, conversation pane rhythm |
| xl | 32px | Major nested-surface gaps only where already established |

Exceptions:

- Preserve existing component-specific dimensions in conversation, edgenotes, stats map/table, quiz editor, and Draft editor surfaces unless browser QA proves a regression.
- Do not introduce viewport-scaled font sizes or spacing.
- Keep cards at existing app radius and density; do not add nested decorative cards inside established cards or dialogs.
- Keep fixed-format controls such as map containers, table headers, tag rows, quiz option rows, and editor action bars dimensionally stable so hover/loading/empty states do not shift layout.

## Typography

Use the existing Gala typography loaded by the application layout and `app/javascript/shared/galaTypography.scss`.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | existing app body size | existing | existing |
| Label | existing form/Blueprint label size | existing | existing |
| Heading | existing case/admin/widget heading sizes | existing | existing |
| Display | not introduced in Phase 5 | not applicable | not applicable |

Typography constraints:

- Do not add hero-scale typography inside nested widgets, dialogs, side panels, maps, tables, quiz editors, comment forms, or metadata controls.
- Do not use negative letter spacing.
- Text inside buttons, tags, table headers, date controls, menus, tabs, popovers, dialogs, and form controls must not overflow or overlap at desktop or mobile widths.
- Preserve existing comments, edgenotes, quiz, and stats copy unless a broken route or test requires a narrow fix.

## Color

Use the existing Gala and Blueprint color layers. Do not introduce a new palette.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | existing app/window backgrounds | case shell and nested route surfaces |
| Secondary (30%) | existing panel/card/table/dialog surfaces | conversation lists, stats panels, forms, editor dialogs |
| Accent (10%) | existing Blueprint/Gala intent colors | selected states, primary actions, tags, loading/progress, map bins where already defined |
| Destructive | existing Blueprint danger intent | comment/thread/card/page/podcast/quiz/edgenote delete actions only |

Accent is reserved for:

- selected comment thread, selected quiz/item, active editor control, active date/map state
- existing primary/save/add actions where current UI already uses Blueprint intent
- warning/error/loading states where existing Blueprint or Gala styles already define the intent
- existing stats map color bins from `app/javascript/stats/map/mapColors.js`

Do not create route-specific colors unless a verified Blueprint upgrade regression makes an existing state unreadable and no shared compatibility rule already exists.

Stats date-picker exception:

- The stats `DateRangePicker` must preserve the Blueprint 2-era two-calendar range layout on desktop, even when local stats data begins in the current month.
- Selected date cells, selected ranges, and active date shortcuts must use Gala purple `#7351D4` with white foreground, not Blueprint 4 blue.
- Hovered date ranges may use a translucent Gala purple state. This override must stay scoped to `.c-stats-picker`.

## Blueprint Compatibility Contract

Phase 5 must follow the locked compatibility strategy from prior phases:

- Preserve `.pt-*` classes where they are already present.
- Add `.bp4-*` companions only for verified Phase 5 route surfaces that need static class coverage.
- Do not remove `.pt-*` classes during Phase 5.
- Do not import Blueprint package CSS from route packs.
- Do not duplicate Blueprint CSS; Sprockets remains the owner through `app/assets/stylesheets/application.css`.
- Prefer narrow route/component fixes over broad shared CSS changes unless multiple Phase 5 surfaces show the same verified regression.
- Use existing Blueprint components/classes for buttons, dialogs, popovers, toasts, callouts, tags, progress/loading, inputs, controls, menus, and icons.

Likely Phase 5 inspection targets:

- `app/javascript/conversation/NewUnattachedCommentButton.jsx` uses legacy Blueprint button classes.
- `app/javascript/conversation/Response.jsx` edit/delete buttons use legacy Blueprint button/icon classes.
- `app/javascript/conversation/CommentThreadLocation.jsx` uses a legacy Blueprint callout class.
- Edgenote editor dialogs/forms should be inspected for Blueprint dialog, form group, button, file input, and progress states.
- Stats date controls, error/loading states, map container, and country table must be inspected for usable Blueprint-era density after the Mapbox and Shakapacker changes.
- Quiz editor and destructive delete confirmation should be inspected for button intent, form group, and dialog/menu regressions.
- Wikidata search/add/remove controls should be inspected for input, list, sortable, and tag/button regressions.

## Interaction Contract

| Interaction | Required Behavior |
|-------------|-------------------|
| Mock admin login | Protected browser checks start at `/readers/sign_in`, click `a.oauth-icon-google`, and verify the session is no longer on the sign-in form before route assertions. |
| Comments | Thread list, selected thread, new unattached thread, response creation, response edit/delete affordances, and empty states remain discoverable and nonblank. |
| Pages/cards | Existing page/card routes and low-risk card/comment-thread checks preserve JSON behavior and do not visibly disturb Draft editor content. |
| Edgenotes | Library/editor dialog/link expansion surfaces open, close, save or report errors without overlapped controls, blank previews, or broken progress states. |
| Podcasts | Form fields, nested credits list controls, save/delete buttons, and media inputs remain usable and do not overflow. |
| Stats/map | `/cases/:slug/stats` renders overview, two-calendar date controls, loading/error states, country table, and map container; active date selections use Gala purple; local production-style Mapbox failures are accepted only if controls and fallback content remain usable. |
| Quizzes | Suggested quiz list/editor, show view, question/option controls, submission controls, and delete affordance remain usable and preserve existing copy. |
| Wikidata/SPARQL | Search/add/remove/sort controls render; remote or malformed SPARQL failures are classified as risk notes unless they break the local UI shell. |
| Tags/locks | Low-risk tag/lock create/delete checks use existing data, clean up immediately when possible, and leave editor controls understandable. |
| Console/network checks | Every route group records blocking errors, accepted noise, and follow-up risks separately. |

Do not add new user-facing flows, navigation, or product copy beyond narrow compatibility fixes.

## Copywriting Contract

Do not rewrite product copy except to preserve existing behavior.

| Element | Copy |
|---------|------|
| Primary CTA | Use existing translated copy from locale keys, current views, and current React components. |
| Empty state heading | Preserve existing comments, edgenotes, quiz, stats, Wikidata, and case editor empty-state copy. |
| Empty state body | Preserve existing translated body text and current next-step language. |
| Error state | Preserve existing Rails/React error and form validation text; classify remote/third-party failures in QA notes. |
| Destructive confirmation | Preserve existing delete confirmation copy and existing action names. |

Any copy change must be incidental to fixing a broken route or test and should use existing i18n keys where possible.

## Browser QA Contract

The Phase 5 QA evidence must record:

- chosen local case slug(s), reader/admin session state, and any route substitutions
- route family coverage for comments, comment threads, pages/cards, case elements, edgenotes, podcasts, forums, locks, quizzes, submissions, stats, taggings, Wikidata links, and SPARQL
- browser result for each representative route or nested widget
- console errors and network errors classified as blocking, accepted noise, or follow-up risk
- whether each deeper widget check was performed: comment editor, edgenote editor/link expansion, stats date/map controls, quiz editor/show flow, Wikidata search/add, lock/tag controls
- screenshots only when visual judgment is ambiguous or a fix is made
- targeted automated tests run and results
- temporary writes performed and cleanup result

For authenticated visual checks in local Docker Compose, the browser flow is part of the contract:

1. Open `/readers/sign_in`.
2. Click `a.oauth-icon-google`, the "Sign in with Google" button rendered by the Devise sign-in view.
3. Let `config/initializers/mock_omniauth.rb` complete the development OmniAuth callback as `dev@learnmsc.org` / "Developer Admin".
4. Revisit protected case routes and nested widgets in the signed-in session.
5. Confirm the resulting page is not the sign-in form before visually asserting protected BlueprintJS controls.

Playwright/MCP gate instructions:

- Use `host.docker.internal:3000` from the browser container when `localhost:3000` is not reachable.
- Start every protected-route visual UAT pass from a fresh or known browser context, then navigate to `/readers/sign_in`.
- Click `a.oauth-icon-google` and wait for the OmniAuth callback/session redirect to settle before visiting protected URLs.
- Record console and network errors after authentication.
- Keep legacy React 16 warnings, accepted local Mapbox production-style 404s, and third-party/browser noise separate from protected-route rendering regressions.

Visual pass means the route is usable, nonblank, recognizably Gala, and not obviously regressed from the prior Blueprint-era shape. It does not mean pixel-perfect redesign.

## Route-Specific Visual Gates

| Route Group | Gate |
|-------------|------|
| Comments/comment threads | Conversation list and selected thread render; create/edit/delete controls remain compact and usable; accepted writes are cleaned up. |
| Pages/cards/case elements | Editor surface remains nonblank; reorder/update controls do not overlap; JSON mutation failures show existing error behavior. |
| Edgenotes/link expansion | Editor dialog and preview render; link expansion loading/error/visibility controls remain reachable; remote fetch risks are documented if non-blocking. |
| Podcasts | Credits list and media inputs stay aligned with existing form rhythm. |
| Stats/map | Date range controls render as two calendars on desktop, active/selected states use Gala purple, overview/loading/error states/table/map container render, and map errors are classified. |
| Quizzes/submissions | Quiz editor/show route and question/option controls render without broken form state or destructive-control ambiguity. |
| Wikidata/SPARQL | Search/add/remove/sort UI renders; no blank widget when SPARQL returns empty/error; malformed input risks are documented separately. |
| Locks/tags/forums/activities | Low-risk controls and JSON responses are verified through UI/API/spec evidence without broad redesign. |

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| third-party UI registries | none | not allowed for this phase |

No external UI block registry or generated component set should be introduced.

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-04
