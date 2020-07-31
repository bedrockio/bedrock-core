output "endpoint" {
  value = google_container_cluster.default.endpoint
}

output "master_version" {
  value = google_container_cluster.default.master_version
}

output "cli_connect" {
  value = "'gcloud container clusters get-credentials ${var.cluster_name} --zone ${var.region}-${var.zone} --project ${var.project}'"
}