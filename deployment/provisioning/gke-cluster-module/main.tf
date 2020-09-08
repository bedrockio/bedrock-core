resource "google_container_cluster" "default" {
  provider    = google-beta
  project     = var.global.project
  location    = var.global.location
  name        = var.global.cluster_name

  description = var.description

  remove_default_node_pool = true
  initial_node_count       = 1
  enable_kubernetes_alpha  = false

  master_auth {
    username = ""
    password = ""

    client_certificate_config {
      issue_client_certificate = false
    }
  }

  release_channel {
    channel = "STABLE"
  }

  timeouts {
    create = "2h"
    update = "2h"
    delete = "2h"
  }

  ## Use when you want to use IP whitelist
  master_authorized_networks_config {

    dynamic "cidr_blocks" {
      for_each = var.master_authorizaed_networks_cidr_blocks
      content {
        display_name = cidr_blocks.value["display_name"]
        cidr_block = cidr_blocks.value["cidr_block"]
      }
    }

  }

  ## Recommended to use private nodes
  # private_cluster_config {
  #   enable_private_nodes   = true
  # }
}