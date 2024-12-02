# outputs.tf

output "alb_hostname" {
  value = aws_lb.lb.dns_name
}

