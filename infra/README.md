# Gala SST Infra

## Module map

```text
sst.config.ts        app policy and stage dispatch only
config.ts            fixed platform facts, stage parsing, and capacity
stages/dev.ts        durable dev composition
stages/production.ts durable production composition
stages/preview.ts    PR compute on referenced dev platform, exact PR route
stages/local.ts      local compute on referenced dev platform, no public route
dev-reference.ts     read-only dev cluster, router, CDN, and SSM references
platform.ts          VPC, bastion, RDS, cache, and ECS cluster
assets.ts            shared media lookup, static bucket, and static CDN
runtime/durable.ts   durable secrets, services, routes, tasks, and cron
runtime/derived.ts   preview/local services and tasks only
runtime.ts           constructor-free runtime exports
```

`dev` and `production` are durable, protected stages. Their stable resource
identities and logical names remain owned by SST. Routine application releases
use the canonical ECS-only path documented in `docs/ops/workflows/deploy.md`.

ARM64, `us-west-2`, `learngala.dev`, the bucket names, the production
Dockerfile, immutable asset cache policy, and Cloudflare behavior are reviewed
source invariants in `config.ts`; they are not operator environment knobs.

## Stage ownership

| Stage | Backing | Owns | Public route |
|---|---|---|---|
| `dev` | dev | durable platform, assets, runtime | `dev.learngala.dev` |
| `production` | production | durable platform, assets, runtime | `learngala.dev` |
| `pr-NUMBER` | dev references | web, worker, tasks | exact PR hostname only |
| `local-NAME` | dev references | local-mode app compute | none |

Derived stages may not construct VPC, RDS, cache, bucket, distribution, router,
secret, parameter, cron, bastion, or SES resources. `msc-gala` and SES remain
externally owned and shared with Heroku; never import, replace, or destroy them.
Source refactors run local contracts only. State edits, refreshes, imports, and
applies require a separate reviewed infrastructure operation.

Capacity changes are made only in `DURABLE_CAPACITY`. The verified baseline is:

| Stage | RDS | Storage | Web | Worker |
|---|---|---:|---|---|
| dev | `db.t4g.micro` | 20 GB | 0.5 vCPU/1 GB, 1–1 | 0.25 vCPU/1 GB, 1–1 |
| production | `db.t4g.small` | 50 GB | 1 vCPU/2 GB, 2–3 | 0.5 vCPU/1 GB, 1–2 |

An RDS class can be resized in either direction after an explicit infrastructure
diff. Allocated RDS storage can increase in place but cannot decrease; a
decrease requires a separately reviewed replacement/migration.

### Environment boundary

AWS and Cloudflare credential variables are provider credentials, not Gala
configuration. Stage identity derives hostnames, base URLs, routes, the shared
router reference, bootstrap image channel, and bootstrap asset location.
Routine releases replace only the image digest, canonical `GALA_RELEASE`, and
derived asset host in cloned task definitions. Do not add an operator
environment switch for values that can be derived from stage or `vN`.

## Run SST locally

Run Gala SST commands from this `infra/` directory. Running them from the
repository root can select an unrelated parent `sst.config.ts`.

Local Cloudflare credentials are loaded from the ignored repository-root
`cloudflare.txt` file by direnv. The file uses these names:

```text
CLOUDFLARE_ID=<Cloudflare Global API Key>
CLOUDFLARE_EMAIL=<Cloudflare account email>
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account ID>
CLOUDFLARE_ZONE_ID=<learngala.dev zone ID>
```

`.envrc` maps `CLOUDFLARE_ID` to the `CLOUDFLARE_API_KEY` name expected by the
Cloudflare provider. Do not commit `cloudflare.txt`, copy these credentials into
tracked files, or replace the GitHub Actions `CLOUDFLARE_API_TOKEN` repository
secret with a Global API Key.

After changing `.envrc`, authorize it once from the repository root:

```sh
direnv allow .
```

Local application configuration can include database/cache variables that SST
must generate itself. Remove those variables only from the deploy subprocess:

