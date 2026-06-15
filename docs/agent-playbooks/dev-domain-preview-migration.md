# Agent Playbook: Dev Preview Domains

## Scope
This playbook covers AWS/SST dev preview routing for `learngala.dev`.

## Workflow Contract
The GitHub Actions surface stays limited to:

- `ci.yml`: name `ci`, job id `ci`.
- `deploy.yml`: name `deploy`, job id `deploy`.

`deploy` accepts only `stage` and `user_data`. Use `stage=dev user_data=diff`
for SST dry-run evidence. Use `stage=dev user_data=` for an actual preview
deploy.

## Agent Procedure
1. Inspect CI evidence before proposing deploy mutation.
2. Run `deploy` with `stage=dev user_data=diff` when SST diff evidence is
   needed.
3. Run `deploy` with empty `user_data` for the preview deploy.
4. Verify the preview URL, `/up`, static assets, and a page with existing
   ActiveStorage media.
5. Keep production cutover work out of this playbook.

## Pull Request Preview Rule
When an open pull request exists, the preview URL is:

```text
https://pr-NUMBER.dev.learngala.dev
```

Manual dev deploys without an open pull request may use a sanitized branch
fallback under `dev.learngala.dev`.
