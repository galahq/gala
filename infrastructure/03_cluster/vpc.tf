# VPC
# public subnets only
# no NAT gateway

# create VPC
resource "aws_vpc" "app" {
  cidr_block = var.app_vpc_cidr_block
  enable_dns_hostnames = true
  tags = {
    Name = "${var.env_name}-app"
  }
}

# create internet gateway, so public subnets can reach the internet
resource "aws_internet_gateway" "app" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.env_name}-app"
  }
}

# create public subnets
# iterate over the array of public subnets (e.g. 172.28.1.0, .2.0, etc) and over the AZ list (a,b,c)
# use the currently chosen region (us-east-1) to get the az name (i.e. us-east-1a)
resource "aws_subnet" "app_public" {
  count      = length(var.app_public_subnets)
  vpc_id     = aws_vpc.app.id
  cidr_block = element(var.app_public_subnets,count.index)
  availability_zone = "${data.aws_region.current.name}${element(var.availability_zones,count.index % length(var.app_public_subnets))}"
  tags = {
    public_or_private = "public"
    Name = "${var.env_name}-app-public-az${element(var.availability_zones,count.index % length(var.app_public_subnets))}"
  }
}

# create public route table
# create route to internet using the internet gateway
# associate the route table to the vpc
resource "aws_route_table" "app_public" {
  vpc_id = aws_vpc.app.id

  tags = {
    Name = "${var.env_name}-app-public"
  }
}
resource "aws_route" "app_public_to_internet" {
  route_table_id = aws_route_table.app_public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.app.id
}
resource "aws_route_table_association" "app_public" {
  count          = length(var.app_public_subnets)
  subnet_id      = element(aws_subnet.app_public.*.id,count.index)
  route_table_id = aws_route_table.app_public.id
}
