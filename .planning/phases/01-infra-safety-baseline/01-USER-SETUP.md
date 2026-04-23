---
phase: 01-infra-safety-baseline
type: user-setup
status: required-before-phase-2-deploy
created: 2026-04-23
---

# Phase 1 User Setup

Real SST secret values must be configured outside the repository before the first Phase 2 staging deploy. Do not add values to Git, planning docs, chat, tickets, or screenshots.

## Required SST Secrets

Set these separately for `staging` and `production` as appropriate:

- `RAILS_MASTER_KEY`
- `SECRET_KEY_BASE`
- `LTI_KEY`
- `LTI_SECRET`
- `MAPBOX_ACCESS_TOKEN`
- `SES_SMTP_USERNAME`
- `SES_SMTP_PASSWORD`

## Candidate Secrets To Confirm

Add these only if the matching production integration must remain active during AWS cutover:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_PROFILES_SAMPLE_RATE`
- `SENTRY_ENVIRONMENT`

## Command Pattern

Run from `infra/` with Node >=20 and authenticated AWS/SST access:

```bash
npx sst secret set RAILS_MASTER_KEY --stage staging
npx sst secret set SECRET_KEY_BASE --stage staging
npx sst secret set LTI_KEY --stage staging
npx sst secret set LTI_SECRET --stage staging
npx sst secret set MAPBOX_ACCESS_TOKEN --stage staging
npx sst secret set SES_SMTP_USERNAME --stage staging
npx sst secret set SES_SMTP_PASSWORD --stage staging
```

Repeat for `production` only when production cutover prep begins.

## Verification

Before Phase 2 deploy validation:

- Confirm every required staging secret is present in SST.
- Confirm no secret values were copied into `docs/`, `.planning/`, `.env` files, shell history snippets, or Git commits.
- Confirm OAuth and Sentry decisions are recorded in `docs/aws-sst-secret-inventory.md` or the Phase 2 context before parity testing.
