variable "secret_name" {}
variable "profile" {}

# NONE means don't create a certificate
# CREATE means create the certificate but don't attach to load balancer (because it will need to be validated)
# USE means it's validated so use it
# doing this really speeds up initial deployment; otherwise the ALB hangs for 5 minutes
# because the certificate isn't ready then a terraform error happens
variable "certificate_state" {}
variable "certificate_domain" {}
variable "certificate_sans" {
  type = list(string)
}

