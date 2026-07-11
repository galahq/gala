/// <reference path="./.sst/platform/config.d.ts" />

import { GALA, classifyStage, createStageContext } from "./config";
import { runStage } from "./stages";

export default $config({
  app(input) {
    const target = classifyStage(input?.stage || "");

    return {
      name: GALA.appName,
      home: "aws",
      // Preserve the deployed phase-one policy until the clean structural
      // diff is accepted. Durable retain-all/protect is activated separately.
      removal: target.kind === "production" ? "retain" : "remove",
      providers: {
        aws: { region: GALA.awsRegion },
        cloudflare: "6.13.0",
      },
    };
  },
  async run() {
    return runStage(createStageContext($app.stage));
  },
});
