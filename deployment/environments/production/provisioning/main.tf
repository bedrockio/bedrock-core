locals {
  global = {
    project          = var.project,
    region           = var.region,
    zone             = var.zone,
    environment      = var.environment,
    location         = "${var.region}-${var.zone}",
    bucket_prefix    = var.bucket_prefix,
    cluster_name     = var.cluster_name
  }
}

module "gke-cluster" {
  source = "../../../provisioning/gke-cluster-module"

  global = local.global
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