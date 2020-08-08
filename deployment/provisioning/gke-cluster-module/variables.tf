variable "global" {
  type = map(string)
  description = "Global variables used in all modules"
}

variable "description" {
  default = "GKE Cluster"
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

variable "master_authorizaed_networks_cidr_blocks" {
  type = list(map(string))
  default = [
    {
      display_name = "All",
      cidr_block = "0.0.0.0/0"
    }
  ]
}