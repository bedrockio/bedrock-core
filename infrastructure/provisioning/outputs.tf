output "endpoint" {
  value = google_container_cluster.default.endpoint
}

output "master_version" {
  value = google_container_cluster.default.master_version
}

output "instance_group_urls" {
  value = google_container_cluster.default.instance_group_urls
}

output "node_config" {
  value = google_container_cluster.default.node_config
}

output "node_pools" {
  value = google_container_cluster.default.node_pool
}