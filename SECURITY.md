# Security Policy

Please do not open public issues that include secrets, tokens, private URLs, database dumps, or exploit details.

Report sensitive findings privately to the repository maintainers. Include the affected commit, route, workflow run, or infrastructure component, plus the minimum reproduction details needed to validate the issue.

Deployment secrets are expected to live only in GitHub Actions secrets, SST secrets, AWS, or Cloudflare. They must not be committed to code, planning artifacts, release notes, or workflow logs.
