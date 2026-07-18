# Task 2: Email-only Google OAuth URL controller and view hooks

Implement the approved frontend slice with strict test-first TDD.

## Requirements

- Add `app/javascript/controllers/google_oauth_controller.js` as a Stimulus
  controller with an exported pure URL-building helper.
- On enabled Google-link click, read only the surrounding form's email target,
  normalize it with trim plus lowercase, and navigate from the link's fixed
  Google authorization href.
- The generated URL contains at most one optional query key:
  `reader_email`. Blank normalized email adds no query parameter.
- Password, confirmation, name, locale, and arbitrary current/future form values
  must never enter the OAuth URL; do not serialize the form.
- Attach the controller and email target to both the sign-in and registration
  forms and attach the click action only to each enabled Google link. Preserve
  the disabled-link behavior and fixed authorization route.

## Tests and TDD evidence

- Add `app/javascript/controllers/__tests__/google_oauth_controller.test.js`
  covering trim/lowercase, blank email, fixed path preservation, and exclusion
  of password, password confirmation, name, locale, and arbitrary extra values.
- Extend `spec/requests/devise_reader_routes_spec.rb` to assert both rendered
  forms have the exact controller/target/action hooks and fixed Google href,
  without any non-email value embedded in the link.
- First capture expected RED failures, then implement minimally and capture
  GREEN. Run Jest inside the existing web container with
  `docker compose exec web pnpm test -- <focused args>` and Rails request specs
  with `./run-rspec.sh spec/requests/devise_reader_routes_spec.rb`.

## Scope and safety

- Modify only the controller, its Jest test, the two Haml views, and the named
  request spec.
- Preserve all existing untracked paths and do not stage `.work/`.
- No backend OAuth selection changes and no external actions.

