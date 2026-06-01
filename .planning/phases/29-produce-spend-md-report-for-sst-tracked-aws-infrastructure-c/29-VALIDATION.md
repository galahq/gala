---
phase: 29
slug: produce-spend-md-report-for-sst-tracked-aws-infrastructure-c
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-01
---

# Phase 29 - Validation Strategy

> Validation contract for a spend report that is decision-useful, evidence
> backed, and safe to produce from read-only AWS and repository state.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Markdown/static assertions, read-only AWS CLI inventory, optional AWS Pricing API/Calculator evidence |
| **Config file** | `infra/sst.config.ts`, `.github/workflows/deploy.yml`, `SPEND.md` |
| **Quick run command** | `rg -n "EXECUTIVE SUMMARY|INVENTORY|CAPEX|OPEX|GROWTH MODEL|CUT COST|HEROKU DECISION|EVIDENCE|UNKNOWN" SPEND.md` |
| **Full suite command** | `ruby -e 'p=File.read("SPEND.md"); %w[EXECUTIVE\\ SUMMARY SCOPE INVENTORY CAPEX OPEX GROWTH\\ MODEL CUT\\ COST HEROKU\\ DECISION EVIDENCE UNKNOWN].each { |s| abort("missing #{s}") unless p.match?(/#{s}/i) }; abort("secret-like") if p.match?(/postgres:\\/\\/|rediss?:\\/\\/|SECRET_KEY|PASSWORD=|TOKEN=/)' && AWS_PROFILE=gala AWS_REGION=us-west-2 aws sts get-caller-identity >/dev/null` |
| **Estimated runtime** | ~10 seconds for static checks; 1-5 minutes for full read-only AWS inventory evidence |

---

## Sampling Rate

- **After each report-writing task:** Run the quick Markdown section assertion.
- **After each evidence refresh:** Re-run the relevant read-only AWS command and update the evidence timestamp.
- **After the final task:** Run the full suite command plus manual scan for unverified pricing claims.
- **Before `$gsd-verify-work`:** `SPEND.md` must include source-vs-live evidence, estimates, assumptions, and decision thresholds.
- **Max feedback latency:** 5 minutes.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Command / Evidence | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|--------------------|-------------|--------|
| 29-01-01 | 01 | 1 | Phase 29 SC1 | T-29-01 | Inventory uses repo and read-only AWS only; no mutation | static/AWS read-only | `rg -n "GalaWeb|GalaWorker|GalaDatabase|GalaCache|CloudFront|S3|ECR|ALB|GitHub Actions" SPEND.md` plus AWS inventory transcript | yes | complete |
| 29-01-02 | 01 | 1 | Phase 29 SC2-3 | T-29-02 | Pricing assumptions are labeled and source linked | doc assertion | `rg -n "Assumption|Estimate|Fargate|RDS|Valkey|CloudFront|S3|ALB|ECR|CloudWatch|public IPv4|data transfer" SPEND.md` | yes | complete |
| 29-02-01 | 02 | 2 | Phase 29 SC2-4 | T-29-03 | Capex/opex and growth scenarios are separated | doc assertion | `rg -n "CAPEX|OPEX|Low|Expected|High|Growth Model|Scenario" SPEND.md` | yes | complete |
| 29-02-02 | 02 | 2 | Phase 29 SC5-6 | T-29-04 | Recommendations name tradeoffs and migration thresholds | doc assertion | `rg -n "Cut Cost|Risk|Tradeoff|Heroku|Decision Threshold|Stay|Hybrid|AWS" SPEND.md` | yes | complete |
| 29-03-01 | 03 | 3 | Phase 29 SC7 | T-29-05 | Final report leaks no secrets and calls out unverified gaps | static/security | Ruby secret-pattern scan from full suite command | yes | complete |
| 29-03-02 | 03 | 3 | Phase 29 SC1-7 | T-29-06 | Evidence reconciles SST tracked infra against live AWS | source/AWS read-only/manual | Compare `infra/sst.config.ts` inventory to AWS read-only output; source-vs-live drift listed | yes | complete |

---

## Wave 0 Requirements

Existing infrastructure covers the phase. No new test framework is required.

Optional helper scripts are allowed only if they make evidence collection
repeatable without mutating AWS. Any helper must be read-only and default to
`AWS_PROFILE=gala AWS_REGION=us-west-2`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Failure Behavior |
|----------|-------------|------------|-------------------|------------------|
| Heroku comparison | Phase 29 SC6 | Heroku plan/invoice data may not be present in repo or AWS | Confirm `SPEND.md` either cites actual Heroku plan/bill evidence or labels the Heroku comparison as assumption-based. | Mark Heroku comparison as incomplete and list required invoice/plan data. |
| Pricing accuracy | Phase 29 SC3 | AWS pricing changes and calculators may vary by region/date | Verify estimates use current official AWS pricing pages/API and record the date. | Do not present unsupported exact dollar amounts. |
| Migration decision usefulness | Phase 29 SC6 | The final decision threshold is a CODEOWNER/operator judgment | Read the executive summary and confirm it supports stay/hybrid/migrate decisions without hidden assumptions. | Add explicit thresholds and unknowns. |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verify coverage.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 is not required.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 5 minutes.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** executed and validated (local + read-only AWS)
