resource "aws_secretsmanager_secret" "default" {
  name = var.secret_name
}

variable "secrets" {
  # if you change these then you may need to remove them from state and reimport
  # terraform state rm aws_secretsmanager_secret.default
  # terraform state rm aws_secretsmanager_secret_version.default
  # aws secretsmanager list-secret-version-ids --secret-id IdOfThisSecret
  # terraform import aws_secretsmanager_secret.default 'arn:aws:secretsmanager:region:etc'
  # terraform import aws_secretsmanager_secret_version.default 'arn:aws:secretsmanager:region:etc|uuid-of-secret-version'

  default = {
    # production
    database_connection             = "CHANGEME"
    secret_key_base                 = "CHANGEME"
    gala_ssh_pem                    = "CHANGEME"
    base_url                        = "CHANGEME"
  }

  type = map(string)
}

resource "aws_secretsmanager_secret_version" "default" {
  secret_id     = aws_secretsmanager_secret.default.id
  secret_string = jsonencode(var.secrets)

  lifecycle {
      ignore_changes = ["secret_string"]
  }
}
