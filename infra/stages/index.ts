import type { StageContext } from "../config";
import { runDev } from "./dev";
import { runStageWith } from "./dispatch";
import { runLocal } from "./local";
import { runPreview } from "./preview";
import { runProduction } from "./production";

export function runStage(context: StageContext) {
  return runStageWith(context, {
    dev: runDev,
    production: runProduction,
    preview: runPreview,
    local: runLocal,
  });
}
