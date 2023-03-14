resource "google_container_node_pool" "pool_1" {
  name       = "pool-1"
  project    = var.project
  location   = "${var.region}-${var.zone}"
  cluster    = google_container_cluster.default.name
  node_count = var.node_pool_count

  autoscaling {
    min_node_count = var.min_node_count
    max_node_count = var.max_node_count
  }

  lifecycle {
    ignore_changes = [
      node_count
    ]
  }

  node_config {
    spot  = var.preemptible
    machine_type = var.machine_type
    disk_type = "pd-standard"
    disk_size_gb = 100

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform" # Give full access to all cloud services
    ]
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  depends_on = [
    google_container_cluster.default
  ]
}
