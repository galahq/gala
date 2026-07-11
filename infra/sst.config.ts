/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  async app(input) {
    const { appSettings } = await import("./config");
    return appSettings(input?.stage || "");
  },
  async run() {
    const { createStageContext } = await import("./config");
    const { runStage } = await import("./stages");
    return runStage(createStageContext($app.stage));
  },
});
