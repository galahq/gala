# Task 1 report: Rails Google OAuth migration routing and callback safety

## Status

DONE

- Commit: `280840fe Add staged Google OAuth migration routing`
- Branch: `oauth/staged-google-key-rotation`
- No external service, deploy, cloud, secret, or network operation was performed.
- Pre-existing untracked `.omx/`, `.work/`, `GCP_OAUTH.pdf`, and root
  `sst-env.d.ts` remain untracked and were not staged or committed.

## Changes

- Added a frozen `Reader::GOOGLE_OAUTH_MIGRATION_EMAILS` allowlist containing
  only normalized `nathan.papes@gmail.com` and
  `Reader#google_oauth_migration_allowed?` with `to_s.strip.downcase`
  comparison.
- Added `GoogleOauthSetup` as an OmniAuth setup callable. Authorization setup
  reads only the `reader_email` query key, records only `legacy` or `migration`
  in `gala.google_oauth_client_selection`, and uses migration credentials only
  for an existing case-insensitively matched allowlisted Reader with a complete
  migration pair.
- Callback setup consumes the selection key, recovers normalized
  `reader_email` from saved `omniauth.params`, honors the recorded class without
  consulting current Reader state, falls back to legacy for missing/unknown
  markers, and uses hard-coded non-secret invalid sentinels when a recorded
  migration pair becomes incomplete.
- Added the request-local `gala.google_oauth_migration_email` marker only for
  recorded migration callbacks.
- Registered `GoogleOauthSetup` on the existing `google_oauth2` Devise provider
  while retaining positional legacy credentials and `name: 'google'`.
- Added a Google-only callback guard before model-writing callbacks. Migration
  callbacks now require a verified returned email whose normalized value equals
  the requested allowlisted email. Accepted email is normalized before the
  unchanged linking path; rejected callbacks use the existing root redirect
  before any Reader or AuthenticationStrategy write.
- Added defense-in-depth selection cleanup in `failure`.
- Left `AuthenticationStrategy` and `config/routes.rb` unchanged.

## Files

- `app/models/reader.rb`
- `app/services/google_oauth_setup.rb` (new)
- `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`
- `config/initializers/devise.rb`
- `spec/models/reader_spec.rb`
- `spec/services/google_oauth_setup_spec.rb` (new)
- `spec/requests/google_oauth_migration_spec.rb` (new)

## TDD evidence

### Reader allowlist

RED command:

```sh
./run-rspec.sh spec/models/reader_spec.rb
```

Relevant RED output:

```text
16 examples, 4 failures
NoMethodError: undefined method 'google_oauth_migration_allowed?'
```

GREEN command:

```sh
./run-rspec.sh spec/models/reader_spec.rb
```

Relevant GREEN output:

```text
16 examples, 0 failures
```

### OmniAuth setup service

RED command:

```sh
./run-rspec.sh spec/services/google_oauth_setup_spec.rb
```

Relevant RED output:

```text
NameError: uninitialized constant GoogleOauthSetup
0 examples, 0 failures, 1 error occurred outside of examples
```

GREEN command:

```sh
./run-rspec.sh spec/services/google_oauth_setup_spec.rb
```

Relevant GREEN output:

```text
12 examples, 0 failures
```

### Initializer wiring, callback guard, continuity, and linking

RED command:

```sh
./run-rspec.sh spec/requests/google_oauth_migration_spec.rb
```

Relevant RED output before initializer/guard implementation:

```text
6 examples, 6 failures
actual setup call collection: []
expected AuthenticationStrategy.count to change by 0, but changed by 1
expected Reader.count to change by 0, but changed by 1
expected config.options[:setup] to equal GoogleOauthSetup, got nil
```

An initial GREEN attempt exposed initializer loading before examples:

```text
NameError: uninitialized constant GoogleOauthSetup
config/initializers/devise.rb
```

The initializer was minimally corrected with an explicit local require. The
next behavioral run had five request behaviors passing; its sole failure was an
invalid spec assertion comparing boot-time legacy arguments to ENV stubs
installed after boot. That assertion was replaced with direct provider/setup,
provider-name, and route contracts; legacy credential behavior remains directly
covered by service and request continuity specs.

### Failure cleanup defense in depth

After completing the Rails controller-test harness in the required request spec
file, the cleanup line was removed to capture an isolated regression RED.

RED command:

```sh
./run-rspec.sh spec/requests/google_oauth_migration_spec.rb:205
```

Relevant RED output:

```text
1 example, 1 failure
expected {"gala.google_oauth_client_selection"=>"migration"}
  not to have key "gala.google_oauth_client_selection"
```

GREEN command after restoring the minimal deletion:

```sh
./run-rspec.sh spec/requests/google_oauth_migration_spec.rb:205
```

Relevant GREEN output:

```text
1 example, 0 failures
```

## Final verification

Final focused Rails command (run fresh after formatting/refactoring):

```sh
./run-rspec.sh spec/models/reader_spec.rb spec/services/google_oauth_setup_spec.rb spec/requests/google_oauth_migration_spec.rb
```

Output:

```text
Finished in 6.58 seconds (files took 3.48 seconds to load)
36 examples, 0 failures
Randomized with seed 29292
```

Changed-file RuboCop command:

```sh
bundle exec rubocop --except Lint/RedundantCopDisableDirective,Metrics/ClassLength,Metrics/MethodLength,Naming/MethodParameterName,Layout/LineLength app/models/reader.rb app/services/google_oauth_setup.rb app/controllers/authentication_strategies/omniauth_callbacks_controller.rb config/initializers/devise.rb spec/models/reader_spec.rb spec/services/google_oauth_setup_spec.rb spec/requests/google_oauth_migration_spec.rb
```

Output:

```text
Inspecting 7 files
.......
7 files inspected, no offenses detected
```

The exclusions are limited to offenses already present in the legacy Reader,
controller, and Devise initializer (class/method size, short legacy parameter
names, long generated comments, and an existing redundant cop directive). A
separate lint run over the new service/specs plus the modified controller found
only that existing controller directive after introduced offenses were fixed.

Additional checks:

```text
git diff --check: clean
Staged/committed paths: exactly the seven files listed above
AuthenticationStrategy diff: empty
config/routes.rb diff: empty
```

## Self-review

- Credential selection is fail-closed: no partial migration pair is used, and a
  recorded migration callback never falls back to legacy credentials.
- Callback selection does not re-query Reader state; mutation/deletion between
  legs is covered.
- The migration identity guard runs before both model-writing callbacks and is
  proven to make zero Reader/AuthenticationStrategy writes on mismatch or an
  unverified email.
- A verified case-normalized identity links the new `google` UID to the existing
  allowlisted Reader, creates no duplicate Reader, and retains the legacy Google
  strategy.
- Missing/unknown selection markers remain legacy-compatible, while callback
  and failure cleanup are covered.
- No credential or identity values are logged by production code. Tracked test
  values are explicitly fake; production sentinels are intentionally invalid
  and non-secret.
- Provider name and callback paths remain `google` and
  `/authentication_strategies/auth/google/callback`.

## Concerns

- Rails test output includes pre-existing framework deprecation warnings and
  Ruby/Bundler duplicate-constant warnings; they do not affect the 0-failure
  result.
- OmniAuth test mode intentionally bypasses the real Google token exchange. The
  service specs verify both invalid sentinel values, and request specs verify
  that callback-time credential loss retains migration classification and the
  migration marker.
