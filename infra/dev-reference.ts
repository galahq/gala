import constants from "./platform.constants.json";

const DEV_SECRET_NAMES = [
  "DATABASE_URL",
  "REDIS_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_MIGRATION_CLIENT_ID",
  "GOOGLE_MIGRATION_CLIENT_SECRET",
  "RAILS_MASTER_KEY",
  "SECRET_KEY_BASE",
  "LTI_KEY",
  "LTI_SECRET",
  "MAPBOX_ACCESS_TOKEN",
  "MapboxAccessToken",
  "SES_SMTP_PASSWORD",
  "SES_SMTP_USERNAME",
  "POSTHOG_API_KEY",
  "POSTHOG_PROJECT_ID",
] as const;

export function referenceDevPlatform() {
  const cluster = sst.aws.Cluster.get("GalaDevClusterReference", {
    id: constants.devClusterId,
    vpc: {
      id: constants.devVpcId,
      securityGroups: constants.devSecurityGroupIds,
      containerSubnets: constants.devContainerSubnetIds,
      loadBalancerSubnets: constants.devLoadBalancerSubnetIds,
      cloudmapNamespaceId: constants.devCloudMapNamespaceId,
      cloudmapNamespaceName: constants.devCloudMapNamespaceName,
    },
  });
  const router = sst.aws.Router.get(
    "GalaDevRouterReference",
    constants.sharedRouterDistributionId,
  );
  const staticAssetsDistribution = aws.cloudfront.Distribution.get(
    "GalaDevStaticAssetsDistributionReference",
    constants.devStaticAssetsDistributionId,
  );
  const ssm = Object.fromEntries(
    DEV_SECRET_NAMES.map((name) => [
      name,
      `arn:aws:ssm:${constants.awsRegion}:${constants.awsAccountId}:parameter/gala/dev/${name}`,
    ]),
  );

  return { cluster, router, staticAssetsDistribution, ssm };
}

export type DevPlatformReference = ReturnType<typeof referenceDevPlatform>;
