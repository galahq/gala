---
status: complete
---

# Summary

Fixed `ReadingListsController` so missing or malformed reading-list UUIDs halt with `404 Not Found` before `show.html.erb` renders with a nil `reading_list`.

Verification:

- `docker compose run -e RAILS_ENV=test web bundle exec rspec spec/requests/reading_lists_spec.rb --format progress --color` - 9 examples, 0 failures.
- `curl -I http://localhost:3000/reading_lists/missing-reading-list` - `HTTP/1.1 404 Not Found`.
