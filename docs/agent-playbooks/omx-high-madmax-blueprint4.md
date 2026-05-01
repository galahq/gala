# OMX High + Madmax Essential Setup

Purpose: prepare a repo for a high-autonomy **CMUX + OMX + Codex** migration workflow using:

```bash
omx --high --madmax
```

Target use case: a large UI migration such as **BlueprintJS 2.3.1 → BlueprintJS 4**, where agents need repo context, browser evidence, route checks, and visual parity gates.

> `--madmax` bypasses Codex approvals and sandbox. Use it only in a clean git branch or worktree with no secrets in the working tree and with rollback available.

---

## 0. Safety posture

Use this workflow only when all are true:

```txt
required:
  clean git status
  dedicated branch or git worktree
  local/dev credentials only
  no production tokens in env
  test database or disposable local data
  human review before merge

not allowed:
  production deploy credentials
  real customer data
  broad filesystem trust
  YOLO edits on main
```

Recommended branch:

```bash
git status --short
git checkout -b blueprint4-upgrade
```

Or worktree:

```bash
git fetch origin
git worktree add ../gala-blueprint4 -b blueprint4-upgrade
cd ../gala-blueprint4
```

---

## 1. What to install globally

Install or update Codex and OMX:

```bash
npm install -g @openai/codex oh-my-codex
codex --version
omx --version || true
```

Run OMX setup:

```bash
omx setup
omx doctor
```

If startup on macOS spikes `syspolicyd` or `trustd`, especially with `--madmax --high`, try:

```bash
xattr -dr com.apple.quarantine "$(which omx)"
```

Then restart your terminal.

---

## 2. Keep Codex Apps off globally

Keep `codex_apps` disabled globally. Use project-scoped MCP servers instead.

Open:

```bash
nvim ~/.codex/config.toml
```

Ensure this exists:

```toml
suppress_unstable_features_warning = true

[features]
child_agents_md = true
codex_hooks = true
apps = false
```

Keep the core OMX MCP servers globally enabled:

```toml
[mcp_servers.omx_state]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/state-server.js"]
enabled = true
startup_timeout_sec = 10
tool_timeout_sec = 30

[mcp_servers.omx_memory]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/memory-server.js"]
enabled = true
startup_timeout_sec = 10
tool_timeout_sec = 30

[mcp_servers.omx_code_intel]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/code-intel-server.js"]
enabled = true
startup_timeout_sec = 15
tool_timeout_sec = 60

[mcp_servers.omx_trace]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/trace-server.js"]
enabled = false
startup_timeout_sec = 5
tool_timeout_sec = 30

[mcp_servers.omx_wiki]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/wiki-server.js"]
enabled = false
startup_timeout_sec = 5
tool_timeout_sec = 30
```

Validate:

```bash
python3 - <<'PY'
from pathlib import Path
import tomllib

p = Path.home() / ".codex" / "config.toml"
tomllib.loads(p.read_text())
print("OK: ~/.codex/config.toml parses")
PY
```

---

## 3. One-shot repo setup script

Run this from the repo root.

It creates:

```txt
.codex/config.toml
.codex/skills/blueprint-visual-parity/SKILL.md
.omx/wiki/blueprint-4-migration.md
tests/visual/routes.yaml
tests/visual/screenshot.css
tests/visual/auth.setup.ts
tests/visual/route-visual.spec.ts
playwright.config.ts, if missing
```

It also excludes machine-local `.codex/config.toml` from git using `.git/info/exclude`.

