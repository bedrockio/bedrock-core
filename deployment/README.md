# Bedrock Deployment

- [Bedrock Deployment](#bedrock-deployment)
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
    - [Rollout Deploy](#rollout-deploy)
    - [Feature Branches](#feature-branches)
    - [Deploy info](#deploy-info)
    - [Building Docker Containers](#building-docker-containers)
    - [Pushing Docker Containers](#pushing-docker-containers)
    - [Check cluster status](#check-cluster-status)
    - [Getting shell access](#getting-shell-access)
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
- Use `gcloud auth login` and `gcloud auth application-default login` to login to the right Google account
- For provisioning we use [Terraform](https://www.terraform.io/)

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
│   │   ├── env.conf # Staging environment configuration
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
    ├── authorize
    ├── build
    └── etc...
```

### Naming convention

- The name of this repository is prefixed to all services
- Each service has its own Dockerfile
- Sub services can be defined as Dockerfile.<name> (e.g. `services/api/Dockerfile.jobs`)

### Configuration

Each environment can be configured in `environments/<environment>/env.conf`:

- `GCLOUD_ENV_NAME` - Name of the environment, e.g. staging
- `GCLOUD_BUCKET_PREFIX` - Bucket prefix used for GCS bucket creation
- `GCLOUD_PROJECT` - Google Cloud project id for this environment
- `GCLOUD_COMPUTE_ZONE` - Default compute zone for project
- `GCLOUD_KUBERNETES_CLUSTER_NAME` - Name of Kubernetes cluster to deploy to

## Existing Environments

### Authorization

- Use `gcloud config configurations create bedrock` and authorize Google Cloud `gcloud auth login`
- Use `./deployment/scripts/authorize staging` to get cluster credentials
- If you've used `gcloud auth` with another account, run `gcloud config set account <EMAIL>`, then re-run `./deployment/scripts/authorize`.

If you get this error when trying to deploy:

```
unauthorized: You don't have the needed permissions to perform this operation, and you may have invalid credentials
```

Then do the following

```
gcloud auth configure-docker
```

or

```
gcloud docker --authorize-only
```

## Provisioning

[Terraform](https://www.terraform.io/) is used (defining infrastructure as code) to provision the environment and create the Kubernetes cluster.

### Creating a new environment

Create a Google Cloud project (in the [GC dashboard](https://console.cloud.google.com/home/dashboard)) or:

```bash
gcloud projects create bedrock-staging --name="Bedrock Staging"
gcloud config set project seltzer-box-staging
```

Configure: `environments/<environment>/env.conf`.

### Provision Script

There is a script that automatically takes care of the remaining steps, But you can do it manually in case of more customized environments.

The following script takes an environment variable and Google Project ID:

```bash
./deployments/scripts/provision_gcloud staging bedrock-staging
```

### Directory Structure

There is a `variables.tfvars` file per environment to override default vars with environment specific values, which can be found in the `environments/<environment>/` folder.

### Provision GKE Cluster

Requires terraform:

```bash
# MacOS terraform install
brew install terraform
```

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

### Create load balancer IP addresses

```
./deployment/scripts/create_addresses
```

Update api and web deployments with static IP Addresses that were just created.

### Deploy all services and pods

Authorize cluster (e.g. staging):

```bash
./deployment/scripts/authorize staging
```

Use `kubectl create` to deploy all services and pods

### Scaling Up or Down

You can change the node size of the (existing) default pool with the Terraform variable `default_pool_node_count` per environment as defined in `environments/<environment>/vaiables.tfvars`

Update cluster:

```
$ ./deployment/scripts/provision staging apply
```

### Destroying Environment Infrastructure

You can destroy the infrastructure for a particular environment (e.g. `staging`) with:

```
$ ./deployment/scripts/provision staging destroy
```

## Deploying

### Rollout Deploy

The `deploy` script builds, pushes, and performs a rolling update of a service that incurs no downtime. Note that this will also apply changes to environment variables.

Deploy "web" on staging:

```
./deployment/scripts/deploy staging web
```

To deploy API and web together:

```
./deployment/scripts/deploy_api_web staging
```

### Feature Branches

The `--feature` flags can be used when deploying to create dynamic feature branches for testing. Pointing a subdomain at the feature branch ingress IP will enable the branch:

```
./deployment/scripts/deploy staging web --feature=demo
```

The `--api` flag will additionally override the `API_URL` for features that require API changes:

```
./deployment/scripts/deploy staging web --feature=demo --api=demo
```

### Deploy info

Each deployment is tagged with the author, date, and git ref of the deploy. To see these details for the currently running service use:

```
./deployment/scripts/deploy_info staging web
```

### Building Docker Containers

Build all Docker containers:

```
./deployment/scripts/build
```

Build a specific service:

```
./deployment/scripts/build api
```

Build a specific sub service:

```
./deployment/scripts/build api jobs
```

### Pushing Docker Containers

First set up docker to gcloud as a credential helper with:

```
gcloud auth configure-docker
```

Push all locally known Docker containers to staging:

```
./deployment/scripts/push staging
```

Push all containers matching "api" to staging:

```
./deployment/scripts/push staging api
```

### Check cluster status

```
./deployment/scripts/status staging
```

### Getting shell access

There's a default `api-cli-deployment` provided that allows you to obtain a shell. This is useful when running migration scripts in production (you can take down the API and use CLI to do operations without new reads/writes coming in):

```
kubectl exec -it <CLI-POD-ID> /bin/bash
```

Note that the `api` and `web` services can be reached as hostnames: `curl http://api`

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
- Open a terminal into the pod, using `kubectl exec -it <pod id> /bin/bash`
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

```
kubectl create secret generic credentials --from-env-file ./credentials.txt
```

and to view it

```
 kubectl get secret credentials -o yaml
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
./deployment/scripts/get_secrets staging credentials
```

This downloads all secret environment keys to `deployment/environments/staging/secrets/credentials.txt` - this folder is ignored by Git.

_Security note: Never leave secret files on your machine_

Once you edited the `.txt` file you can upload it like so:

```
./deployment/scripts/set_secrets staging credentials
```

This uploads and deletes the values in `deployment/environments/staging/secrets/credentials.txt`. You can confirm the new values using `kubectl get secret credentials -o yaml` or using `kubectl exec` and confirming the environment variables in a given pod. Pods need a restart when secrets are updated!
