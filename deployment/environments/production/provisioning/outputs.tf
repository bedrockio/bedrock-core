output "endpoint" {
  value = module.gke-cluster.endpoint
}

output "master_version" {
  value = module.gke-cluster.master_version
}

output "cli_connect" {
  value = "'gcloud container clusters get-credentials ${var.cluster_name} --zone ${var.region}-${var.zone} --project ${var.project}'"
}