# Authorization Query Watch

Gala keeps Pundit as the authorization layer. The local query watcher adds
development-time visibility around Pundit checks that issue SQL, especially
authorization N+1 patterns.

## What It Watches

The watcher instruments:

- `Pundit.policy(...).show?`, `update?`, `destroy?`, and other policy predicate
  calls.
- `Pundit.authorize(...)`.
- `Pundit.policy_scope(...)` and `Pundit.policy_scope!(...)`.
- Controller helper usage that flows through Pundit.
- Direct Pundit calls from channels, decorators, mailboxes, serializers, and
  service objects.

It does not change authorization results. Policy classes, redirects, channel
guards, and `policy_scope` return values should behave the same as before.

## When It Runs

The watcher is enabled by default in Rails development. It is intentionally not
controlled by environment variables.

The implementation lives in:

- `app/lib/gala/pundit_query_watch.rb`
- `config/initializers/pundit_query_watch.rb`

Tests can toggle it directly on the module:

```ruby
Gala::PunditQueryWatch.enabled = true
Gala::PunditQueryWatch.max_queries = 99
Gala::PunditQueryWatch.repeat_threshold = 2
```

Do not add new ENV knobs for this watcher.

## Log Output

On a development request, repeated authorization SQL is logged like this:

```text
[pundit-query-watch] possible authorization N+1 request=GET /cases/example repeated_queries=5 sql=SELECT ... checks=CasePolicy#show?
```

A single expensive policy check can also log:

```text
[pundit-query-watch] policy check issued SQL check=CasePolicy#update? user=Reader(1) record=Case(42) queries=4 repeated=SELECT ...
```

The SQL is fingerprinted, so IDs and string literals are replaced with `?`.
Schema, transaction, and cached SQL events are ignored.

## How To Fix A Warning

Start with the `checks=` or `check=` value in the log, then inspect that policy
method.

Common fixes:

- Replace association membership checks like `user.my_cases.include?(record)`
  with relation predicates such as `user.my_cases.where(id: record.id).exists?`.
- Keep scope methods as ActiveRecord relations instead of materializing arrays
  with `pluck`, `map`, or `include?` unless the collection is already loaded on
  purpose.
- Preload associations in the controller before rendering a list that calls
  `policy(record)` for every row.
- Push repeated policy work into one scoped relation, then pass that relation
  through the controller or serializer.
- Prefer SQL subqueries for role/library/case membership checks when the policy
  runs for many records.

After the fix, reload the same development route and confirm the
`[pundit-query-watch]` line disappears or the repeated query count drops.

## Request And Non-Request Behavior

Controller requests aggregate query fingerprints for the whole request and log
repeated policy SQL after the action completes.

Non-controller callers, such as Action Cable channels or mailboxes, do not keep
request-level state. They can still log a single expensive policy check, but
they do not aggregate across unrelated calls.

## Verification

Focused coverage:

```sh
bundle exec rspec spec/lib/gala/pundit_query_watch_spec.rb
bundle exec rspec spec/policies
bundle exec rails runner 'puts "pundit query watch boot ok"'
```

