# create an ECS cluster
resource "aws_ecs_cluster" "default" {
  name = var.ecs_cluster_name
}

# find the latest and greatest AMI for use in this region
# most likely ECS optimized Amazon Linux 2
data "aws_ami" "ecs_optimized" {
  owners = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
  most_recent = true
}

# create a security group called egress_anywhere that allows outbound traffic, any protocol, any destination
resource "aws_security_group" "egress_anywhere" {
  name        = "egress_anywhere"
  description = "Allow outbound traffic to any IP, any protocol"
  vpc_id      = aws_vpc.app.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# create a security group called ssh_ingress which identifies hosts that can SSH into instances
resource "aws_security_group" "ssh_ingress" {
  name        = "ssh_ingress"
  description = "Allow inbound SSH"
  vpc_id      = aws_vpc.app.id
}

# create ssh_ingress rules which allow SSH in from sources specified in the variables file
resource "aws_security_group_rule" "ssh_ingress" {
  type            = "ingress"
  from_port       = 22
  to_port         = 22
  protocol        = "6"
  cidr_blocks     = var.ingress_sources

  security_group_id = aws_security_group.ssh_ingress.id
}

# create a security group to allow open internal communication within the VPC
resource "aws_security_group" "open_internal_communication" {
  name        = "open_internal_communication"
  description = "Allow all traffic within VPC"
  vpc_id      = aws_vpc.app.id
}

# create a rule that allows TCP communication on all ports internally
# this is typically required for load balancer health checks
resource "aws_security_group_rule" "open_internal_communication_ingress" {
  type            = "ingress"
  from_port       = 0
  to_port         = 65535
  protocol        = "6"
  cidr_blocks     = [var.app_vpc_cidr_block]

  security_group_id = aws_security_group.open_internal_communication.id
}

# the next 4 declarations create the instance profile for EC2 instances
# if an instance needs to access services at AWS (e.g. SQS) then set appropriate permissions within the instance_policy 
resource "aws_iam_role" "app_instance_role" {
  name_prefix = "ec2-container-instance-role-"
  assume_role_policy = "${data.aws_iam_policy_document.instance-assume-role-policy.json}"
}

resource "aws_iam_role_policy" "instance_policy" {
  name_prefix = "app-instance-policy"
  role = aws_iam_role.app_instance_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sts:AssumeRole"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs-service-role-attachment" {
    role       = aws_iam_role.app_instance_role.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_host_instance_profile" {
  name_prefix = "app-instance-profile-"
  role = aws_iam_role.app_instance_role.name
}
