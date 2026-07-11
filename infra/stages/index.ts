import type { StageContext } from "../config";
import { runDev } from "./dev";
import { runProduction } from "./production";

export function runStage(context: StageContext) {
  if (context.target.kind === "dev") return runDev(context);
  if (context.target.kind === "production") return runProduction(context);
  throw new Error(
    `stage ${context.target.stage} is classified but not provisioned in phase one`,
  );
}

