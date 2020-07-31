locals {
  buckets = [for bucket in var.buckets : "${var.global.bucket_prefix}-${bucket}"]
}

resource "google_storage_bucket" "bucket" {
  for_each = toset(local.buckets)

  name          = each.value
  project       = var.global.project
  location      = var.global.region
  storage_class = "REGIONAL"
}