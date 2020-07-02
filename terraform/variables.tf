variable "name" {
  default = "terraform-cluster"
}

variable "description" {
  default = "Terraform GKE Cluster"
}

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

variable "initial_node_count" {
  default = 1
}

variable "default_pool_node_count" {
  default = 3
}

variable "default_pool_min_nodes" {
  default = 1
}

variable "default_pool_max_nodes" {
  default = 3
}

variable "preemptible" {
  default = true
}

variable "machine_type" {
  default = "n1-standard-1"
}

variable "buckets" {
  type = set(string)

  default = [
    "uploads",
    "uploads-backup",
    "mongodb-backups"
  ]
}

variable "location" {
  default = "us-east1-c"
}