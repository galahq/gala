---
status: ready
quick_id: 260504-h1i
slug: please-undo-the-change-that-makes-mapbox
created: 2026-05-04T16:16:12.297Z
---

# Quick Task Plan

Restore the global case overview Mapbox style fallback from the local `mapbox/dark-v11` style to the production `cbothner` style, because production styles are expected to work even if they do not render locally.

## Steps

1. Revert the `window.MAPBOX_STYLE` fallback in `app/views/layouts/application.html.erb` to `mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14`.
2. Update the layout contract test to preserve the production fallback and prevent accidental replacement with the local stats style.
3. Run the targeted Jest contract test.
4. Commit the quick task atomically and update GSD quick-task state.
