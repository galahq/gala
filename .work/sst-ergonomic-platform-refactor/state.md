---
ticket: sst-ergonomic-platform-refactor
current_step: review
status: blocked
driving_engine: Codex
updated: 2026-07-12T05:52:00Z
#gate_plan_approved / gate_review are stamped by `quark gate` — do not hand-edit
gate_plan_approved: Nathan @ 2026-07-12T05:37:54.636Z hash=dd61a05ec77a
gate_review: resolved — by Codex hash=cf8a5935c5c8
---

# State: sst-ergonomic-platform-refactor

## Completed

- frame — scoped the ergonomic platform refactor into non-overlapping remote-infra, CI/docs, and local-Docker slices with live-state safety constraints (no commit)
- plan — produced a five-slice, file-owned implementation plan with TDD, no-op durable previews, preview allowlists, and native CI gates (no commit)
- review — found three blocking architecture/sequencing gaps and six important execution/test gaps; no verdict stamped (no commit)
- plan revision — resolved the review gaps with an enumerated per-preview ALB graph, exact state/URN/parent validation, a separately approved live preview UAT, reproducible durable diffs, path-independent contracts, one CI subcommand per suite, a concrete SSM-to-container dev database path, and a linear Docker cutover (no commit)
- plan linkage repair — replaced criterion-range shorthand with explicit Quark-readable AC references in the test strategy and Definition of done (no commit)
- review rerun — found two blocking execution contradictions, three important evidence/reproducibility gaps, and two minor clarifications; no verdict stamped (no commit)
- plan revision 2 — removed the unbootstrapped dev sharing resource, selected pinned read-only dev references, centralized platform identity, specified exact durable diff inputs/normalization, added registry-level ARM64 gates, froze the line manifest, and closed both review clarifications (no commit)
- review rerun 2 — confirmed the prior architectural direction but found one reference-resource blocker, five important sequencing/evidence gaps, and two minor implementation ambiguities; no verdict stamped (no commit)
- plan revision 3 — replaced `Vpc.get` with pinned non-secret Cluster networking, enumerated exact component/read operations, split constants inventory/enforcement, isolated diff JSON, specified exact ID/zone validation, made asset extraction digest-pinned, completed line accounting, and fixed JSON/profile ownership (no commit)
- review rerun 3 — found no Blocking or Important gaps in the approved plan; recorded one build-time workflow-input assertion as Minor and resolved the review (no commit)
- build Slice 1 characterization — added canonical non-secret platform references, sanitized durable-diff tooling, and module/source contracts with TDD; independent task review passed after diagnostic redaction/test hardening (`b6372cee..f51b9308`)
- build Docker baseline — built and inspected the unchanged ARM64 `Dockerfile.production` image; recorded UID/GID 1000, Puma/Sidekiq/assets/runtime exclusions, and the existing unmapped-jemalloc defect (no source commit)
- build stop gate — repeated read-only diffs were identical but non-empty: dev 37 operations (`9d05c269…`) and production 100 operations (`4479de82…`); no later slice started and no resource action occurred
- plan revision 4 — Nathan selected exact non-empty baseline equivalence; the plan now freezes complete stage-specific operation arrays and hashes, requires pairwise full-structural equality after source-only moves, reports later behavior as an explicit delta, and forbids every durable apply/reconciliation path (no commit)
- review rerun 4 — found one Blocking semantic-equivalence collision and four Important evidence/policy ambiguities; no verdict stamped (no commit)
- plan revision 5 — closed the review findings with a fail-closed keyed desired-resource analyzer, effective-intent/checkpoint/toolchain binding, reproducible JSONL v2 fingerprints, lossless multiset deltas, and a durable-versus-preview policy matrix (no commit)
- review rerun 5 — found two Blocking execution/coverage gaps and five Important sequencing/evidence gaps in the semantic analyzer, archived-ref bootstrap, checkpoint identity, environment enforcement, and source-only boundary; no verdict stamped (no commit)
- scope retirement — Nathan selected a smaller stage-first ticket, `sst-platform-stage-boundaries`, instead of continuing the 29-criterion plan/review loop (no commit)

## Decisions & deviations