```bash
cat > /tmp/setup-omx-madmax-blueprint.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$PWD}"
cd "$ROOT"

echo "Repo: $ROOT"

if [[ ! -d .git ]]; then
  echo "ERROR: run from a git repo root"
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "WARNING: working tree is not clean."
  echo "Review before using omx --high --madmax."
  git status --short
fi

mkdir -p .codex/skills/blueprint-visual-parity/references
mkdir -p .omx/wiki
mkdir -p tests/visual
mkdir -p .codex

if [[ -f .codex/config.toml ]]; then
  cp .codex/config.toml ".codex/config.toml.bak.$(date +%Y%m%d-%H%M%S)"
fi

cat > .codex/config.toml <<'EOF'
# Project-scoped Codex config for UI migration.
# Machine-local because it uses local tool paths.
# Keep Codex Apps disabled globally. Use explicit project MCPs here.

[mcp_servers.chrome_devtools]
command = "npx"
args = ["-y", "chrome-devtools-mcp@latest"]
enabled = true
startup_timeout_sec = 20
tool_timeout_sec = 90

# Optional. Enable after .omx/wiki has useful project context.
[mcp_servers.omx_wiki]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/wiki-server.js"]
enabled = true
startup_timeout_sec = 10
tool_timeout_sec = 30

# Optional. Enable when debugging OMX team/HUD/autopilot runtime behavior.
[mcp_servers.omx_trace]
command = "/opt/homebrew/bin/node"
args = ["/opt/homebrew/lib/node_modules/oh-my-codex/dist/mcp/trace-server.js"]
enabled = false
startup_timeout_sec = 10
tool_timeout_sec = 30
EOF

cat > .codex/skills/blueprint-visual-parity/SKILL.md <<'EOF'
---
name: blueprint-visual-parity
description: Use for BlueprintJS major-version UI migrations, route-by-route visual parity, console-error checks, screenshot baselines, and CSS/component regression triage.
---

# Blueprint Visual Parity Skill

## Goal

Preserve visual and interaction parity while upgrading BlueprintJS.

Do not judge visual parity from code alone.

## Required evidence per touched route

For every touched route:

1. Load the route through the route manifest.
2. Confirm login/session works.
3. Check browser console errors.
4. Check failed network requests.
5. Capture or compare screenshot.
6. Fix only the owned component/style area.
7. Re-run the same route check.

## BlueprintJS 2.x to 4.x risk areas

- CSS namespace changes and stale Blueprint selectors.
- Icons and icon font/SVG behavior.
- Popover, Tooltip, Dialog, Overlay, Portal, z-index behavior.
- Form components, validation states, disabled states.
- Table/list row density, typography, line-height, and overflow.
- Custom app CSS overriding private Blueprint internals.
- Theme/color palette differences.

## Rules

- Prefer Blueprint 4 APIs and class names.
- Do not blindly re-create Blueprint 2 visuals if Blueprint 4 intentionally changed component styling.
- Do not add broad global CSS overrides without evidence.
- Do not let multiple workers edit the same broad style files at the same time.
- Use targeted CSS only for app layout or verified regressions.
- If visual changes are ambiguous, record them for human review.

## Stop condition

Stop only when:

- App builds.
- Route visual smoke tests pass.
- No untriaged console errors remain.
- Screenshot diffs are triaged as accepted Blueprint 4 changes or fixed regressions.
- Migration notes are updated.
EOF

cat > .codex/skills/blueprint-visual-parity/references/route-qa-template.md <<'EOF'
# Route QA Template

## Route

- name:
- path:
- owner:
- ready selector:
- auth required:

## Checks

- [ ] page loads
- [ ] no console errors
- [ ] no failed network requests
- [ ] screenshot captured
- [ ] screenshot diff reviewed
- [ ] keyboard/focus checked if relevant
- [ ] notes added for accepted visual changes

## Evidence

- screenshot:
- console:
- network:
- commit:
EOF

cat > .omx/wiki/blueprint-4-migration.md <<'EOF'
# BlueprintJS 4 Migration

## Goal

Upgrade BlueprintJS from 2.3.1 to 4 while preserving route-level visual parity except where Blueprint 4 intentionally changed component visuals.

## Local app

- Base URL: http://localhost:3000
- Login path: /login
- Username env: E2E_USERNAME
- Password env: E2E_PASSWORD
- After login wait for: [data-testid="app-shell"]

## Route manifest

Use:

- tests/visual/routes.yaml

## Validation commands

- npm run typecheck
- npm test
- npx playwright test tests/visual --headed
- npx playwright test tests/visual --ui

## Migration rules

- Prefer Blueprint 4 APIs and classes.
- Avoid broad global CSS overrides.
- Treat private Blueprint CSS selectors as unstable.
- Capture visual diffs before and after fixes.
- Record ambiguous visual changes for human review.

## Worker ownership

- css-namespace: Blueprint class names and selectors.
- icons: icon rendering and missing icon assets.
- overlays: popovers, tooltips, dialogs, z-index, portals.
- forms: inputs, selects, validation states.
- route-qa: route manifest and visual test evidence.
EOF

cat > tests/visual/routes.yaml <<'EOF'
base_url: "http://localhost:3000"

login:
  path: "/login"
  username_env: "E2E_USERNAME"
  password_env: "E2E_PASSWORD"
  username_selector: "input[name='email']"
  password_selector: "input[name='password']"
  submit_selector: "button[type='submit']"
  post_login_wait_for: "[data-testid='app-shell']"

routes:
  - name: "dashboard"
    path: "/dashboard"
    wait_for: "main"

  - name: "settings"
    path: "/settings"
    wait_for: "main"

  - name: "reports"
    path: "/reports"
    wait_for: "main"
EOF

cat > tests/visual/screenshot.css <<'EOF'
/* Hide dynamic UI that causes noisy screenshots. */
[data-testid="current-time"],
[data-testid="relative-time"],
[data-testid="random-id"],
.bp4-skeleton {
  visibility: hidden !important;
}

/* Stabilize animations. */
*,
*::before,
*::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
EOF

cat > tests/visual/auth.setup.ts <<'EOF'
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const routesPath = path.join(process.cwd(), "tests/visual/routes.yaml");
  const config = yaml.parse(fs.readFileSync(routesPath, "utf8"));

  const username = process.env[config.login.username_env];
  const password = process.env[config.login.password_env];

  if (!username || !password) {
    throw new Error(
      `Missing login env vars: ${config.login.username_env}, ${config.login.password_env}`,
    );
  }

  await page.goto(config.login.path);
  await page.fill(config.login.username_selector, username);
  await page.fill(config.login.password_selector, password);
  await page.click(config.login.submit_selector);
  await page.waitForSelector(config.login.post_login_wait_for);

  await page.context().storageState({ path: authFile });
  expect(fs.existsSync(authFile)).toBeTruthy();
});
EOF

cat > tests/visual/route-visual.spec.ts <<'EOF'
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

type RouteEntry = {
  name: string;
  path: string;
  wait_for: string;
};

const routesPath = path.join(process.cwd(), "tests/visual/routes.yaml");
const routeConfig = yaml.parse(fs.readFileSync(routesPath, "utf8")) as {
  routes: RouteEntry[];
};

for (const route of routeConfig.routes) {
  test(`visual route: ${route.name}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`);
    });

    await page.goto(route.path, { waitUntil: "networkidle" });
    await page.waitForSelector(route.wait_for);

    await page.addStyleTag({ path: "tests/visual/screenshot.css" });

    expect(consoleErrors, `console errors for ${route.name}`).toEqual([]);
    expect(failedRequests, `failed requests for ${route.name}`).toEqual([]);

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
    });
  });
}
EOF

if [[ ! -f playwright.config.ts ]]; then
  cat > playwright.config.ts <<'EOF'
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
EOF
else
  echo "playwright.config.ts already exists, leaving it unchanged"
fi

python3 - <<'PY'
from pathlib import Path
import tomllib

p = Path(".codex/config.toml")
tomllib.loads(p.read_text())
print("OK: .codex/config.toml parses")
PY

if [[ -d .git ]]; then
  touch .git/info/exclude
  if ! grep -qxF ".codex/config.toml" .git/info/exclude; then
    {
      echo ""
      echo "# Machine-local Codex project config"
      echo ".codex/config.toml"
    } >> .git/info/exclude
  fi
fi

echo
echo "Setup files created."
echo
echo "Install Playwright deps if needed:"
echo "  npm i -D @playwright/test yaml"
echo "  npx playwright install chromium"
echo
echo "Launch when ready:"
echo "  omx --high --madmax"
SH

chmod +x /tmp/setup-omx-madmax-blueprint.sh
/tmp/setup-omx-madmax-blueprint.sh
```

