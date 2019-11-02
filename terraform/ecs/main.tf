provider "aws" {
  version = "~> 2.0"
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "recipe-runner-state"
    key    = "ecs"
    region = "eu-west-2"
  }
}

locals {
  project_name = "recipe-runner"
}

module "acm" {
  source = "../acm"
}

module "vpc" {
  source = "../vpc"
}

module "route53" {
  source = "../route53"
}

resource "aws_security_group" "security_group_allow_http_and_https" {
  name = "allow_http_and_https"
  description = "Allow HTTP and HTTPS traffic"
  vpc_id = "${module.vpc.vpc_id}"

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "lb" {
  name = "${local.project_name}"
  load_balancer_type = "application"
  security_groups = ["${aws_security_group.security_group_allow_http_and_https.id}"]
  subnets = ["${module.vpc.subnet_ids}"]
  ip_address_type = "ipv4"
}

resource "aws_lb_target_group" "lb_target_group" {
  name = "recipe-runner-target-group"
  vpc_id = "${module.vpc.vpc_id}"
  protocol = "HTTP"
  port = 80
  target_type = "ip"
  deregistration_delay = 60

  health_check {
    path = "/health"
  }

  depends_on = ["aws_lb.lb"]
}

resource "aws_lb_listener" "lb_listener_forward_http" {
  load_balancer_arn = "${aws_lb.lb.arn}"
  protocol = "HTTP"
  port = "80"

  default_action {
    type = "forward"
    target_group_arn = "${aws_lb_target_group.lb_target_group.arn}"
  }
}

resource "aws_lb_listener" "lb_listener_forward_https" {
  load_balancer_arn = "${aws_lb.lb.arn}"
  protocol = "HTTPS"
  port = "443"
  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn = "${module.acm.ecs_cert_arn}"

  default_action {
    type = "forward"
    target_group_arn = "${aws_lb_target_group.lb_target_group.arn}"
  }
}

resource "aws_ecs_cluster" "cluster" {
  name = "${local.project_name}"
}

data "aws_kms_secrets" "kms_secrets_mongo" {
  secret {
    name = "username"
    payload = "AQICAHiJr8wDC5CaQ752WtUL5ltmPlZuaWP8UbRdaXBYMnc4uwGtxblYjXjSjo8qM+WCPQajAAAAYjBgBgkqhkiG9w0BBwagUzBRAgEAMEwGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM0G7dckfuLT3S/3d1AgEQgB8CHrWCmrYGGAc1UlHZ2WmOjDCXVvQ37cI5+ncb3Pr4"
  }

  secret {
    name = "password"
    payload = "AQICAHiJr8wDC5CaQ752WtUL5ltmPlZuaWP8UbRdaXBYMnc4uwH/TR4VBp9+m4n6BdXaMF3/AAAAbjBsBgkqhkiG9w0BBwagXzBdAgEAMFgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM24Ei92f1IikPXz9lAgEQgCthM7QEUVS9A4BDKE5bj7lpmHI246EtaCXBlwJajEMdBvSbG/fZ86PxG+cG"
  }
}

data "template_file" "task_definition_template" {
  template = "${file("task-definition.json.tpl")}"
  vars = {
    name = "${local.project_name}"
    region = "eu-west-2"
    image = "804715735558.dkr.ecr.eu-west-2.amazonaws.com/recipe-runner"
    port = "80"
    host_port = "80"
    database = "recipe-runner"
    database_username = "${data.aws_kms_secrets.kms_secrets_mongo.plaintext["username"]}"
    database_password = "${data.aws_kms_secrets.kms_secrets_mongo.plaintext["password"]}"
  }
}

resource "aws_ecs_task_definition" "task_definition" {
  family = "${local.project_name}"
  container_definitions = "${data.template_file.task_definition_template.rendered}"
  network_mode = "awsvpc"
  cpu = "256"
  memory = "512"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn = "arn:aws:iam::804715735558:role/ecsTaskExecutionRole"
  task_role_arn = "arn:aws:iam::804715735558:role/AmazonECSTaskS3BucketRole"
}

resource "aws_ecs_service" "service" {
  name = "${local.project_name}"
  cluster = "${aws_ecs_cluster.cluster.id}"
  task_definition = "${aws_ecs_task_definition.task_definition.arn}"
  desired_count = 1
  launch_type = "FARGATE"

  network_configuration {
    subnets = ["${module.vpc.subnet_ids}"]
    assign_public_ip = true
    security_groups = ["${aws_security_group.security_group_allow_http_and_https.id}"]
  }

  load_balancer {
    target_group_arn = "${aws_lb_target_group.lb_target_group.arn}"
    container_name = "${local.project_name}"
    container_port = 80
  }
}

resource "aws_route53_record" "route53_record_api_hellodiners_com" {
  zone_id = "${module.route53.hosted_zone_id}"
  name = "api.hellodiners.com"
  type = "A"

  alias {
    name = "${aws_lb.lb.dns_name}"
    zone_id = "${aws_lb.lb.zone_id}"
    evaluate_target_health = false
  }
}
