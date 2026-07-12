import { createAssets } from "../assets";
import type { StageContext } from "../config";
import { createPlatform } from "../platform";
import { createDurableRuntime } from "../runtime";

export function runDev(context: StageContext) {
  if (context.target.kind !== "dev") throw new Error("runDev requires stage dev");
  const assets = createAssets(context);
  const platform = createPlatform(context);
  return createDurableRuntime(context, platform, assets);
}
