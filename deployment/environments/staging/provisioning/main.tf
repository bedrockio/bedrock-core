locals {
  global = {
    project          = var.project,
    region           = var.region,
    multi_region     = var.multi_region,
    zone             = var.zone,
    environment      = var.environment,
    location         = "${var.region}-${var.zone}",
    bucket_prefix    = var.bucket_prefix,
    cluster_name     = var.cluster_name,
    node_pool_count  = var.node_pool_count,
    min_node_count   = var.min_node_count,
    max_node_count   = var.max_node_count,
    machine_type     = var.machine_type,
    preemptible      = var.preemptible
  }
}

module "gke-cluster" {
  source = "../../../provisioning/gke-cluster-module"

  global = local.global
  preemptible = true
  node_pool_count = 2
}

module "gcp-buckets" {
  source = "../../../provisioning/gcp-bucket-module"

  global = local.global
}

resource "google_compute_disk" "mongo_disk" {
  project = var.project
  name    = "mongo-disk"
  type    = "pd-ssd"
  zone    = local.global.location
  size    = 100
}