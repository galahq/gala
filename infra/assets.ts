import { GALA, type StageContext } from "./config";

export function createAssets(context: StageContext) {
  const { target } = context;
  const stage = target.stage;
  const isProduction = target.kind === "production";
  const {
    appName,
    mediaBucketName,
    staticAssetsBucketName,
    immutableStaticCacheControl,
  } = GALA;
  // Matches current ownership during phase one. The later reconciliation
  // makes production the sole owner and converts dev to a plain lookup.
  const importExistingStaticAssetsBucket = !isProduction;

  // Reference the retained ActiveStorage bucket instead of recreating it.
  aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName);

  const staticAssetsBucket = new sst.aws.Bucket("GalaStaticAssets", {
    policy: [
      {
        principals: "*",
        actions: ["s3:GetObject"],
        paths: ["releases/*", "manifests/*", "assets/*"],
      },
    ],
    transform: {
      bucket: (args: any, opts: any) => {
        args.bucket = staticAssetsBucketName;
        args.forceDestroy = undefined;

        if (importExistingStaticAssetsBucket) {
          opts.import = staticAssetsBucketName;
        }
      },
      publicAccessBlock: (args: any) => {
        args.blockPublicPolicy = false;
        args.restrictPublicBuckets = false;
      },
    },
  });
  const staticAssetResponseHeaders = new aws.cloudfront.ResponseHeadersPolicy(
    "GalaStaticAssetResponseHeaders",
    {
      name: `${appName}-${stage}-static-asset-cache`,
      comment: "Immutable browser cache headers for fingerprinted assets",
      customHeadersConfig: {
        items: [
          {
            header: "Cache-Control",
            override: true,
            value: immutableStaticCacheControl,
          },
          {
            header: "Vary",
            override: true,
            value: "Accept-Encoding",
          },
        ],
      },
    },
  );

  const staticAssetsDistribution = new aws.cloudfront.Distribution(
    "GalaStaticAssetsDistribution",
    {
      enabled: true,
      comment: `${appName}-${stage} static assets`,
      defaultRootObject: "",
      origins: [
        {
          domainName: staticAssetsBucket.domain,
          originId: "gala-static-assets-origin",
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "https-only",
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      defaultCacheBehavior: {
        targetOriginId: "gala-static-assets-origin",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        compress: true,
        minTtl: 60,
        defaultTtl: 31536000,
        maxTtl: 31536000,
        responseHeadersPolicyId: staticAssetResponseHeaders.id,
        forwardedValues: {
          queryString: false,
          cookies: {
            forward: "none",
          },
        },
      },
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
      priceClass: "PriceClass_100",
      retainOnDelete: isProduction,
    },
  );
  return {
    staticAssetsBucket,
    staticAssetsDistribution,
    staticAssetResponseHeaders,
  };
}

export type AssetResources = ReturnType<typeof createAssets>;

