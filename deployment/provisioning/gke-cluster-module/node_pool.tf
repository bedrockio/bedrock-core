resource "google_container_node_pool" "default" {
  name       = "node-pool"
  project    = var.global.project
  location   = var.global.location
  cluster    = google_container_cluster.default.name
  node_count = var.node_pool_count

  node_config {
    preemptible  = var.preemptible
    machine_type = var.machine_type

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/compute", # is required for mounting persistent storage on your nodes.
      "https://www.googleapis.com/auth/devstorage.full_control" # Allows full control over data (buckets, gcr.io, etc)
    ]
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
