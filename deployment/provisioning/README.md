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
deployment/provisioning/
├── README.md
├── backend.tf
├── main.tf # Main rersource definitions (cluster, node_pool, buckets)
├── outputs.tf # Output values when running terraform commands
├── variables.tf # Defines all variables for main.tf (override per env)
└── versions.tf # Defines minimum terraform version
```

There is also a `variables.tfvars` file per environment to override default vars with environment specific values, which can be found in the `deployment/environments/<environment>/` folder.

## Provision GKE Cluster

Note: this script can take about 5 minutes.

```bash
# Staging
# terraform init only has to be executed the first time
$ ./deployment/scripts/provision staging init

$ ./deployment/scripts/provision staging plan
$ ./deployment/scripts/provision staging apply

# Production
# terraform init only has to be executed the first time
$ ./deployment/scripts/provision production init

$ ./deployment/scripts/provision production plan
$ ./deployment/scripts/provision production apply
```
