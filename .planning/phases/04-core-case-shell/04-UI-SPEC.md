---
phase: 04
slug: core-case-shell
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-04
---

# Phase 04 — UI Design Contract

Visual and interaction contract for the Phase 4 Core Case Shell route group.

This contract preserves the approximate pre-upgrade Gala / BlueprintJS 2.3.1-era experience while running the current Rails, Shakapacker, React 16, and BlueprintJS 4 stack.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | BlueprintJS 4.x with Gala legacy compatibility |
| Icon library | Blueprint icon names through existing Blueprint components/classes |
| Font | existing Gala application fonts and typography only |

No new component library, icon system, layout framework, or global visual redesign is allowed in this phase.

---

## Phase Surfaces

Phase 4 UI work covers these visible shell surfaces:

| Surface | Primary Files | Contract |
|---------|---------------|----------|
| Case show shell | `app/views/cases/show.html.erb`, `app/javascript/packs/case.entry.jsx`, `app/javascript/Case.jsx` | `window.caseData` mounts the React shell without layout shift, blank app, or runtime error. |
| Case overview | `app/javascript/overview/CaseOverview.jsx`, `app/javascript/overview/Billboard.jsx`, `app/javascript/overview/TableOfContents.jsx` | Existing overview composition, right column, cover/title presentation, and table of contents remain recognizable. |
| Case toolbar | `app/javascript/overview/StatusBar.jsx`, `app/javascript/utility/Toolbar.jsx` | Toolbar remains compact, horizontally grouped, icon+label capable, and usable in normal and edit modes. |
| Settings | `app/views/cases/settings/edit.html.haml`, `app/views/cases/settings/*.haml` | Admin-card layout, sidebar actions, Blueprint form controls, and intent buttons retain paired legacy/current class coverage where visible. |
| Delete confirmation | `app/views/cases/deletions/new.html.haml` | Destructive confirmation card, running text, input, and danger submit button render with Blueprint-compatible styling. |
| React suffix shell | `app/javascript/Case.jsx`, `app/javascript/conversation`, `app/javascript/elements` | `/`, `/1`, and `/conversation` samples route through the same shell without new console errors. |

Nested feature behavior belongs to Phase 5 unless it blocks shell routing or mount behavior.

---

## Spacing Scale

Use existing Gala spacing and Blueprint density. New spacing values should be chosen from this scale unless editing existing CSS with a nearby established value.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, compact inline spacing |
| sm | 8px | Button groups, toolbar item gaps, compact form spacing |
| md | 16px | Default form group spacing and card inner rhythm |
| lg | 24px | Admin-card internal layout and overview section spacing |
| xl | 32px | Major shell gaps only where already established |

Exceptions:

- Preserve existing component-specific dimensions in `overview`, `utility/Toolbar`, and shared Blueprint SCSS unless a verified regression requires a narrow change.
- Do not introduce viewport-scaled font sizes or spacing.
- Do not use decorative nested cards; existing admin cards are allowed because they are established route surfaces.

---

## Typography

Use the existing Gala typography loaded by the application layout and `app/javascript/shared/galaTypography.scss`.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | existing app body size | existing | existing |
| Label | existing form/Blueprint label size | existing | existing |
| Heading | existing case/admin heading sizes | existing | existing |
| Display | existing case title/kicker treatment | existing | existing |

Typography constraints:

- Do not add hero-scale typography inside toolbar, settings cards, confirmation cards, or compact shell controls.
- Do not use negative letter spacing.
- Text inside buttons, tags, toolbar items, menus, and form controls must not overflow or overlap at desktop or mobile widths.

---

## Color

Use the existing Gala and Blueprint color layers. Do not introduce a new palette.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | existing app/window backgrounds | case shell background and route surfaces |
| Secondary (30%) | existing card/sidebar/toolbar surfaces | admin-card, sidebar, toolbar group surfaces |
| Accent (10%) | existing Blueprint/Gala intent colors | primary, success, warning, and selected states already present |
| Destructive | existing Blueprint danger intent | delete confirmation and destructive case actions only |

Accent is reserved for:

- edit/save/publish/deploy/settings actions where current UI already uses Blueprint intents
- destructive confirmation and delete actions
- spotlight/selection states already present in the case shell

Do not create route-specific one-off colors unless browser QA proves an upgraded Blueprint token caused a visible regression and no shared compatibility rule already exists.

---

## Blueprint Compatibility Contract

