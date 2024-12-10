variable "project" {
  default = "bedrock-foundation-staging"
}

variable "environment" {
  default = "staging"
}

variable "region" {
  default = "us-east1"
}

variable "zone" {
  default = "a"
}

variable "multi_region" {
  default = "US"
}

variable "bucket_prefix" {
  default = "bedrock-foundation-staging"
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

variable "disk_size" {
  default = 100
}

variable "disk_type" {
  default = "pd-standard"
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