---

## 4. Install browser test dependencies

If the project does not already have Playwright:

```bash
npm i -D @playwright/test yaml
npx playwright install chromium
```

If this is a Rails app with Webpacker or older Node tooling, prefer the project package manager already in use:

```bash
pnpm add -D @playwright/test yaml
pnpm exec playwright install chromium
```

or:

```bash
yarn add -D @playwright/test yaml
yarn playwright install chromium
```

---

## 5. Fill in route and login details

Edit:

```bash
nvim tests/visual/routes.yaml
```

Set:

```yaml
login:
  path: "/your-login-path"
  username_selector: "..."
  password_selector: "..."
  submit_selector: "..."
  post_login_wait_for: "..."

routes:
  - name: "real-route-name"
    path: "/real/path"
    wait_for: "main"
```

Export local-only credentials:

```bash
export E2E_USERNAME="dev@example.com"
export E2E_PASSWORD="dev-password"
export E2E_BASE_URL="http://localhost:3000"
```

Do not store credentials in the repo.

---

## 6. Start CMUX workspace

Suggested CMUX layout:

```txt
workspace: blueprint-4-upgrade

pane 1: server
  npm run dev
  # or bin/dev
  # or rails s

pane 2: visual-tests
  npx playwright test tests/visual --ui

pane 3: leader
  omx --high --madmax

pane 4: browser
  http://localhost:3000
```

