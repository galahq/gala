---
status: complete
---

# Quick Task: Fix Missing Reading List Nil Title

Fix the local Docker `localhost:3000` error where missing reading-list routes render `reading_lists/show.html.erb` with a nil `reading_list`, causing `undefined method 'title' for nil`.

## Steps

- Move reading-list lookup to a shared before action for show/edit/update/destroy.
- Return 404 before rendering when the UUID is malformed or no record exists.
- Add request coverage for malformed and valid missing UUIDs.
- Verify with targeted RSpec and local `curl`.
