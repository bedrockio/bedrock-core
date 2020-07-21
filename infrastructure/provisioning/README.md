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
├── variables.tf # Defines all variables for main.tf (override per env)
└── versions.tf # Defines minimum terraform version
```

There is also a `variables.tfvars` file per environment to override default vars with environment specific values, which can be found in the `infrastructure/environments/<environment>/` folder.

## Provision GKE Cluster

Note: this script can take about 5 minutes.

```bash
# Staging
# terraform init only has to be executed the first time
$ ./infrastructure/scripts/provision staging init

$ ./infrastructure/scripts/provision staging plan
$ ./infrastructure/scripts/provision staging apply

# Production
# terraform init only has to be executed the first time
$ ./infrastructure/scripts/provision production init

$ ./infrastructure/scripts/provision production plan
$ ./infrastructure/scripts/provision production apply
```
