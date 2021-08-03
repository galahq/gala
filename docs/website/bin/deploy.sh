#!/bin/bash
yarn build
aws s3 sync --acl public-read --sse --delete ./build/ \
  s3://docs.learngala.com
aws configure set preview.cloudfront true
aws cloudfront create-invalidation --distribution-id E2EDUP84FXRXCP --paths '/*'
