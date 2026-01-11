# Stats Module Analysis and Next Steps

## What We’ve Done
- **Seeding instructions**: Added concise Heroku‑to‑local pg_dump steps in `docs/seeds.md`.  
  【F:docs/seeds.md†L1-L7】

- **AGENTS playbook & README**: Updated `AGENTS.md` with init, build/run, DB, tests, style, and docs sections, and appended a “Project Documentation” trailhead to `README.md`.  
  【F:AGENTS.md†L1-L12】【F:README.md†L84-L90】

- **StatsController refactor**: Cleaned up raw‑SQL output in `app/controllers/cases/stats_controller.rb` to sanitize queries and write to the project root via `Rails.root.join`.  
  【F:app/controllers/cases/stats_controller.rb†L118-L121】

- **Index introspection**: Queried `pg_indexes` via Docker to list all public indexes (155 total) and specifically those on `enrollments` to inform performance tuning.

- **Performance discussion**: Reviewed the `by_associations_sql` plan, contrasted it with the leaner `original_stats.sql`, and recommended key indexes (e.g. on `wikidata_links(record_type,record_id)`, `ahoy_events(name,(properties->>case_slug))`, etc.) for major speedups.

## What We’re Working On
- **Index audit & planning**: Using the full index list to decide which indexes to add/adjust for the heavy stats queries.
- **Query optimization**: Considering refactoring or materialized views for the `by_associations_sql` or swapping in the simpler “page” query (`original_stats.sql`) where suitable.
- **Front‑end integration**: Ensuring the Stimulus/React controller (`app/javascript/controllers/case_stats_controller.js`) and view (`app/views/cases/stats/show.html.erb`) align with JSON payload changes from the optimized queries.

## Files in Focus
| File                                                         | Purpose                                            |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `docs/seeds.md`                                              | pg_dump seed steps                                 |
| `AGENTS.md`                                                  | Local dev playbook                                 |
| `README.md`                                                  | Doc trailheads                                     |
| `app/controllers/cases/stats_controller.rb`                  | SQL query generation & execution                   |
| `app/views/cases/stats/show.html.erb`                        | Stats page layout                                  |
| `app/javascript/controllers/case_stats_controller.js`        | Date‑range + AJAX stats renderer                   |
| `db/structure.sql`                                           | Baseline schema (no indexes inlined here)          |

## Next Steps
1. **Implement index migrations** for the top‑priority joins (e.g. `wikidata_links`, filtered JSONB lookups on `ahoy_events`) based on our index audit.
2. **Refactor or swap queries** in `stats_controller.rb` to use materialized views or the simpler `original_stats.sql` pattern where it yields adequate data.
3. **Update front‑end components** to support any changes in JSON shape or new endpoints for additional metrics.
4. **Benchmark and re‑EXPLAIN** the revised queries to validate performance gains.
5. **Document final query/index strategy** back in `docs/stats.md` for future reference.

---

*End of summary.* 


## Validating with production data (local)

1. Place the SQL dump at `tmp/gala-prod.sql` (schema + data).
2. Start Docker: `docker compose up --build`.
3. On empty DB, seeds will auto-restore; entrypoint runs `rails db:migrate` and refreshes indexes.
4. Confirm migrations applied:
   - `db/migrate/20250107000000_add_case_id_to_ahoy_events.rb`
   - `db/migrate/20250910152252_add_case_stats_idx.rb`
5. Open stats UI for a case: `/cases/:slug/stats`.
6. Verify filters/date ranges update results and network responses from `app/javascript/controllers/case_stats_controller.js`.

## Unique stats

```json
[
  {
    "name": "visit_page"
  },
  {
    "name": "visit_element"
  },
  {
    "name": "read_quiz"
  },
  {
    "name": "read_overview"
  },
  {
    "name": "read_card"
  },
  {
    "name": "visit_podcast"
  },
  {
    "name": "visit_edgenote"
  }
]
```
