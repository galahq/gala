/// <reference path="./infra/.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    const customDomainEnabled =
      process.env.GALA_ENABLE_CUSTOM_DOMAIN !== "false";

    return {
      name: "gala",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
      providers: {
        aws: {
          region: "us-west-2",
        },
        ...(customDomainEnabled ? { cloudflare: "6.13.0" } : {}),
      },
    };
  },
  async run() {
    const infra = await import("./infra/sst.config");

    return infra.default.run();
  },
});
