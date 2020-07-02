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

## Folder structure

```bash
terraform
├── README.md
├── envs # Environment specific variable values
│   ├── production.tfvars
│   └── staging.tfvars
├── main.tf # Main rersource definitions (cluster, node_pool, buckets)
├── outputs.tf # Output values when running terraform commands
├── terraform.tfstate # Terraform state
├── terraform.tfstate.backup # Terraform state backup
├── variables.tf # Defines all variables for main.tf (override per env)
└── versions.tf # Defines minimum terraform version
```