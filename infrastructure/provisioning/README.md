# Provisioning

- [Provisioning](#provisioning)
  - [Setup](#setup)
    - [Dependencies](#dependencies)
    - [Install Terraform](#install-terraform)
  - [Directory Structure](#directory-structure)
  - [Provision GKE Cluster](#provision-gke-cluster)

## Setup

### Dependencies

- Make sure the `gcloud` CLI tools are available
- Use `gcloud auth login` and `gcloud auth application-default login` to login to the right Google account
- For provisioning we use [Terraform](https://www.terraform.io/)

### Install Terraform

```bash
# MacOS terraform install
brew install terraform
```

## Directory Structure

```bash
infra/provisioning/
├── README.md
├── backend.tf
├── envs # Environment specific variables and beckend tfvars
│   ├── production
│   │   ├── backend.tfvars
│   │   └── variables.tfvars
│   └── staging
│       ├── backend.tfvars
│       └── variables.tfvars
├── main.tf # Main rersource definitions (cluster, node_pool, buckets)
├── outputs.tf # Output values when running terraform commands
├── variables.tf # Defines all variables for main.tf (override per env)
└── versions.tf # Defines minimum terraform version
```

## Provision GKE Cluster

```bash
cd infa/provisioning;

# Staging
# terraform init only has to be executed the first time
$ terraform init -backend-config=./envs/staging/backend.tfvars

$ terraform plan -var-file=./envs/staging/variables.tfvars
$ terraform apply -var-file=./envs/staging/variables.tfvars

# Production
# terraform init only has to be executed the first time
$ terraform init -backend-config=./envs/production/backend.tfvars

$ terraform plan -var-file=./envs/production/variables.tfvars
$ terraform apply -var-file=./envs/production/variables.tfvars
```
