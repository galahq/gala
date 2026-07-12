import assert from "node:assert/strict";
import test from "node:test";

import { createStageContext } from "../config.ts";
import { runStageWith } from "../stages/dispatch.ts";

const runners = () => ({
  dev: () => "dev",
  production: () => "production",
  preview: () => "preview",
  local: () => "local",
});

test("dispatches every supported stage kind exactly once", () => {
  assert.equal(runStageWith(createStageContext("dev"), runners()), "dev");
  assert.equal(
    runStageWith(createStageContext("production"), runners()),
    "production",
  );
  assert.equal(runStageWith(createStageContext("pr-790"), runners()), "preview");
  assert.equal(runStageWith(createStageContext("local-nathan"), runners()), "local");
});

test("never falls back to a different runner", () => {
  const calls: string[] = [];
  const traced = {
    dev: () => calls.push("dev"),
    production: () => calls.push("production"),
    preview: () => calls.push("preview"),
    local: () => calls.push("local"),
  };

  runStageWith(createStageContext("pr-790"), traced);
  assert.deepEqual(calls, ["preview"]);
});
