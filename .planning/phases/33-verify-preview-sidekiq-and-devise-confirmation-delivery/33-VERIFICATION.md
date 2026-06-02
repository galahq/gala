---
phase: 33
status: complete
verified_at: 2026-06-02T13:55:00Z
---

# Phase 33 Verification

## GitHub Context

- PR #785 targets `main` from branch `infra/sst-aws-poc`.
- Current inspected head: `d13a137f3bfad0e973859ef831239cfbe03a6085`.
- GitHub Actions job `validation` completed successfully for run
  `26797635365`, while the `gala/ci-validation` status context still points at
  the validation artifact failure state. This preserves the prior exact-head
  artifact debt and does not block this read-only AWS worker investigation.

## ECS Worker Health

- Dev cluster: `gala-dev-GalaClusterCluster-zeeusfkv`.
- `GalaWorker` desired `1`, running `1`, pending `0`, rollout `COMPLETED`.
- Active worker task definition: `GalaWorker:16`.
- Active worker task:
  `arn:aws:ecs:us-west-2:353760060567:task/gala-dev-GalaClusterCluster-zeeusfkv/0bf332915b9a46358b43a5a3eac2b406`.
- ECS reported the worker task and container as `RUNNING` and `HEALTHY`.
- CloudWatch ECS metrics for the last three hours had current datapoints for
  both CPU and memory utilization, confirming the service is publishing runtime
  metrics.

## CloudWatch Worker Logs

- Worker log group:
  `/sst/cluster/gala-dev-GalaClusterCluster-zeeusfkv/gala-dev-GalaWorker-dsbdtrhu/GalaWorker`.
- Logs Insights query `c84d2c73-4985-4b67-a2da-cf53ed8f39be` showed Sidekiq
  booted, connected to the SST-managed Redis endpoint, loaded the configured
  queues, and processed `Ahoy::GeocodeV2Job` records during the inspected
  signup window.
- Logs Insights query `0a3156ef-4764-4ae7-a975-c724be07d8c5` found no
  `MailDeliveryJob`, `AuthenticationMailer`, `ActionMailer`, `mailers`, or
  matching recipient-email worker records for the tested signup.

## Devise Signup and Mail Evidence

- Web log group:
  `/sst/cluster/gala-dev-GalaClusterCluster-zeeusfkv/gala-dev-GalaWeb-bcxhrofd/GalaWeb`.
- Logs Insights query `34f83af4-d839-4923-bf9c-bc5ef44ac47b` found the tested
  `POST /readers` request for `papester1+99@gmail.com`.
- Logs Insights query `fca2e7ea-5cf6-4163-9443-3e6f9e24265f` isolated request
  id `60452adc-0d3f-4da5-afaa-86e145edca7f` and showed:
  - reader creation committed successfully;
  - `AuthenticationMailer#confirmation_instructions` rendered and processed;
  - Rails logged `Delivered mail ...`;
  - `POST /readers` completed with HTTP `302`.
- The confirmation token and full message body are intentionally not copied
  into planning artifacts.

## SES Evidence

- `aws sesv2 get-account` reported:
  - `ProductionAccessEnabled: true`;
  - `SendingEnabled: true`;
  - `EnforcementStatus: HEALTHY`.
- Verified SES identities include `learngala.com`, `learnmsc.org`, and
  `hello@learnmsc.org`. The sender domain `learngala.com` is verified.
- `aws ses get-send-statistics` and CloudWatch `AWS/SES` metrics showed one
  send attempt around the signup window.
- CloudWatch `AWS/SES` metrics for `Reject`, `Bounce`, and `Complaint` returned
  no datapoints for the inspected window.

## Conclusion

The preview Sidekiq worker is working. The tested Devise confirmation email did
not exercise Sidekiq because the app delivered that notification inline from
the web process. Rails and SES telemetry both indicate a send attempt was made
and no AWS-side reject, bounce, or complaint was observed.

The missing Gmail inbox message is therefore not reproduced as a Sidekiq worker
failure. Stronger recipient-delivery proof would require adding SES event
publishing for delivery/bounce/complaint/open events or checking recipient-side
spam/quarantine/filtering.
