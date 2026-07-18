# Review: sst-ergonomic-platform-refactor

Plan review (native) — 2026-07-12T05:52:00Z  
Reviewer: self (Codex)  
Plan hash: `dd61a05ec77a`

## Blocking

- The semantic-equivalence gate is not yet an executable contract. The plan says “a separately pinned local Pulumi policy pack,” but does not name the exact `@pulumi/policy`/Pulumi SDK versions, the exact SST invocation/configuration that supplies the HMAC-key and artifact paths, or the callback lifecycle that writes `complete:true`. More importantly, `ResourceValidationArgs` callbacks do not by themselves prove that every desired component/custom resource was observed; a policy process can finish with a partial artifact unless coverage and end-of-run failure are explicit. AC28 is the central protection against an in-place `update` collision, so a builder cannot safely choose these details during build. Add exact dependency versions and lockfile provenance, a child-only key/output protocol, a synchronous/atomic finalization rule with nonzero failure on incomplete callbacks, and a machine-checkable coverage record tying every desired URN (including unchanged resources and component options) to one fingerprint. Run the current-stage self-comparison only after that feasibility/coverage test passes; otherwise stop before any constructor move as the plan promises.

- The four-run semantic pair can still compare artifacts that were produced by different generated SST toolchains. The plan requires `git archive` for each ref but never explicitly runs `npm ci` and `npx sst install` inside each archive, nor states how ignored `.sst/platform` files are regenerated and checked before the preview. A host checkout's generated platform files could be reused, or a missing generated file could cause a fallback, while the intent fingerprint claims exact source identity. Specify an isolated per-ref install/bootstrap sequence, verify the installed SST/Pulumi versions against the ref lockfile before every preview, include generated platform output in the intent artifact only after that bootstrap, and fail closed if any archive can read outside its own root.

## Important

- The checkpoint safety rule does not identify the state object strongly enough. It names `sst-state-zdasdfxbxnba` and `app/gala/STAGE.json`, but leaves `STAGE` interpolation, AWS account/owner validation, and null/missing `VersionId` handling to the implementer. A preview against the wrong account, region, or object can produce a false unchanged checkpoint. Define the exact keys (`app/gala/dev.json` and `app/gala/production.json`), require `sts get-caller-identity` to match the canonical account and region, use `head-object` metadata only with a non-null VersionId, and reject bucket/key/owner mismatches before and after every preview.

- Slice 1's environment rule conflicts with the current evaluated source. `infra/runtime.ts` reads `process.env.CLOUDFLARE_ZONE_ID`, and `.github/workflows/deploy.yml` supplies it, while `capture-sst-diff.sh` says it will statically reject every graph-affecting `process.env` read outside the sanitized list. The plan must either make `CLOUDFLARE_ZONE_ID` an explicitly recorded non-secret input for Slice 1 (including its value in the intent fingerprint) or defer enforcement until the routing consumer is migrated in Slice 4. Add a fixture proving the chosen behavior; otherwise the first capture is either rejected or silently evaluated with an unbound graph input.

- Slice 2 is described as a source-only constructor move, but `infra/runtime/services.ts` explicitly removes “dead fallbacks and optional-value compaction.” Those edits can change resolved inputs under an existing environment and are not source-only by contract, even if the semantic gate later detects some changes. Move that cleanup to a separately named behavior slice, or require a before/after behavior contract for every removed fallback and make the source-only slice contain declaration moves only.

- The policy pack's dependency model is incomplete beyond the one Google transform. The plan correctly notes that policy options do not expose `dependsOn`, but AC28 claims complete desired-resource equivalence while the canonical record omits all dependency edges and does not require a source-contract inventory for every transform that can affect ordering or replacement. Enumerate all dependency-producing transforms/options in the aggregate contract (or explicitly prove Google is the only one by a static scan), and make missing/extra edges a hard mismatch rather than silently accepting equal property HMACs.

- The plan requires “complete” semantic artifacts and repeat stability but does not define the expected cardinality/URN set or how a missing provider callback is distinguished from a resource that legitimately has no changed operation. Add a coverage section to the artifact (sorted URNs/count, no duplicate-URN ambiguity) and compare it against the full desired-resource inventory from the same preview, not only the frozen operation array. A zero/short artifact must fail even when the operation comparator passes.

## Minor

- The plan refers to “the named sanitized non-secret inputs” and “the exact checkpoint key” in several places without one shared schema. Put the allowed input names, value normalization, and stage-to-key mapping in one small machine-readable contract consumed by the capture wrapper, intent builder, and semantic-pair coordinator.

- `infra/platform.constants.json` is already present in the current tree; the Slice 1 wording says “add” it and also requires values from a live capture. State whether this is an extension/validation of the existing file and prohibit rewriting unrelated existing constants during the capture step.

## Resolutions

- Semantic policy feasibility, exact SDK pin, output protocol, and complete-resource coverage (Blocking) — fold into plan: name exact package versions and lockfile provenance; define child-only key/artifact paths, callback finalization, atomic complete marker, failure behavior, and a coverage inventory; run a current-stage four-run feasibility/self-test before any constructor move and return to plan if it fails.
- Isolated `git archive` toolchain bootstrap (Blocking) — fold into plan: run `npm ci` and `npx sst install` independently in each archived ref, verify lockfile/CLI/Pulumi versions and generated platform files, and reject reads outside the archive.
- Checkpoint account/key identity (Important) — fold into plan: specify exact stage keys, account/owner/region checks, metadata-only `head-object`, and non-null VersionId rejection before and after each preview.
- `CLOUDFLARE_ZONE_ID` enforcement sequencing (Important) — fold into plan: either add it to the explicit recorded non-secret input allowlist for Slice 1 or defer static rejection until its consumer is migrated, with a regression fixture.
- Source-only Slice 2 cleanup (Important) — fold into plan: move fallback/compaction removal to a behavior slice or retain exact source-only inputs and add a dedicated behavior contract.
- Dependency and callback coverage (Important) — fold into plan: enumerate every dependency-producing transform and require a complete sorted URN/edge coverage artifact; fail on missing callbacks or duplicate-URN ambiguity.
- Shared input schema and existing constants wording (Minor) — fix in build/documentation: centralize the schema and clarify extension/validation semantics without changing unrelated constants.

No review verdict was stamped. Blocking and Important gaps remain; return to `plan`, obtain a new approval for the changed plan hash, then re-run review.
