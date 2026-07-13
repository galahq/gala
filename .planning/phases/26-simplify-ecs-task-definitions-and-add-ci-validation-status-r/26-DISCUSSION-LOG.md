# Phase 26: Simplify ECS Task Definitions And Add CI Validation Status Reporting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 26-simplify-ecs-task-definitions-and-add-ci-validation-status-r
**Areas discussed:** task-definition simplification, GitHub status/report shape, deploy/CI relationship, test suite mapping, SST diff risk handling, report storage

---

## Task-definition simplification

| Option | Description | Selected |
|--------|-------------|----------|
| Shared factory/helper | Reduce duplication while keeping task-specific commands explicit. | yes |
| Full abstraction layer | Maximum dedupe, but harder to audit production task behavior. | |
| Minimal cleanup only | Safer short term, but leaves complexity. | |

**User's choice:** Shared factory/helper.
**Notes:** Auditability remains important; do not hide task-specific commands.

---

## GitHub status/report shape

| Option | Description | Selected |
|--------|-------------|----------|
| One advisory commit status with artifact link plus concise ANSI matrix | Low noise and easy for CODEOWNERs. | yes |
| Separate commit statuses per suite and infra diff | More granular, noisier. | |
| PR comment only | Readable, but weaker as commit-level signal. | |

**User's choice:** One advisory commit status with artifact link plus concise ANSI matrix.
**Notes:** The status should be published through the GitHub REST API.

---

## Deploy/CI relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Advisory CI only; deploy remains workflow_dispatch operator-driven | Preserves operator judgment and avoids accidental deploy coupling. | yes |
| CI blocks production deploy but not dev/preview deploy | Stricter production policy, but changes the current operator boundary. | |
| CI blocks all deploy workflows | Strongest gate, but conflicts with operator-driven deploy intent. | |

**User's choice:** Advisory CI only; deploy remains workflow_dispatch operator-driven.
**Notes:** CI informs judgment but does not automatically deploy or prevent operator-driven deploy execution.

---

## Test suite mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed mapping: unit, integration, system | Unit = Jest/helpers/models/services; integration = RSpec request/controller/jobs; system = Playwright/Capybara visual/browser. | yes |
| Repo-native labels only | Avoids normalization but makes cross-run summaries less standard. | |
| Only report whatever suites run | Flexible but risks silent category omissions. | |

**User's choice:** Fixed mapping: unit, integration, system.
**Notes:** Missing categories should be reported as `not run` with a reason.

---

## SST diff risk handling

| Option | Description | Selected |
|--------|-------------|----------|
| Destructive keywords become advisory warnings with confidence score | Highlights risk without turning CI into a deploy gate. | yes |
| Destructive keywords fail CI | Stronger signal but conflicts with advisory-only intent. | |
| Summarize only, no risk classification | Lower implementation effort but less useful to operators. | |

**User's choice:** Destructive keywords become advisory warnings with confidence score.
**Notes:** Warnings should not automatically fail deploy eligibility.

---

## Report storage/link target

| Option | Description | Selected |
|--------|-------------|----------|
| Upload markdown/text artifact and link from commit status target_url | Keeps generated reports out of source and gives CODEOWNERs a stable report link. | yes |
| Commit report files back to the branch | Creates generated churn in source history. | |
| PR comment only | Useful for PRs but not enough as commit-level status evidence. | |

**User's choice:** Upload markdown/text artifact and link from commit status target_url.
**Notes:** Artifact links are the canonical report target for the advisory commit status.

---

## the agent's Discretion

- Exact script language, workflow file naming, artifact naming, JSON schema field names, and status context label are left to planning/implementation as long as the locked decisions are preserved.

## Deferred Ideas

- Hard CI gating for production deploy.
- Full release-management automation beyond validation status reporting.
