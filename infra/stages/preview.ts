import type { StageContext } from "../config";
import { referenceDevPlatform } from "../dev-reference";
import { createDerivedRuntime } from "../runtime";

export function runPreview(context: StageContext) {
  if (context.target.kind !== "preview") {
    throw new Error("runPreview requires stage pr-NUMBER");
  }
  return createDerivedRuntime(context, referenceDevPlatform());
}
