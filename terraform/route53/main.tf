provider "aws" {
  version = "~> 2.0"
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "recipe-runner-state"
    key    = "route53"
    region = "eu-west-2"
  }
}

locals {
  hosted_zone_id = "Z259F9M6QQGTM5"
}

output "hosted_zone_id" {
  value = "${local.hosted_zone_id}"
}
