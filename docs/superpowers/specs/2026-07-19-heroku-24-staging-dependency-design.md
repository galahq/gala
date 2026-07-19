# Heroku-24 Staging Dependency Design

## Goal

Deploy `oauth/staged-google-key-rotation` to `msc-gala-staging` on the
Heroku-24 stack through classic source buildpacks. The production `msc-gala`
app must remain untouched, and a container deployment remains plan B only.

## Confirmed Failure

The first Heroku-24 source build stopped before Node or Ruby because
`candletrick/heroku-22-wkhtmltopdf-buildpack` rejects stacks other than
Heroku-22. The configured VIPS buildpack also advertises support only through
Heroku-22.

## Design

- Add `wkhtmltopdf-heroku` version `3.0.0` to the production Ruby dependency
  set. This gem supplies wkhtmltopdf for Heroku-22 and Heroku-24 and integrates
  with PDFKit without an application-level executable path change.
- Add `libvips42` to `Aptfile`. Ubuntu 24.04 provides this package, and the
  existing `ruby-vips` and Active Storage configuration can continue using the
  system library.
- Remove only the incompatible wkhtmltopdf and VIPS buildpacks from
  `msc-gala-staging`. Retain the APT, Node.js, and Ruby buildpacks in that order.
- Keep `app.json` aligned with staging so future Review Apps use the same
  Heroku-24-compatible dependencies and buildpack list.
- Do not run any command against `msc-gala`.

## Verification

1. Prove the original Heroku-24 build failure is the missing-stack support in
   the wkhtmltopdf buildpack.
2. Verify the lockfile resolves with Ruby 4.0.3 and the existing test suite
   remains green.
3. Push the dependency commit to `oauth/staged-google-key-rotation`.
4. Deploy that branch to `msc-gala-staging` through the Heroku Git source path.
5. Confirm the completed build used Heroku-24, Ruby 4.0.3, and Node 24.x.
6. Confirm `wkhtmltopdf` and VIPS load inside a staging one-off dyno.
7. Confirm web and worker dynos are up, `/up` responds successfully, and recent
   staging logs contain no boot crash.

## Rollback

If the source build or smoke checks fail, keep the existing successful staging
release active while diagnosing. If a faulty release becomes active, roll back
`msc-gala-staging` to its previous release. Do not promote or deploy anything to
production.