Phase 4 must follow the locked compatibility strategy from prior phases:

- Preserve `.pt-*` classes where they are already present.
- Add `.bp4-*` companions only for verified route surfaces that need static class coverage.
- Do not remove `.pt-*` classes during Phase 4.
- Do not import Blueprint package CSS from route packs.
- Do not duplicate Blueprint CSS; Sprockets remains the owner through `app/assets/stylesheets/application.css`.
- Prefer narrow route/component fixes over broad shared CSS changes unless multiple Phase 4 surfaces show the same verified regression.

Known likely inspection targets:

- `app/views/cases/deletions/new.html.haml` has unpaired legacy classes on card/running-text/input/danger button surfaces.
- `app/javascript/utility/Toolbar.jsx` already mirrors `pt-*` toolbar classes to `bp4-*`; extend only if QA finds uncovered toolbar regressions.
- Settings partials already include many paired classes; inspect before changing.

---

## Interaction Contract

| Interaction | Required Behavior |
|-------------|-------------------|
| Case overview load | Case shell mounts with nonblank overview content and no new runtime errors. |
| Edit route | `/cases/:slug/edit` redirects to `/cases/:slug?edit=true` and edit controls become available for an editor. |
| Toolbar actions | Back/catalog, conversation, teach/deploy, edit/save, options menu, settings, translations, copy, and publish/unpublish remain discoverable and clickable when permissions allow. |
| Settings forms | Form fields, selects, submit buttons, sidebar actions, and help links retain usable layout and visible Blueprint states. |
| Delete confirmation | Confirmation input enables/disables the destructive submit correctly and danger styling remains visible. |
| React suffix routes | `/cases/:slug`, `/cases/:slug/1`, and `/cases/:slug/conversation` sample the client shell without Rails 404s or blank React states. |
| Auth boundaries | Editor-only surfaces should be browser-tested through the local Google mock sign-in flow before relying on anonymous redirects or request specs. |

Do not add new user-facing flows, navigation, or product copy beyond narrow compatibility fixes.

---

## Copywriting Contract

Do not rewrite product copy except to preserve existing behavior.

| Element | Copy |
|---------|------|
| Primary CTA | Use existing translated copy from locale keys and current views. |
| Empty state heading | Preserve existing case/catalog/conversation empty-state copy. |
| Empty state body | Preserve existing translated body text. |
| Error state | Preserve existing Rails/React error and form validation text. |
| Destructive confirmation | Preserve existing delete confirmation copy and required title/kicker confirmation behavior. |

Any copy change must be incidental to fixing a broken route or test and should use existing i18n keys where possible.

---

## Browser QA Contract

The Phase 4 QA evidence must record:

- chosen local case slug(s) and why they cover the route sample
- route family coverage for index JSON, show shell, edit redirect, settings, archive, translations, copy, delete confirmation, and React suffixes
- browser result for each representative route
- console errors and network errors, with known HMR host/origin noise separated from real app failures
- screenshots when visual judgment is ambiguous or a fix is made
- targeted automated tests run and results
- substitutions or skipped route families with reason

For authenticated visual checks in local Docker Compose, the browser flow is part of the contract:

1. Open `/readers/sign_in`.
2. Click `a.oauth-icon-google`, the "Sign in with Google" button rendered by the Devise sign-in view.
3. Let `config/initializers/mock_omniauth.rb` complete the development OmniAuth callback as `dev@learnmsc.org` / "Developer Admin".
4. Revisit protected case routes in the signed-in session and visually inspect Blueprint controls before marking those protected surfaces acceptable.

Only fall back to anonymous redirect checks or request specs after this Google mock flow is attempted and the failure reason is documented.

Playwright/MCP gate instructions:

- Use `host.docker.internal:3000` from the browser container when `localhost:3000` is not reachable.
- Start every protected-route visual UAT pass from a fresh or known browser context, then navigate to `/readers/sign_in`.
- Click `a.oauth-icon-google` and wait for the OmniAuth callback/session redirect to settle before visiting protected URLs.
- Confirm the resulting page is not the sign-in form before visually asserting protected BlueprintJS controls.
- Record console and network errors after authentication; keep known HMR host/origin noise separate from protected-route rendering regressions.

Visual pass means the route is usable, nonblank, recognizably Gala, and not obviously regressed from the prior Blueprint-era shape. It does not mean pixel-perfect redesign.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| third-party UI registries | none | not allowed for this phase |

No external UI block registry or generated component set should be introduced.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-04
