import { createAssets } from "../assets";
import type { StageContext } from "../config";
import { createPlatform } from "../platform";
import { createDurableRuntime } from "../runtime";

export function runProduction(context: StageContext) {
  if (context.target.kind !== "production") {
    throw new Error("runProduction requires stage production");
  }
  const assets = createAssets(context);
  const platform = createPlatform(context);
  return createDurableRuntime(context, platform, assets);
}
