# Phase 24 Research Seed: Production Docker Image Slimming

## Trigger

The dev SST deploy path exposed that Gala currently pays for large and duplicated container builds:

- Local application images observed around 6.1 GB uncompressed.
- ECR/runtime-sized images observed around 1.67 GB for a single Rails runtime image.
- SST-generated task images such as `GalaMigrate` and `GalaWeb` each produced separate runtime images around 1.67 GB plus registry cache images around 2.47 GB.
- The build context was observed around 4.9 GB, including a `.git` directory around 427 MB and `public` around 258 MB.

## Research-backed tactics

- Rails/Docker production convention: use a production Dockerfile, not a development image, with multi-stage build separation so build-only packages and Node tooling do not stay in the final image. Source: https://docs.docker.com/guides/ruby/containerize/
- Rails/Docker convention: compile assets with `SECRET_KEY_BASE_DUMMY=1`, precompile Bootsnap, copy only built artifacts into the final stage, run as a non-root user, and use a `.dockerignore` that excludes `.git`, env files, logs, tmp, storage, credentials keys, and local caches. Source: https://docs.docker.com/guides/ruby/containerize/
- Bootsnap production Docker convention: precompile Bootsnap caches for production images; when cross-building under QEMU/buildx, use `-j 0` if parallel precompile hangs. Source: https://github.com/rails/bootsnap
- 37signals/Thruster tactic: Thruster wraps Puma to provide HTTP/2, public asset caching, X-Sendfile, and compression; it can be added by prefixing the existing container command, but in Gala this should be evaluated only if it reduces operational complexity or runtime work without increasing image weight materially. Sources: https://dev.37signals.com/thruster-released/ and https://github.com/rails/rails/issues/50479
- Kamal/37signals build tactic: build one app image, push it to the registry, and deploy that release image; builder options support a distinct Dockerfile, build target, context, single architecture, remote builder, build args/secrets, and registry/GHA cache. Sources: https://kamal-deploy.org/docs/configuration/builders/ and https://kamal-deploy.org/docs/configuration/builder-examples/
- Kamal builder examples specifically call out ARM64-to-AMD64 local buildx/QEMU builds as slow on first build and recommend a remote AMD64 builder or single-arch builder strategy where appropriate. Source: https://kamal-deploy.org/docs/configuration/builder-examples/

## Candidate implementation direction

1. Add `Dockerfile.production` for deploy images and keep the existing development Dockerfile path intact unless explicitly migrated later.
2. Add a production base-image strategy, likely `Dockerfile.production-base`, with Ruby, minimal runtime apt packages, jemalloc, libvips, PostgreSQL client, and only runtime PDF/font packages that route coverage proves are needed.
3. Keep Node/pnpm, build-essential, git, pkg-config, lib*-dev packages, and asset compilation in build stages only.
4. Replace broad final `COPY /gala /gala` behavior with either a surgical whitelist or a cleanup step that excludes source maps/caches/tests/local state from final runtime layers.
5. Tighten `.dockerignore` for production builds so local `.git`, caches, old assets, and development artifacts do not enter the build context.
6. Adjust SST so web, worker, migrate, and maintenance tasks use the same release image URI instead of each defining a separate Docker image asset.
7. Measure before and after with `docker image ls`, `docker history`, `docker buildx du` where available, and AWS ECR `imageSizeInBytes`.

## Safety boundaries

- Do not mutate Heroku production at `https://www.learngala.com`.
- Do not mutate the Heroku database, Heroku Redis, SES, or the retained `msc-gala` ActiveStorage media bucket.
- Validate first against `SST_STAGE=dev` using `AWS_PROFILE=gala AWS_REGION=us-west-2`.
- Treat production deploy as a separate explicit gate after image size and task reuse are validated.
