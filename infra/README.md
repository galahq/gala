# Gala SST Infra

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