- This ticket is superseded for implementation by `sst-platform-stage-boundaries`; retain its evidence for reference but do not resume its plan unless Nathan explicitly reopens it.
- The first remote-infrastructure slice is source-only and must produce exact full-array baseline equivalence for both durable stages before behavioral cleanup begins.
- Static-assets ownership, router ownership, and legacy CloudFront retirement are separate migrations because they can mutate or delete live resources.
- Docker is the canonical application runtime; mise remains optional host tooling.
- Native GitHub CI status is authoritative after diagnostics are published.
- Large public current-SST monolith examples were not sufficiently credible or documented, so the frame relies on official SST/GitHub guidance plus repository evidence.
- The documented full Rails/frontend suite is the intended CI policy; the current targeted-only collector is treated as drift.
- The legacy validation reporter and `gala/ci` status are removed after one final read-only policy check; GitHub reported no rulesets or required status checks on `main` during planning.
- Preview isolation uses one `pr-NUMBER` state that references a versioned dev sharing contract, so one preview cannot remove another preview's route.
- Preview networking uses a per-PR ephemeral ALB and its enumerated SST/AWS child graph while referencing dev's durable VPC, cluster, secrets, data services, static edge, and router.
- Preview plan validation binds every operation to the exact `pr-NUMBER` stack prefix, approved component parent, recognized child type, and one matching host; foreign or shared mutations are rejected.
- AC7 is verified through a separately presented and explicitly approved current-PR UAT apply; preview removal is a later, separately reviewed PR-close action.
- Docker migration order is release/CI simplification on the old path, parallel image parity, atomic consumer switch, and old-file deletion last.
- Durable equivalence evidence uses one sanitized read-only wrapper plus the exact comparator before and after extraction, so diff inputs are reproducible without resolving or logging deployed secrets.
- CI exposes one fixed subcommand and one native workflow step for each required suite; failure propagation is tested locally without an intentionally failing GitHub commit.
- Container access to the dev database uses an explicit dev-only SSM remote-host port forward and host-gateway mapping; local Postgres remains the unconditional default.
- Review found the preview UAT cannot consume the proposed dev sharing parameter because no step creates it; the next plan must choose zero-mutation lookup or a separately approved dev bootstrap.
- Review found the planned duplicate region/architecture literals cannot satisfy AC12's single-source requirement.
- The preview now creates no dev-owned sharing parameter; verified existing dev IDs are pinned in the canonical constants file and every live mismatch stops for separate review.
- `infra/platform.constants.json` is the single executable source for region, root domain, architecture, and stable platform identifiers; shell and workflow consumers use one scalar reader/dispatcher path.
- Release publication is one buildx push followed by registry-level OS/architecture verification before digest, assets, release record, or rollout.
- Review found SST `.get()` reference operations must be characterized and included in the exact preview allowlist rather than assumed absent.
- Review found the constants enforcement runs before its consumers migrate, the diff JSON stream includes install logs, push-only images are unavailable to the retained asset extractor, and the line policy omits new non-test files.
- Installed SST source confirms `Cluster.get` and `Router.get` create state-only components plus provider reads; the plan now permits those exact operations and rejects all provider mutations.
- `Vpc.get` is intentionally avoided because its reference graph reads bastion/private-key state; preview Cluster networking uses pinned dev IDs/arrays instead.
- Constant duplicate detection is inventory-only until all consumers migrate; enforcement runs in Slice 4.
- Release assets are extracted only after pulling the registry-verified immutable digest.
- SST 4.7.1 emits `sst diff --json` as one top-level JSON array; the wrapper now safely canonicalizes either that envelope or an object stream while requiring `op` and `urn` on every operation.
- Reproducible baseline drift is external to the refactor and activates the approved hard stop. Production includes ALB/listener replacements, log-group deletes, S3 bucket-policy and CloudFront updates, and other destructive/shared mutations.
- Nathan approved exact baseline equivalence instead of state reconciliation: dev is frozen at 37 operations and production at 100 operations. The old `9d05c269…` / `4479de82…` labels remain provenance; executable gates use fully specified canonical JSONL v2 hashes `29629ae9…` / `f8925b10…` over the same complete arrays.
- Frozen operations are evidence only. Count equality is insufficient, baseline fixtures cannot be edited after Slice 1, every unexpected durable delta returns to plan/review, and no `dev` or `production` apply is authorized anywhere in this ticket.
- Review found that `{op,urn,type,parent}` equality can miss changed desired inputs inside an operation already present in the baseline; the next plan must add secret-safe semantic evidence or choose a different equivalence mechanism.
- Review also requires binding captures to the effective source tree, proving historical SST-version/canonical-byte provenance, treating deltas as duplicate-preserving multisets, and separating durable equivalence policy from PR-stage allowlist policy.
- Revision 5 uses two independent source-only gates: exact frozen operation multisets and before/after HMAC fingerprints of complete policy-visible desired resource definitions under one ephemeral key. A pinned synthetic secret/unknown suite must pass before any constructor move; otherwise the ticket stops.
- Comparison uses committed refs materialized with `git archive`, one unchanged SST checkpoint VersionId, and explicit intent/toolchain fingerprints. It does not require or modify a globally clean worktree.

