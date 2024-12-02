terraform {
 backend "s3" {
   encrypt = true
   bucket = "gala-terraform-state"
   key = "gala/terraform-cluster.tfstate"
   dynamodb_table = "gala_terraform_lock"
   region = "us-east-1"
 }
}
