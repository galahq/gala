variable "profile" {}
variable "aws_region" {}
variable "certificate_domain" {}

variable "env_name" {}
variable "availability_zones"{
  type = list(string)
}
variable "app_vpc_cidr_block"{
}
variable "app_public_subnets"{
  type = list(string)
}
variable "app_private_subnets"{
  type = list(string)
  default = []
}
variable "ingress_sources" {
  type = list(string)
}

# variable for load balancer ingress sources with labels using IP address as the key and description as the value
variable "lb_ingress_sources_with_labels" {
  type = map(string)
}

variable "secret_name" {}

variable "ecr_repository_name_backend" {}
variable "ecr_repository_name_frontend" {}

variable "ecs_cluster_name" {}

variable "ec2_instance_type" {}

variable "instance_key_pair_name" {}
variable "instance_subnet" {}
variable "ecs_ami_name" {}

variable "backend_tag" {}
variable "frontend_tag" {}

