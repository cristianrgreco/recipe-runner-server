provider "aws" {
  version = "~> 2.0"
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "recipe-runner-state"
    key    = "acm"
    region = "eu-west-2"
  }
}

data "aws_kms_secrets" "kms_secrets_mongo" {
  secret {
    name = "ecs-cert-arn"
    payload = "AQICAHiJr8wDC5CaQ752WtUL5ltmPlZuaWP8UbRdaXBYMnc4uwFb1rk0+x0EBV18VOTbXhPFAAAAtTCBsgYJKoZIhvcNAQcGoIGkMIGhAgEAMIGbBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDOm4cich1ywd26ho6gIBEIBuIWhri1oeb6aruiz55e/P6b0xyt1sWJKkQtyOxe+9vY8TLHYaOkP1TSBzh/hfnUzxlcznbZ3lykHWI3xjevs+PnydgokvKTfrU8nxGQ9RJNfiZqUC3eX3Jz7oPcvSwbyz4BO1tY9MwYV/jubMfGg="
  }

  secret {
    name = "cloudfront-cert-arn"
    payload = "AQICAHiJr8wDC5CaQ752WtUL5ltmPlZuaWP8UbRdaXBYMnc4uwH7B0dT0raYwOdJO1Yj5QrIAAAAtTCBsgYJKoZIhvcNAQcGoIGkMIGhAgEAMIGbBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDDh2bb7H7k5qCukv3gIBEIBu7As1IesXdolSL3ZsvX7o/+y7G6Thz4y5v/LgIszI40xGRwGUmEPNOCfIoiB8Ummb5oSVGTiNTRamA6ZdSzLhn9IUJXOj6WNuCrqH0Q/BsSqvU0xdb1PiYn0M05zFBiDcdenILsx0fHYCopkKH9Y="
  }
}

output "ecs_cert_arn" {
  sensitive = true
  value = "${data.aws_kms_secrets.kms_secrets_mongo.plaintext["ecs-cert-arn"]}"
}

output "cloudfront_cert_arn" {
  sensitive = true
  value = "${data.aws_kms_secrets.kms_secrets_mongo.plaintext["cloudfront-cert-arn"]}"
}