## Next action

- Continue with `$quark plan sst-platform-stage-boundaries`; do not build or further revise this superseded ticket.

## Gotchas for the next runner

- The working tree contains unrelated developer changes under `docs/`, `infra/sst-env.d.ts`, `.superpowers/`, `.work/`, and `GCP_OAUTH.pdf`; preserve them.
- Do not use a worktree for this ticket unless the developer explicitly changes the earlier no-worktree direction.
- Assign exclusive file ownership to delegated implementers; coordinate shared README and dispatcher changes sequentially.
- `infra/runtime.ts` is the remaining 646-line remote monolith; moving constructors between plain modules is safe only while logical names, parents, and inputs remain exact.
- `msc-gala` and SES must stay reference-only because Heroku production still depends on them.
- The plan is sensitive (`authorization`, `money`, `data-integrity`, `migrations`); review every equivalence/allowlist/state boundary skeptically.
- `mise exec -- ruby` is required locally because system Ruby 2.6 cannot parse the workflow YAML options used by the contracts.
- The baseline implementation/documentation manifest is 4,214 lines; final replacements must produce a net reduction.
- The existing `gate_plan_approved` hash binds the reviewed plan. Any correction changes the hash and requires Nathan to approve the revised plan again.
- No `gate_review` was stamped; the revised resolutions have not yet been re-reviewed.
- The revised plan intentionally invalidates the existing approval hash; do not build until Quark stamps a fresh approval for this exact plan and review returns `ready`.
- The current plan approval hash remains recorded, but no review verdict is stamped; any plan correction will require Nathan to approve the new hash again.
- This second revision invalidates the current approval hash; do not build until Nathan approves this exact plan and review records a matching clean verdict.
- The latest plan is approved, but no review verdict is stamped; any correction invalidates that approval and must complete the plan-approval-review loop again.
- This third revision invalidates the latest approval hash; do not build until Nathan approves this exact plan and review records a matching clean verdict.
- The exact third-revision plan is approved at hash `cf8a5935c5c8`; the clean review must remain bound to that hash. Any plan edit requires a new approval and review.
- Slice 1 is blocked by reproducible live drift, not by tooling: dev has 37 operations and production has 100 across identical repeats. Production contains destructive/shared categories and must not be applied.
- Evidence is under `.work/sst-ergonomic-platform-refactor/evidence/`; the full implementation/review reports are under `.superpowers/sdd/`. These are scratch artifacts and must not be committed.
- No Slice 2–7 implementation has started. Do not refactor resource constructors until the immutable fixtures and comparator pass and this revision has a fresh approval plus clean review.
- The current review is blocked until the semantic policy pack has exact dependency/runtime/output/coverage contracts, each archived ref bootstraps its own generated SST platform/toolchain, checkpoint identity is account/key-bound, and Slice 2 is source-only in fact.
- The fourth plan revision deliberately supersedes the prior empty-diff gate. The old approval/review stamps bind hash `cf8a5935c5c8` and are stale; do not build until Quark records a fresh approval and matching review.
- Baseline fixtures must be created only from the already paired evidence after recomputing the complete arrays and full hashes. Never update a fixture to make a later comparison pass.
- The non-empty baseline contains destructive/shared-looking operations. Exact equivalence proves only zero incremental graph drift from this refactor; it does not make any baseline operation safe to execute.
- Plan hash `5a99e8ef0452` is approved but failed review. Do not stamp a review verdict or build from it; revise the plan, obtain a fresh hash-bound approval, and re-review.
- Revision 5 changes both context and plan, so approval hash `5a99e8ef0452` is stale. The policy analyzer is a feasibility gate, not presumed working: if its pinned SDK exposes secrets/unknowns in a form the synthetic suite cannot safely fingerprint, stop before Slice 2 and return to plan.
- The semantic analyzer sees decrypted secret inputs by Pulumi design. Its repository-owned code may HMAC values in memory but may never log or persist them; the ephemeral key and Git archives live only in restricted `/private/tmp` and are deleted on exit.
