[
  {
    "name": "${name}",
    "image": "${image}",
    "portMappings": [
      {
        "hostPort": ${host_port},
        "protocol": "tcp",
        "containerPort": ${port}
      }
    ],
    "environment": [
      {
        "name": "DB_DATABASE",
        "value": "${database}"
      },
      {
        "name": "DB_PASSWORD",
        "value": "${database_password}"
      },
      {
        "name": "DB_USERNAME",
        "value": "${database_username}"
      },
      {
        "name": "PORT",
        "value": "${port}"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "secretOptions": null,
      "options": {
        "awslogs-group": "/ecs/${name}",
        "awslogs-region": "${region}",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }
]
