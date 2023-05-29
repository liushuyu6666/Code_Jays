terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "ca-central-1"
}

resource "aws_s3_bucket" "jays" {
  bucket = "jays"

  tags = {
    Name        = "Jays"
    Environment = "Dev"
  }
}
