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
infrastructure/provisioning/
├── README.md
├── backend.tf
├── main.tf # Main rersource definitions (cluster, node_pool, buckets)
├── outputs.tf # Output values when running terraform commands
├── production
│   └── variables.tfvars
├── staging
│   └── variables.tfvars
├── variables.tf # Defines all variables for main.tf (override per env)
└── versions.tf # Defines minimum terraform version
```

## Provision GKE Cluster

```bash
# Staging
# terraform init only has to be executed the first time
$ ./infrasctructure/deployment/scripts/provision staging init

$ ./infrasctructure/deployment/scripts/provision staging plan
$ ./infrasctructure/deployment/scripts/provision staging apply

# Production
# terraform init only has to be executed the first time
$ ./infrasctructure/deployment/scripts/provision production init

$ ./infrasctructure/deployment/scripts/provision production plan
$ ./infrasctructure/deployment/scripts/provision production apply
```
