# Debugging production errors after the PII changes

Since PR #797, Sentry no longer receives personal data. This changes where
you look when an error comes in. The short version: **Sentry tells you what
broke and which reader hit it; Papertrail tells you what they sent.**

## What a Sentry error event contains now

| Still there | Gone |
|---|---|
| Exception, stack trace, release, environment | Reader's email (replaced by their numeric id) |
| **User → id** (the `readers.id`) | Full parameter hash (`params.to_unsafe_h`) |
| **Request → path and method** | Request body, cookies, client IP |
| Request headers such as User-Agent and Referer (path only) | Query string, on the URL and on Referer |
| **Tag → `request_id`** (the Heroku request id) | SQL statement text in Sentry Logs |
| Breadcrumbs of outbound HTTP calls | Reader's email on browser-side errors |
| Controller events in Sentry Logs | |

The reader id gives you the same grouping the email did: search Sentry for
`user.id:<id>` to see everything that person has hit.

## Step by step

1. **Open the Sentry event.** Read the exception and stack trace. Note the
   reader id under *User*, the path under *Request*, and the `request_id`
   tag. For most errors the trace and path are enough. Stop here if you can.

2. **Need the input the user sent? Search Papertrail for the request id.**
   Production tags every log line with it, so one search returns the whole
   request in order:

   - The **Heroku router line**: full path including query string, client IP,
     status, timing.
   - The **lograge line** (`👋 {...}`): controller, action, and every
     parameter the user submitted. Sensitive keys show as `[FILTERED]`,
     everything else is readable.
   - Any application log lines from that request.

   Open Papertrail from the Heroku dashboard (Resources → Papertrail) or:

   ```
   heroku addons:open papertrail -a msc-gala
   ```

3. **Need to know who it was?** Open the admin page for the id:

   ```
   /admin/readers/<id>
   ```

   That shows name, email, sign-in history and roles.

4. **Reproduce** on staging or locally with the path, the visible parameters,
   and the reader's role.

5. **Do it promptly.** Papertrail is on the free plan, so searchable
   retention is a matter of days, much shorter than Sentry's. If a request's
   parameters matter, pull them while they are still there.

## What is filtered in the logs

`config/initializers/filter_parameter_logging.rb` masks these in lograge
output (matching is by substring unless noted):

- Rails' default list: `passw`, `email`, `secret`, `token`, `_key`, `crypt`,
  `salt`, `certificate`, `otp`, `ssn`
- `lis_person` (LTI launch fields)
- Nested keys, matched on the full path: `comment.content` (forum comment
  body), `answers.content` (quiz answers), `reader.name` and
  `reader.initials` (registration and profile forms)
- `key` exactly (the magic-link enrolment key)

Everything else is logged as submitted. If the exact value of a filtered
field caused the error (say, a malformed email on registration), you will
know the field from the `[FILTERED]` marker and the validation from the
stack trace, but you have to reproduce with a guess or ask the person.

## Why

Sentry and Papertrail are third parties the university has no erasure
process for. The compliance register (untracked, `docs/compliance-open-questions.md`
on the maintainer's machine) decided to stop sending them personal data
rather than build one (answers A6 and A19). Everything removed from Sentry
is still available through the request id in Papertrail or the admin page,
so the debugging information exists; it lives in stores we control.

## Verifying the Sentry configuration after a change

`spec/requests/pii_logging_spec.rb` builds a real `Sentry::ErrorEvent` under
the production initializer and asserts nothing personal is in the payload.
Keep it green when touching `config/initializers/sentry.rb`,
`ApplicationController#set_sentry_context` or
`app/assets/javascripts/sentry.js.erb`. After a deploy, open the first real
Sentry event and confirm it shows a reader id and a path and nothing else.

The browser SDK (`sentry.js.erb`, loaded from the Sentry CDN) is still the
2018-era 4.2.2 bundle and is tracked separately in the compliance work; it
sends the reader id only.
