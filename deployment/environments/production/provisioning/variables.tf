## These variables are set in the ./deployment/scripts/provision script with env values
## from ./deployment/environments/<environment>/env.conf

variable "project" {
  default = "bedrock-foundation"
}

variable "environment" {
  default = "staging"
}

variable "region" {
  default = "us-east1"
}

variable "zone" {
  default = "c"
}

variable "bucket_prefix" {
  default = "bedrock_production"
}

variable "cluster_name" {
  default = "cluster-1"
}
