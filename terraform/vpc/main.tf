provider "aws" {
  version = "~> 2.0"
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "recipe-runner-state"
    key    = "vpc"
    region = "eu-west-2"
  }
}

locals {
  vpc_id = "vpc-60a78709"
}

data "aws_subnet_ids" "subnet_ids" {
  vpc_id = "${local.vpc_id}"
}

output "vpc_id" {
  value = "${local.vpc_id}"
}

output "subnet_ids" {
  value = "${data.aws_subnet_ids.subnet_ids.ids}"
}
