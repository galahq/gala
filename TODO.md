# TODO

- [ ] Add `type` param handling in `StatsController` and route
- [ ] Refactor `stats_controller.rb` to branch queries: `by_associations` vs `by_event`
- [ ] Ensure `by_associations` logic runs once (no date range)
- [ ] Ensure `by_event` logic runs on each date-range change
- [ ] Update `case_stats_controller.js` to set `this.currentQuery` based on event vs associations
- [ ] Update `fetchData` to include `query=by_associations|by_event` param

