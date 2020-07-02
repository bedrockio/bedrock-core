# Terraform

Launch and manage a GKE cluster using Terraform.

## Launch GKE Cluster

```bash
$ terraform init
# Staging
$ terraform plan -var-file=./envs/staging.tfvars
$ terraform apply -var-file=./envs/staging.tfvars
# Production
$ terraform plan -var-file=./envs/production.tfvars
$ terraform apply -var-file=./envs/production.tfvars
```