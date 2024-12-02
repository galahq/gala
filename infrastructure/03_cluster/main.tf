provider "aws" {
  region  = var.aws_region
  profile = var.profile
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
