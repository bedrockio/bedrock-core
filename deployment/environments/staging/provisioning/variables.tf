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

variable "multi_region" {
  default = "US"
}

variable "bucket_prefix" {
  default = "bedrock_staging"
}

variable "cluster_name" {
  default = "cluster-1"
}

variable "node_pool_count" {
  default = 3
}

variable "min_node_count" {
  default = 3
}

variable "max_node_count" {
  default = 6
}

variable "preemptible" {
  default = false
}

variable "machine_type" {
  default = "n2-standard-2"
}
