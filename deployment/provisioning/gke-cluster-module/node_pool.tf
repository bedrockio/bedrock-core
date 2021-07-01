resource "google_container_node_pool" "default" {
  name       = "pool-1"
  project    = var.global.project
  location   = var.global.location
  cluster    = google_container_cluster.default.name
  node_count = var.global.node_pool_count

  autoscaling {
    min_node_count = var.global.min_node_count
    max_node_count = var.global.max_node_count
  }

  node_config {
    preemptible  = var.global.preemptible
    machine_type = var.global.machine_type

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/compute", # is required for mounting persistent storage on your nodes.
      "https://www.googleapis.com/auth/devstorage.full_control", # Allows full control over data (buckets, gcr.io, etc)
      "https://www.googleapis.com/auth/trace.append", # Required for bedrock.io intrumentation
      "https://www.googleapis.com/auth/cloud-platform" # Give full access to all cloud services
    ]
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
