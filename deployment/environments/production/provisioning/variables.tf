variable "cluster_name" {
  default = "cluster-1"
}

variable "description" {
  default = "Production GKE Cluster"
}

variable "project" {
  default = "bedrock-foundation"
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

variable "node_pool_count" {
  default = 3
}

variable "preemptible" {
  default = false
}

variable "machine_type" {
  default = "n1-standard-1"
}

variable "bucket_prefix" {
  default = "bedrock_production"
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