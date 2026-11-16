# AWS CI/CD contract

This document defines the target CI/CD contract for the Rails 8 modernization line. It does not change the current Heroku deployment by itself.

## Goals

- Keep the public repository safe for an open source project.
- Test the application and build one production image for every runtime role.
- Publish immutable Linux ARM64 images to Amazon ECR.
- Keep infrastructure, secrets, environment configuration, and deployments in the private Terraform repository.
- Promote the same image digest through staging and production.
- Prefer standard GitHub Actions, Docker, AWS OIDC, ECR, and ECS behavior without deployment wrappers.

## Responsibility boundary

### This public repository owns

- Pull request checks.
- Application tests, linting, dependency checks, and asset compilation.
- Building the production Docker image from `Dockerfile.production` for `linux/arm64`.
- Scanning and attesting the image.
- Publishing approved images to ECR with immutable identifiers.
- Producing machine-readable build metadata for the private deployment workflow.

### The private Terraform repository owns

- Terraform state, providers, modules, plans, and applies.
- AWS account IDs, role ARNs, networking, ECS, ALB, CloudFront, WAF, RDS, S3, SES, and DNS configuration.
- SSM Parameter Store paths and all application secrets.
- ECS task definitions, service updates, database migrations, health checks, promotion, and rollback.
- Staging and production approvals.

The public workflow must not apply Terraform, read application secrets, query SSM parameters, modify ECS services, connect to RDS, or change DNS.

## Workflow behavior

### Pull requests

- Run for pull requests from branches and forks.
- Use no AWS credentials and request no OIDC token.
- Install dependencies from lockfiles.
- Run Ruby and JavaScript tests, linters, and security checks already adopted by the project.
- Compile production assets with a dummy secret such as `SECRET_KEY_BASE_DUMMY=1` when Rails requires one.
- Build the production image for `linux/arm64` without pushing it.
- Boot the built image and verify the Rails health endpoint, normally `/up`.
- Never use `pull_request_target` to build or execute untrusted pull request code.

### Merges to `main`

- Run the full required check suite before publishing.
- Authenticate to AWS with GitHub OIDC only. Do not store long-lived AWS access keys in GitHub.
- Assume a narrowly scoped ECR publisher role whose ARN is supplied as a non-secret repository or environment variable.
- Build and push the image to ECR.
- Tag the image as `sha-<full-git-sha>`.
- Record the immutable ECR digest. Downstream deployment must use the digest, not a mutable tag.
- Create a build metadata artifact containing:
  - Git commit SHA.
  - Git ref.
  - ECR repository and image digest.
  - Image platform.
  - Dockerfile path.
  - Build timestamp.
- Produce GitHub artifact attestations and an SBOM when supported by the selected standard actions.
- Make the digest available to the private repository as a staging candidate. Publishing is not deployment.

### Signed release tags

- Accept the project's protected, signed release tag convention.
- Verify that the tag points to an approved commit and passes the complete check suite.
- Add the version tag to the existing immutable image or publish the identical build output.
- Make the digest available to the private repository as a production candidate.
- Never update production ECS directly from this repository.

## Image contract

- Build one image and use it unchanged for all ECS roles.
- Use the production Dockerfile already validated on ARM64.
- Run the web service with Puma.
- Run the worker service with Solid Queue using `bin/jobs start`.
- Run migrations as a one-off ECS task with `bin/rails db:prepare` before a service rollout.
- Keep environment-specific values out of image layers and build arguments.
- Do not bake Rails credentials, AWS credentials, database URLs, API keys, or `.env` files into the image.
- Do not deploy `latest`. Human-friendly tags may exist, but ECS must reference the image digest.

## GitHub Actions security

- Set workflow permissions to `contents: read` by default.
- Grant `id-token: write` only to the ECR publishing job.
- Grant `attestations: write` only if image attestations are emitted.
- Scope the AWS publisher role to the required ECR authentication and push operations for one repository.
- Deny that role access to ECS, IAM, SSM, Secrets Manager, RDS, S3 application data, Terraform state, and DNS.
- Protect the publishing environment and restrict its allowed branches and tags.
- Pin third-party actions to full commit SHAs and use well-maintained official actions where possible.
- Avoid interpolating branch names, tag names, issue text, or pull request content directly into shell commands.
- Never print tokens, credentials, environment dumps, or Docker build history containing sensitive values.
- Prevent fork pull requests from entering any publishing job.
- Use workflow concurrency so an older run for the same ref is cancelled before it publishes.

## Recommended job sequence

1. `test`
   - Restore dependency caches.
   - Run application tests and static checks.
2. `build`
   - Build `linux/arm64` with Docker BuildKit.
   - Compile assets without real application secrets.
   - Start the container and check `/up`.
3. `publish`
   - Run only for approved `main` and signed release tag events.
   - Obtain short-lived AWS credentials through OIDC.
   - Push the image and resolve its digest.
4. `attest`
   - Generate provenance, SBOM, and the build metadata artifact.

The private deployment repository then consumes the immutable digest, deploys it to `staging.learngala.dev`, runs smoke checks, waits for production approval, and promotes that same digest to `www.learngala.com`.

## Required repository configuration

- A GitHub OIDC trust relationship restricted to this repository, the publishing workflow, and approved refs or environments.
- A non-secret variable containing the ECR publisher role ARN.
- A non-secret variable containing the ECR repository location or name.
- Branch protection on `main` requiring the pull request check suite.
- Protected release tags or a protected production-candidate environment.
- No production application secrets in GitHub Actions.

## Acceptance checks

- A fork pull request completes all useful checks without receiving AWS credentials.
- A pull request cannot push an image.
- A successful `main` run publishes exactly one ARM64 image candidate identified by digest.
- A failed test, asset build, image build, or health check prevents publication.
- Re-running a workflow cannot replace an existing immutable digest.
- The ECR publisher role cannot read SSM secrets or update ECS.
- Staging and production deploy the exact digest produced by this workflow.
- Rollback selects an earlier known-good digest in the private repository and requires no rebuild.
