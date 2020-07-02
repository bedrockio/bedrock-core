output "endpoint" {
  value = google_container_cluster.default.endpoint
}

output "master_version" {
  value = google_container_cluster.default.master_version
}