# Bedrock Deployment

- [Setup](#setup)
- [Existing Environments](#existing-environments)
  - [Authorization](#authorization)
- [New Environments](#new-environments)
  - [Creation](#create-a-new-environment)
  - [Provisioning](#provisioning)
  - [Configuring SSL](#configuring-ssl)
- [Deploying](#deploying)
  - [Rollout Deploy](#rollout-deploy)
  - [Feature Branches](#feature-branches)
  - [Building Docker Containers](#building-docker-containers)
  - [Pushing Docker Containers](#pushing-docker-containers)
- [Disaster Recovery](#disaster-recovery)
- [Other](#other)
  - [Configuring Backups](#configuring-backups)
  - [Backup Monitoring System](#backup-monitoring-system)
  - [HTTP Basic Auth](#http-basic-auth)
  - [Secrets](#secrets)

## Setup

### Dependencies

- Make sure the `gcloud` CLI tools are available
- Use `gcloud auth login` and `gcloud auth application-default login` to login to the right Google account

### Directory Structure

- `scripts/` Deployment scripts
- `staging/` Staging environment
- `staging/data` Data infrastructure
- `staging/services` Micro services infrastructure
- `staging/env.conf` Staging environment configuration

### Naming convention

- The name of this repository is prefixed to all services
- Each service has its own Dockerfile
- Sub services can be defined as Dockerfile.<name> (e.g. `services/api/Dockerfile.jobs`)

### Configuration

Each environment can be configured in `<environment>/env.conf`:

- `GCLOUD_ENV_NAME` - Name of the environment, e.g. staging
- `GCLOUD_BUCKET_PREFIX` - Bucket prefix used for GCS bucket creation
- `GCLOUD_PROJECT` - Google Cloud project id for this environment
- `GCLOUD_COMPUTE_ZONE` - Default compute zone for project
- `GCLOUD_KUBERNETES_CLUSTER_NAME` - Name of Kubernetes cluster to deploy to

## Existing Environments

### Authorization

- Use `gcloud auth login` and `gcloud auth application-default login` to sign into the right Google account
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

## New Environments

### Creating a new environment

- Create a Google Cloud project (in the GC console)
- Create a Google Kubernetes cluster (in the GC console)
- Authorize cluster `./deployment/scripts/authorize`
- Configure `<environment>/env.conf`
- Create disks required for data stores, update Kubernetes files disk information
- Use `kubectl create` to deploy all services and pods

### Provisioning Scripts

Various scripts exists to create resources on Google Compute Cloud:

```
./deployment/scripts/create_buckets staging
./deployment/scripts/create_addresses
./deployment/scripts/create_disks
```

### Configuring SSL

Steps to enable SSL:

1.  Create a certificate request `openssl req -new -newkey rsa:2048 -nodes -keyout deployment/<environment>/certificates/domain.key -out deployment/<environment>/certificates/domain.csr`
2.  Buy an SSL certificate (e.g. GoDaddy). Use above `domain.csr` CSR. Download bundle.
3.  Store the certificate (not the chain) as `deployment/<environment>/certificates/domain.crt`
4.  Create certificate on Google Cloud `./deployment/scripts/create_certificate <environment>`
5.  Make sure `api-ingress` and `web-ingress` are functioning
6.  Use the Google Cloud Console - https://console.cloud.google.com/home/dashboard - to add frontend routes to `api-ingress` and `web-ingress`. Select above `<environment>-ssl` certificate.

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

This downloads all secret environment keys to `deployment/secrets/credentials.txt` - this folder is ignored by Git.

_Security note: Never leave secret files on your machine_

Once you edited the `.txt` file you can upload it like so:

```
./deployment/scripts/set_secrets staging credentials
```

This uploads and deletes the values in `deployment/secrets/credentials.txt`. You can confirm the new values using `kubectl get secret credentials -o yaml` or using `kubectl exec` and confirming the environment variables in a given pod. Pods need a restart when secrets are updated!