Use CMUX for workspace, browser, panes, and visibility.

Use OMX for team/workers/HUD.

Use Playwright for evidence.

---

## 7. Leader prompt to paste into `omx --high --madmax`

Paste this after the OMX/Codex session starts from the repo root:

```txt
$team

We are migrating this app from BlueprintJS 2.3.1 to BlueprintJS 4.

You are running under OMX with high reasoning and madmax permissions. Treat that as high responsibility, not permission to be reckless.

Outcome:
- App builds.
- Blueprint 4 migration is complete.
- Route-level smoke and visual checks pass.
- Console errors and failed network requests are triaged.
- Screenshot diffs are classified as accepted Blueprint 4 changes or regressions.
- No broad CSS override is added without browser or screenshot evidence.
- No two workers edit the same broad CSS/component ownership area at the same time.

Hard constraints:
- Keep work inside this git repo.
- Do not read or modify files outside the repo unless explicitly required by a project command.
- Do not use production credentials.
- Do not deploy.
- Do not change unrelated behavior.
- Do not use Codex Apps.
- Use project-local MCPs only.
- Use chrome_devtools MCP for rendered-page debugging and runtime evidence.
- Use Playwright CLI for repeatable route checks and screenshot diffs.
- Use the blueprint-visual-parity skill for route QA and parity rules.
- Use .omx/wiki/blueprint-4-migration.md as project context.
- Ask blocking questions through omx question only if running inside an attached OMX/tmux surface. Otherwise ask one concise plain-text question.

Phase 1: discovery
- Inventory Blueprint package versions and usage.
- Find Blueprint imports and old class names/selectors.
- Identify custom CSS/Sass overrides targeting Blueprint internals.
- Inspect package scripts and test commands.
- Inspect routes and create or update tests/visual/routes.yaml.
- Do not edit production code yet except test harness or setup files.

Phase 2: migration plan
- Split work by ownership area:
  1. css-namespace
  2. icons
  3. overlays
  4. forms
  5. tables-and-dense-ui
  6. route-qa
- Each worker must state owned files before editing.
- If ownership conflicts, stop and ask for coordination.

Phase 3: execution
- Upgrade packages and compile.
- Fix TypeScript/JS import/API breakage first.
- Then fix visual/style regressions by route group.
- Prefer Blueprint 4 APIs and class names.
- Avoid fighting Blueprint 4 with global CSS.

Phase 4: verification
- Run:
  npm run typecheck
  npm test
  npx playwright test tests/visual --headed
- Use browser evidence for any failed route:
  console errors
  network failures
  DOM/CSS inspection
  screenshot diffs
- Produce a final migration report:
  changed files
  accepted visual changes
  fixed regressions
  unresolved parity questions
  commands run
  remaining risks

Start by inspecting the repo and existing package scripts. Then propose the worker split and route manifest before launching team workers.
```

