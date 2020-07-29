variable "cluster_name" {
  default = "cluster-1"
}

variable "description" {
  default = "Terraformed GKE Cluster"
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
  default = false
}

variable "machine_type" {
  default = "n1-standard-1"
}

variable "bucket_prefix" {
  default = "bedrock_staging"
}

variable "buckets" {
  type = set(string)

  default = [
    "uploads",
    "uploads-backup",
    "mongodb-backups"
  ]
}

variable "master_authorizaed_networks_cidr_blocks" {
  type = list(map(string))
  default = [
    {
      display_name = "All",
      cidr_block = "0.0.0.0/0"
    }
  ]
}

variable "location" {
  default = "us-east1-c"
}