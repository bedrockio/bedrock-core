variable "project" {
  default = "bedrock-foundation-production"
}

variable "environment" {
  default = "production"
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
  default = "bedrock-production"
}

variable "cluster_name" {
  default = "cluster-1"
}

variable "cluster_description" {
  default = "GKE Cluster"
}

variable "node_pool_count" {
  default = 1
}

variable "min_node_count" {
  default = 1
}

variable "max_node_count" {
  default = 3
}

variable "preemptible" {
  default = false
}

variable "machine_type" {
  default = "n2-standard-2"
}

variable "buckets" {
  type = set(string)

  default = [
    "uploads",
    "uploads-backup",
    "mongodb-backups",
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
