resource "aws_cloudwatch_log_group" "backend" {
  name              = "${var.env_name}-backend"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "backend" {
  family = "${var.env_name}-backend"

  container_definitions = <<DEFINITION
[
  {
    "command": ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"],
    "portMappings": [
      {
        "containerPort": 3000
      }
    ],
    "environment": [
      {
        "name": "RAILS_LOG_TO_STDOUT",
        "value": "true"
      },
      {
        "name": "RAILS_ENV",
        "value": "production"
      },
      {
        "name": "REDIS_CONNECTION",
        "value": "redis://${aws_elasticache_cluster.default.cache_nodes.0.address}:6379"
      },
      {
        "name": "DATABASE_URL",
        "value": "${jsondecode(data.aws_secretsmanager_secret_version.secrets.secret_string)["database_connection"]}"
      },
      {
        "name": "SECRET_KEY_BASE",
        "value": "${jsondecode(data.aws_secretsmanager_secret_version.secrets.secret_string)["secret_key_base"]}"
      },
      {
        "name": "RAILS_LOG_TO_STDOUT",
        "value": "1"
      },
      {
        "name": "RAILS_SERVE_STATIC_FILES",
        "value": "1"
      },
      {
        "name": "BASE_URL",
        "value": "${jsondecode(data.aws_secretsmanager_secret_version.secrets.secret_string)["base_url"]}"
      }
    ],
    "essential": true,
    "image": "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.ecr_repository_name_backend}:${var.backend_tag}",
    "memoryReservation": 250,
    "name": "${var.env_name}-backend",
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "${data.aws_region.current.name}",
        "awslogs-group": "${var.env_name}-backend",
        "awslogs-stream-prefix": "backend"
      }
    },
    "network_mode": "host"
  }
]
DEFINITION
}

data "aws_ecs_task_definition" "backend" {
  task_definition = "${var.env_name}-backend"
  depends_on = [aws_ecs_task_definition.backend]
}

resource "aws_lb_target_group" "backend" {
  name     = "${var.env_name}-backend"
  port     = "3000"
  protocol = "HTTP"
  vpc_id   = "${aws_vpc.app.id}"
  deregistration_delay = "15"

  depends_on = [aws_lb.lb]

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "404,301,302,200"
    timeout             = "3"
    path                = "/api/healthcheck"
    unhealthy_threshold = "2"
  }

}

resource "aws_ecs_service" "backend" {
  name          = "${var.env_name}-backend"
  cluster       = aws_ecs_cluster.default.id
  desired_count = 1

  deployment_maximum_percent = 200
  deployment_minimum_healthy_percent = 100

  task_definition = "${aws_ecs_task_definition.backend.family}:${max("${aws_ecs_task_definition.backend.revision}", "${data.aws_ecs_task_definition.backend.revision}")}"

  load_balancer {
    target_group_arn = "${aws_lb_target_group.backend.arn}"
    container_name   = "${var.env_name}-backend"
    container_port   = "3000"
  }
}

resource "aws_lb_listener_rule" "backend" {
  count        = 1
  listener_arn = "${aws_lb_listener.https[0].arn}"
  priority     = 99

  action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.backend.arn}"
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