---

## 8. Worker prompts

Use these charters for OMX team workers.

### css-namespace worker

```txt
Role: css-namespace worker

Own:
- Blueprint class namespace changes.
- App CSS/Sass selectors that target old Blueprint internals.
- Minimal selector migrations needed for Blueprint 4.

Do:
- Search for bp2, bp3, pt-, blueprint class selectors, and Blueprint Sass variables.
- Fix selectors only in owned files.
- Avoid global overrides unless route evidence proves necessity.
- Run targeted build/test checks.

Return:
- files changed
- selectors changed
- route evidence needed
- risks
```

### icons worker

```txt
Role: icons worker

Own:
- Blueprint icon imports/usages.
- Missing icon rendering.
- Icon size/alignment regressions.

Do:
- Search for Icon, MaybeElement, IconName, iconName, icon props, and Blueprint icon CSS.
- Fix API/import changes.
- Verify visually on routes with icons.

Return:
- files changed
- broken icons fixed
- routes checked
- risks
```

### overlays worker

```txt
Role: overlays worker

Own:
- Popover, Tooltip, Dialog, Overlay, Portal, Menu, Select overlay behavior.
- z-index and portal rendering issues.

Do:
- Search for Popover, Tooltip, Dialog, Overlay, Portal, Menu, Select.
- Verify open/close behavior in browser.
- Check console errors.
- Avoid broad z-index hacks.

Return:
- files changed
- interactions checked
- console/network evidence
- risks
```

### forms worker

```txt
Role: forms worker

Own:
- InputGroup, FormGroup, Checkbox, Radio, Switch, Select, validation and disabled states.
- Form layout regressions.

Do:
- Search form components and Blueprint form APIs.
- Fix compile/API breakage.
- Verify routes with forms in browser and screenshots.
- Check keyboard/focus if form behavior changed.

Return:
- files changed
- routes checked
- visual diffs
- risks
```

### route-qa worker

```txt
Role: route QA worker

Own:
- tests/visual/routes.yaml
- Playwright route visual tests
- screenshot evidence
- console/network failure triage

Do:
- Build route manifest from app routes.
- Add only high-value authenticated routes first.
- Stabilize screenshots with screenshot.css.
- Run Playwright in headed mode.
- Record failing routes and evidence.

Return:
- route manifest coverage
- failing routes
- screenshot baseline status
- console/network errors
- recommended next route groups
```

---

## 9. Evidence template

Require every worker to end with:

```md
## Evidence

### Files changed
-

### Commands run
-

### Browser evidence
- route:
- console:
- network:
- screenshot:

### Risks
-

### Needs human decision
-
```

---

## 10. Validation commands

Run these before accepting the migration:

```bash
npm run typecheck
npm test
npx playwright test tests/visual --headed
```

Optional:

```bash
npx playwright show-report
```

Inside Codex/OMX:

```txt
/mcp
```

Expected MCPs:

```txt
omx_state
omx_memory
omx_code_intel
chrome_devtools
omx_wiki, if enabled
```

---

## 11. Rollback

Rollback local edits:

```bash
git status --short
git restore .
git clean -fd
```

If using worktrees:

```bash
git worktree list
git worktree remove ../gala-blueprint4
```

Keep `.omx/` until final notes and logs have been summarized.

---

## 12. Default operating rule

```txt
Use madmax for speed, not sloppiness.

Agents provide breadth.
Playwright provides truth.
Chrome DevTools provides diagnosis.
Humans decide ambiguous visual intent.
```

