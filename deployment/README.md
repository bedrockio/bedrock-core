# Deployment

- [Deployment](#deployment)
  - [Setup](#setup)
    - [Dependencies](#dependencies)
    - [Directory Structure](#directory-structure)
    - [Naming convention](#naming-convention)
    - [Configuration](#configuration)
  - [Existing Environments](#existing-environments)
    - [Authorization](#authorization)
  - [Provisioning](#provisioning)
    - [Creating a new environment](#creating-a-new-environment)
    - [Provision Script](#provision-script)
    - [Directory Structure](#directory-structure-1)
    - [Provision GKE Cluster](#provision-gke-cluster)
    - [Create load balancer IP addresses](#create-load-balancer-ip-addresses)
    - [Deploy all services and pods](#deploy-all-services-and-pods)
    - [Scaling Up or Down](#scaling-up-or-down)
    - [Destroying Environment Infrastructure](#destroying-environment-infrastructure)
  - [Deploying](#deploying)
    - [Quick deploy of API and other services](#quick-deploy-of-api-and-other-services)
    - [Building a Docker container](#building-a-docker-container)
    - [Pushing Docker containers](#pushing-docker-containers)
    - [Rollout Docker containers (restart pods)](#rollout-docker-containers-restart-pods)
    - [Deploy info](#deploy-info)
    - [Check cluster status](#check-cluster-status)
    - [Getting shell access](#getting-shell-access)
    - [Reloading DB fixtures](#reloading-db-fixtures)
  - [Disaster Recovery](#disaster-recovery)
    - [Scenario A: Master Database Loss or Corruption](#scenario-a-master-database-loss-or-corruption)
    - [Scenario B: Bucket Storage Loss or Corruption](#scenario-b-bucket-storage-loss-or-corruption)
    - [Scenario C: Deletion of Google Cloud Project](#scenario-c-deletion-of-google-cloud-project)
  - [Other](#other)
    - [Configuring Backups](#configuring-backups)
    - [Backup Monitoring System](#backup-monitoring-system)
    - [HTTP Basic Auth](#http-basic-auth)
    - [Secrets](#secrets)

## Setup

### Dependencies

- Make sure the `gcloud` CLI tools are available
- Install the `bedrock-cli` ([link](https://github.com/bedrockio/bedrock-cli))

```bash
curl -s https://install.bedrock.io | bash
```

- Use `gcloud auth login` and `gcloud auth application-default login` to login to the right Google account, or `bedrock cloud login`.
- For provisioning `bedrock-cli` requires [Terraform](https://www.terraform.io/)

### Directory Structure

```bash
deployment/
├── README.md
├── environments # Deployment configuration per environment
│   ├── production # Production environment
│   │   ├── data # Data deployment
│   │   │   ├── mongo-deployment.yml
│   │   │   ├── mongo-service.yml
│   │   │   └── etc...
│   │   ├── config.json # Staging environment configuration for bedrock-cli
│   │   ├── provisioning
│   │   │   ├── backend.tf # defines Google bucket to keep state
│   │   │   ├── main.tf # Main rersource definitions (cluster, node_pool, buckets)
│   │   │   ├── outputs.tf # Output values when running terraform commands
│   │   │   ├── variables.tf # Defines all variables for main.tf (override per env)
│   │   │   └── versions.tf # Defines minimum terraform version
│   │   ├── services # Micro services deployment
│   │   │   ├── api-deployment.yml
│   │   │   ├── api-service.yml
│   │   │   ├── web-deployment.yml
│   │   │   ├── web-service.yml
│   │   │   └── etc...
│   └── staging # Staging environment
│       └── etc...
├── provisioning
│   ├── gcp-bucket-module # Terraform bucket module
│   │   ├── main.tf
│   │   └── variables.tf
│   └── gke-cluster-module # Terraform GKE cluster and node pool module
│       ├── main.tf
│       ├── node_pool.tf
│       ├── outputs.tf
│       └── variables.tf
└── scripts # Deployment and provisioning scripts
    ├── create_addresses
    └── etc...
```

### Naming convention

- The name of this repository is prefixed to all services
- Each service has its own Dockerfile
- Sub services can be defined as Dockerfile.<name> (e.g. `services/api/Dockerfile.jobs`)

### Configuration

Each environment can be configured in `environments/<environment>/config.json`:

```json
{
  "gcloud": {
    "envName": "staging", // - Name of the environment, e.g. staging
    "bucketPrefix": "bedrock-foundation", // - Bucket prefix used for GCS bucket creation
    "project": "bedrock-foundation", // - Google Cloud project id for this environment
    "computeZone": "us-east1-c", // - Default compute zone for project
    "kubernetes": {
      "clusterName": "cluster-1" // - Name of Kubernetes cluster for deployment
    },
    "label": "app" // - name of the deployment label that is used for kubectl matching
  }
}
```

## Existing Environments

### Authorization

- Use `gcloud auth login` and `gcloud auth application-default login` to login to the right Google account, or `bedrock cloud login`
- Use `bedrock cloud authorize staging` to get cluster credentials
- If you've used `gcloud auth` with another account, run `gcloud config set account <EMAIL>` or `bedrock cloud account <EMAIL>`, then re-run `bedrock cloud authorize`.

If you get this error when trying to deploy:

```
unauthorized: You don't have the needed permissions to perform this operation, and you may have invalid credentials
```

Then do the following

```
gcloud auth configure-docker
```

## Provisioning

[Terraform](https://www.terraform.io/) is used (defining infrastructure as code) to provision the environment and create the Kubernetes cluster.

### Creating a new environment

Create a Google Cloud project (in the [GC dashboard](https://console.cloud.google.com/home/dashboard)) or:

```bash
gcloud projects create bedrock-staging --name="Bedrock Staging"
gcloud config set project bedrock-staging
```

Configure: `environments/<environment>/config.json`.

### Provision Script

There is a bootstrap command that automatically takes care of the remaining steps, But you can do it manually in case of more customized environments.

The following command takes an environment variable and Google Project ID:

```bash
bedrock cloud bootstrap staging bedrock-staging
```

### Directory Structure

There is a `variables.tfvars` file per environment to override default vars with environment specific values, which can be found in the `environments/<environment>/` folder.

### Provision GKE Cluster

If you don't want to use the bootstrap command, you can also only run the terraform provisioning steps as follows.

Requires terraform:

```bash
# MacOS terraform install
brew install terraform
```

Note: this script can take about 5 minutes.

```bash
# Staging
# 'init' only has to be executed the first time
$ bedrock cloud provision staging init
# 'plan' creates an execution plan for inspection
$ bedrock cloud provision staging plan
# 'plan' is not required before 'apply', as 'apply' runs 'plan' in the background
$ bedrock cloud provision staging apply
```

### Create load balancer IP addresses

With `bootstrap` you already create load balancer IP addresses for api and web. If you need to create additional ones, you can update and run:

```
./deployment/scripts/create_addresses
```

Update service (.e.g., api and web) deployments with static IP Addresses that were just created.

### Deploy all services and pods

Authorize cluster (e.g. staging):

```bash
bedrock cloud authorize staging
```

Use `bedrock cloud deploy` to deploy all services (press 'a' to select all services when prompted) and pods (or `kubectl create`)

### Scaling Up or Down

You can change the node size of the (existing) default pool with the Terraform variable `default_pool_node_count` per environment as defined in `environments/<environment>/vaiables.tfvars`

Update cluster:

```
$ bedrock cloud provision staging apply
```

### Destroying Environment Infrastructure

You can destroy the infrastructure for a particular environment (e.g. `staging`) with:

```
$ bedrock cloud provision staging destroy
```

## Deploying

### Quick deploy of API and other services

The `bedrock cloud deploy` command builds, pushes, and performs a rolling update of a service that incurs no downtime. Note that this will also apply changes to environment variables.

The following builds, pushes and applies containers for the `services/api`:

```bash
bedrock cloud deploy staging api
```

If you leave out the `api` argument, then you will be presented with a prompt to select the service you wish to deploy. Example:

```bash
bedrock cloud deploy staging
? Select service / subservice: › - Space or arrow-keys to select. Press "a" to select all. Return to submit.
◯   api
◯   api / cli
◯   api / jobs-accounting
◯   api / jobs-eclearing
◯   api / jobs-eclearing-cpo
◯   api / jobs-eclearing-locations
◯   api / jobs-ocpi-locations
◯   api-docs
◯ ↓ bedrock-indexer
```

If you also remove the `<environment>` parameter (`staging`), you will first be prompted to select the environment:

```bash
bedrock cloud deploy
? Select environment: › - Use arrow-keys. Return to submit.
❯   staging
    production
```

### Building a Docker container

Build all Docker containers:

```bash
bedrock cloud build # press 'a' to select all services and 'enter' to submit
```

Build a specific service:

```
bedrock cloud build api
```

Build a specific sub service:

```
bedrock cloud build api jobs
```

### Pushing Docker containers

Push all locally known Docker containers to staging:

```bash
bedrock cloud push staging # press 'a' to select all services and 'enter' to submit
```

Push all containers matching "api" to staging:

```
bedrock cloud push staging api
```

### Rollout Docker containers (restart pods)

Rollout all deployments on staging:

```bash
bedrock cloud rollout staging # press 'a' to select all services and 'enter' to submit
```

Rollout all deployments matching "api" to staging:

```
bedrock cloud rollout staging api
```

### Deploy info

Each deployment is tagged with the author, date, and git ref of the deploy. To see these details for the currently running service use:

```
bedrock cloud info staging web
```

### Check cluster status

```
bedrock cloud status staging
```

### Getting shell access

There's a default `api-cli-deployment` provided that allows you to obtain a shell. This is useful when running migration scripts in production (you can take down the API and use CLI to do operations without new reads/writes coming in):

```
bedrock cloud shell
```

You can also get shell access to every other running deployment/pod:

```
bedrock cloud shell staging mongo
```

Alternatively with kubectl:

```
kubectl exec -it <CLI-POD-ID> -- /bin/bash
```

Note that the `api` and `web` services can be reached as hostnames: `curl http://api`

### Reloading DB fixtures

Use the following command in the API CLI shell to reload the DB fixtures:

```bash
./scripts/fixtures/reload
```

Note: Fixtures are loaded automatically when the API CLI pod is started if no data is found in the DB

## Disaster Recovery

There are various data loss scenarios that each have their own procedure.

#### Scenario A: Master Database Loss or Corruption

In the event of master database loss or corruption, a full backup is available for each given day. A full copy of each day's database is stored in the MongoDB backup destination bucket (`platform-<environment>-mongodb-backups`). A timestamp is given to each daily MongoDB dump. E.g:

```
mongo-platform-2019-03-05-16-50.tar.gz
```

In order to restore this data, follow the following steps:

- Ensure a new version of the `data/mongo-deployment` pod is running. This can be done either with an old disk or a newly created disk.
- Copy the file onto the pod
- Open a terminal into the pod, using `kubectl exec -it <pod id> -- /bin/bash`
- Unpack the backup file `tar xfzv mongo-platform-2019-03-05-16-50.tar.gz`
- Run a `mongorestore` command using the backup folder and the targeted database

#### Scenario B: Bucket Storage Loss or Corruption

A full daily backup can be found in the bucket storage backup destination bucket (E.g. `platform-staging-uploads-backup`). In order to restore data follow the following steps:

- Create a new GCS bucket in the same project
- Copy files from the backup bucket to this new bucket: `gsutil cp -r gs://platform-staging-uploads-backup gs://platform-staging-uploads/.`
- Switch over API, Jobs and Pipeline services to use the new backup
- Once system is functioning properly, update bucket storage backup system with new origin bucket.

#### Scenario C: Deletion of Google Cloud Project

In the event of a GC project deletion, the project can be restored within 30 days by following this procedure:

https://cloud.google.com/resource-manager/docs/creating-managing-projects?visit_id=636879493082577850-1876265700&rd=1#restoring_a_project

## Other

### Configuring Backups

There are two backup systems that run as autonomous pods:

- `data/mongo-backups-deployment.yml` - Incremental backups of MongoDB
- `data/bucket-storage-backups-deployment.yml` - Daily backups of a bucket

Make sure these systems are running.

### Backup Monitoring System

A backup monitoring system is provided using configuration `data/backup-monitor-deployment.yml`. This system checks whether backups were generated every day for multiple buckets. If no backups were found, an alert goes out.

In addition to alerts, a weekly health report is mailed out with an overview of all health checks that were accomplished.

This system requires the following configuration:

- `GS_BUCKETS` - A list of GCS backup buckets to monitor
- `POSTMARK_API_KEY` - API key for the Postmark delivery service
- `POSTMARK_FROM` - From email address (tied to Postmark account)
- `EMAIL_ALERT` - Destination address for backup alerts
- `EMAIL_HEALTH_CHECK` - Destination address for weekly health report

### HTTP Basic Auth

Protect web routes using `ENABLE_HTTP_BASIC_AUTH`. You can also protect a specific route with `HTTP_BASIC_AUTH_PATH`, or protect everything (default).

### Secrets

We do not want to & should not check in sensitive keys into git. We therefore use Kubernetes secrets and attach them to a POD where they are needed.

We are using env files to attach secrets to our deployment. For example to create one we would enter the key/value pairs into a text file and create it like follows.

Bedrock has the following secret commands:

```bash
  get [environment] [name]     Get Secret from cluster and store in local <secret-name>.conf file
  set [environment] [name]     Push secret to cluster from local <secret-name>.conf file
  info [environment] [name]    Retrieve secret info from cluster
  delete [environment] [name]  Delete secret from cluster
  help [command]               display help for command
```

The `<secret-name>.conf` file needs to be located in the `/environments/<environment>/secrets` folder (create secrets folder if it doesn't exist yet.).

For example create `credentials.conf` in `/environments/staging/secrets`, containing:

```conf
JWT_TOKEN=xyz
```

Then to create the secret on the Kubernetes cluster:

```
bedrock cloud secret set staging credentials
```

and to view it

```
bedrock cloud secret info staging credentials
```

_Security note: Al values that are downloaded are in base64. Please avoid adding sensitive information to your shell history when decoding._

Then to make it assessible for a deployment add something like the following to the env for a container. For example to expose the value of a key called MY_SECRET_KEY do the following:

```
 - name: MY_SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: credentials
          key: MY_SECRET_KEY
```

For a further example of this look at api-deloyment.yml for production.

Convenience scripts for downloading and uploading secrets:

```
bedrock cloud secret get staging credentials
```

This downloads all secret environment keys to `deployment/environments/staging/secrets/credentials.conf` - this folder is ignored by Git.

_Security note: Never leave secret files on your machine_

Once you edited the `.conf` file you can upload it like so:

```
bedrock cloud secret set staging credentials
```

This uploads and deletes the values in `deployment/environments/staging/secrets/credentials.conf`. You can confirm the new values using `bedrock cloud secret info staging credentials` or using `kubectl exec` and confirming the environment variables in a given pod. Pods need a restart when secrets are updated!
