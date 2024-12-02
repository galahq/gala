provider "aws" {
  region                        =       "us-east-1"
  profile                       =       var.profile
}

# create an s3 bucket for terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.tfstate_bucket_name

  # versioning {
  #   enabled = true
  # }

  lifecycle {
    prevent_destroy = true
  }
}

# set a bucket policy that requires encryption
resource "aws_s3_bucket_policy" "terraform_state" {
  depends_on = [aws_s3_bucket.terraform_state]
  bucket = aws_s3_bucket.terraform_state.id
  policy =<<EOF
{
  "Version": "2012-10-17",
  "Id": "RequireEncryption",
   "Statement": [
    {
      "Sid": "RequireEncryptedTransport",
      "Effect": "Deny",
      "Action": ["s3:*"],
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.terraform_state.bucket}/*"],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      },
      "Principal": "*"
    },
    {
      "Sid": "RequireEncryptedStorage",
      "Effect": "Deny",
      "Action": ["s3:PutObject"],
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.terraform_state.bucket}/*"],
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      },
      "Principal": "*"
    }
  ]
}
EOF
}

# block public access to the s3 bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  depends_on = [aws_s3_bucket_policy.terraform_state]
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls   = true
  block_public_policy = true
}

# create a dynamodb table for terraform state locking
resource "aws_dynamodb_table" "terraform_state_lock" {
  name           = var.tfstate_lock_dynamodb_name
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
