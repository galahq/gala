---
status: complete
quick_id: 260504-h1i
slug: please-undo-the-change-that-makes-mapbox
completed: 2026-05-04T16:16:12.297Z
---

# Quick Task Summary

Restored the global Mapbox style fallback to the production `cbothner` style and updated the contract test to encode that expectation.

## Verification

- `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js` passed.
