## Set by infrastructure/scripts/provision
# project      = "bedrock-foundation"
# cluster_name = "cluster-1"
# environment  = "staging"
description  = "Staging GKE cluster"
preemptible  = true
default_pool_node_count = 2
master_authorizaed_networks_cidr_blocks = [
  {
    display_name = "All",
    cidr_block = "0.0.0.0/0"
  },
]
