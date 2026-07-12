import type { StageContext } from "../config";
import { referenceDevPlatform } from "../dev-reference";
import { createDerivedRuntime } from "../runtime";

export function runLocal(context: StageContext) {
  if (context.target.kind !== "local") {
    throw new Error("runLocal requires stage local-NAME");
  }
  return createDerivedRuntime(context, referenceDevPlatform());
}
