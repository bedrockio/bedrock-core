## https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/using_gke_with_terraform

## NETWORKING ##
resource "google_compute_network" "gke" {
  project                 = var.project
  name                    = "gke-network"
  auto_create_subnetworks = false
  description             = "Compute Network for GKE nodes"
}

resource "google_compute_subnetwork" "gke" {
  project       = var.project
  name          = "gke-subnetwork"
  ip_cidr_range = "10.5.0.0/20" # 4096 IPs
  region        = var.region
  network       = google_compute_network.gke.id

  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "10.4.0.0/19" # 8192 IPs
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "10.0.0.0/14" # 262.144 IPs
  }
}

## CLUSTER ##
resource "google_container_cluster" "default" {
  project     = var.project
  location    = "${var.region}-${var.zone}"
  name        = var.cluster_name
  description = var.cluster_description

  remove_default_node_pool = true
  initial_node_count       = 1
  enable_kubernetes_alpha  = false

  network    = google_compute_network.gke.id
  subnetwork = google_compute_subnetwork.gke.id

  gateway_api_config {
		channel = "CHANNEL_STANDARD"
	}

  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-ranges"
    services_secondary_range_name = "services-range"
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  release_channel {
    channel = "REGULAR"
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
  #   enable_private_nodes = true
  # }
}

## BUCKETS ##
locals {
  buckets = [for bucket in var.buckets : "${var.bucket_prefix}-${bucket}"]
}

resource "google_storage_bucket" "bucket" {
  for_each = toset(local.buckets)

  name          = each.value
  project       = var.project
  location      = var.multi_region
  storage_class = "MULTI_REGIONAL"
}

## DISKS ##
resource "google_compute_disk" "mongo-disk" {
  project = var.project
  name    = "mongo-disk"
  type    = "pd-ssd"
  zone    = "${var.region}-${var.zone}"
  size    = 100

 lifecycle {
    ignore_changes = [
      labels
    ]
  }
}

resource "google_compute_resource_policy" "hourly" {
  name    = "hourly-snapshot-policy"
  project = var.project
  region  = var.region
  snapshot_schedule_policy {
    schedule {
      hourly_schedule {
        hours_in_cycle = 1 # The number of hours between snapshots
        start_time = "00:00"
      }
    }
    retention_policy {
      max_retention_days    = 7
      # Specifies the behavior to apply to scheduled snapshots when the source disk is deleted.
      # Default value is KEEP_AUTO_SNAPSHOTS
      on_source_disk_delete = "APPLY_RETENTION_POLICY"
    }
  }
}

resource "google_compute_disk_resource_policy_attachment" "attachment" {
  project = var.project
  name = google_compute_resource_policy.hourly.name
  disk = google_compute_disk.mongo-disk.name
  zone = "${var.region}-${var.zone}"
}

## IP ADDRESES ##
resource "google_compute_global_address" "api_ingress" {
  name     = "api-ingress"
  project  = var.project
}

resource "google_compute_global_address" "web_ingress" {
  name     = "web-ingress"
  project  = var.project
}