```sh
cd ./infra
direnv exec .. env \
  -u DATABASE_URL \
  -u REDIS_HOST \
  -u REDIS_URL \
  -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  SST_STAGE=dev \
  npx sst diff --stage dev
```

Do not run `sst refresh` as a safety-diff prerequisite: refresh persists
computed-resource drift before it can be reviewed. Always inspect the complete
`npx sst diff --stage dev` output before a deploy. Do not proceed when the plan
contains any deletion or replacement that is not expressly required by the
change being deployed, regardless of resource type.

Phase-one structural review uses authenticated, non-refreshing `sst diff` for
both durable stages. Any S3, SES, ALB, CloudFront, log-group, autoscaling, VPC,
RDS, cache, bastion, router, service, task-definition, or cross-stage mutation
is a stop condition.

## Connect to SST Postgres from local

The SST `dev` and `production` Postgres databases are private RDS instances. To
connect from your local machine, run an SST tunnel through the stage bastion,
then connect with the stage `DATABASE_URL` stored in SSM.

Use `AWS_PROFILE=gala`, not `AWS_GALA=gala`. `AWS_GALA` is not read by the AWS
CLI or SST.

Prerequisites:

- AWS credentials for the `gala` profile.
- `AWS_REGION=us-west-2`.
- Node matching `package.json` (`>=24 <25`) and dependencies installed in this
  directory with `npm install`.
- `psql` installed locally.

Do not run `sudo npx tunnel install`. That invokes an unrelated `tunnel`
package name through `npx`. Use the SST CLI from this package instead.

### Dev

Terminal 1, start the tunnel:

```sh
cd ./infra
AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=dev npx sst tunnel --stage dev
```

Terminal 2, connect with `psql`:

```sh
env -u DATABASE_URL sh -c '
  url="$(AWS_PROFILE=gala AWS_REGION=us-west-2 aws ssm get-parameter \
    --name /gala/dev/DATABASE_URL \
    --with-decryption \
    --query Parameter.Value \
    --output text)"

  psql "$url"
'
```

Quick connection check:

```sh
env -u DATABASE_URL sh -c '
  url="$(AWS_PROFILE=gala AWS_REGION=us-west-2 aws ssm get-parameter \
    --name /gala/dev/DATABASE_URL \
    --with-decryption \
    --query Parameter.Value \
    --output text)"

  psql "$url" -Atc "select current_database(), current_user, inet_server_addr()::text, inet_server_port();"
'
```

Expected shape:

```text
gala|postgres|10.x.x.x/32|5432
```

### Production

Terminal 1, start the tunnel:

```sh
cd ./infra
AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production npx sst tunnel --stage production
```

Terminal 2, connect with `psql`:

```sh
env -u DATABASE_URL sh -c '
  url="$(AWS_PROFILE=gala AWS_REGION=us-west-2 aws ssm get-parameter \
    --name /gala/production/DATABASE_URL \
    --with-decryption \
    --query Parameter.Value \
    --output text)"

  psql "$url"
'
```

Quick connection check:

```sh
env -u DATABASE_URL sh -c '
  url="$(AWS_PROFILE=gala AWS_REGION=us-west-2 aws ssm get-parameter \
    --name /gala/production/DATABASE_URL \
    --with-decryption \
    --query Parameter.Value \
    --output text)"

  psql "$url" -Atc "select current_database(), current_user, inet_server_addr()::text, inet_server_port();"
'
```

Expected shape:

```text
gala|postgres|10.x.x.x/32|5432
```

## Stop the tunnel

Press `Ctrl-C` in the terminal running `npx sst tunnel`.

If a tunnel process is left behind:

```sh
pgrep -fl 'sst tunnel|bin/sst.*tunnel|npx sst tunnel'
kill <pid>
```

## Notes

- Keep the tunnel running while `psql`, Rails, or another local client is using
  the private RDS endpoint.
- The `env -u DATABASE_URL` wrapper prevents an unrelated local `DATABASE_URL`
  from overriding the stage URL fetched from SSM.
- Avoid exporting the production `DATABASE_URL` into your shell history or
  dotfiles.
