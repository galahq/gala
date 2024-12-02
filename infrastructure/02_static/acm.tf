# create the certificate to be used for HTTPS on the load balancer
resource "aws_acm_certificate" "cert" {
  count                     = var.certificate_state == "NONE" ? 0 : 1
  domain_name               = var.certificate_domain
  subject_alternative_names = var.certificate_sans
  validation_method         = "DNS"

  tags = {
    Name = "gala-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}

