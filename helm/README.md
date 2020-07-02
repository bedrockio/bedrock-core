# Deployment with Helm and Helmfile

## Dependencies
- [Helm](https://github.com/helm/helm): Helm is a tool for managing Charts. Charts are packages of pre-configured Kubernetes resources.
- [Helm-diff](https://github.com/databus23/helm-diff): This is a Helm plugin giving your a preview of what a helm upgrade would change. Also used by the `helmfile diff` sub-command.
- [Helmfile](https://github.com/roboll/helmfile): Helmfile is a declarative spec for deploying helm charts

## Installation (MacOS)

```bash
# Install helm
brew install helm

# Install helm-diff plugin
helm plugin install https://github.com/databus23/helm-diff

# Install helmfile
brew install helmfile
```

## Folder structure

```bash
helm
├── README.md
├── charts
│   ├── data
│   │   ├── elasticsearch
│   │   │   ├── Chart.yaml
│   │   │   ├── templates
│   │   │   │   ├── deployment.yml
│   │   │   │   ├── pvc.yaml
│   │   │   │   └── service.yml
│   │   │   └── values.yaml
│   │   └── mongo
│   │       ├── Chart.yaml
│   │       ├── templates
│   │       │   ├── deployment.yml
│   │       │   ├── pvc.yaml
│   │       │   └── service.yml
│   │       └── values.yaml
│   └── services
│       ├── api
│       │   ├── Chart.yaml
│       │   ├── templates
│       │   │   ├── deployment.yaml
│       │   │   ├── ingress.yaml
│       │   │   └── service.yaml
│       │   └── values.yaml
│       ├── api-cli
│       │   ├── Chart.yaml
│       │   ├── templates
│       │   │   └── deployment.yaml
│       │   └── values.yaml
│       └── web
│           ├── Chart.yaml
│           ├── templates
│           │   ├── deployment.yml
│           │   └── service.yml
│           └── values.yaml
├── envs
│   ├── production.yaml
│   └── staging.yaml
└── helmfile.yaml
```
### Charts
The charts, which are this case local helm packages, are split between `data` and `services`. Each chart is organized as follows:
```bash
api/
  Chart.yaml          # A YAML file containing information about the chart
  charts/             # A directory containing any charts upon which this chart depends.
  values.yaml         # The default configuration values for this chart
  templates/          # A directory of templates that, when combined with values,
                      # will generate valid Kubernetes manifest files.
```
More info on charts [here](https://helm.sh/docs/topics/charts/).

### Environments
The `envs` folder holds the yaml file per environment where values can get environment specific values (overriding the Chart values.yaml)

It is required to set the `kubeContext` in each environment file.

### Helmfile

The helmfile specifies all the releases based on the helm charts.

## Deployment commands

```bash
# diff will show the differences that will be made
helmfile -e production diff

# sync will create and bump the revisions for each Helm chart on the K8s cluster
# Does a helm --install for the charts
helmfile -e production sync

# apply will only update and bump revisions when there are changes
helmfile -e production apply

# selectors can be used to single out a release
helmfile -e production --selector name=api-cli apply
```

So each `helmfile sync` will result in a new revision. Now if you were to run `helmfile apply`, which will first check for diffs and only then (if found) will call `helmfile sync` which will in turn call `helm upgrade --install` this will not happen.

## Helm commands

```bash
# List all the deployed charts and revisions
helm list

NAME         	NAMESPACE	REVISION	UPDATED                              	STATUS  	CHART              	APP VERSION
api          	default  	4       	2020-06-30 09:33:30.557865 +0200 CEST	deployed	api-0.1.0          	1.0.0
api-cli      	default  	5       	2020-06-30 09:33:30.543585 +0200 CEST	deployed	api-cli-0.1.0      	1.0.0
elasticsearch	default  	3       	2020-06-30 09:33:22.676813 +0200 CEST	deployed	elasticsearch-0.1.0	5
mongo        	default  	3       	2020-06-30 09:33:22.584116 +0200 CEST	deployed	mongo-0.1.0        	4.0.9

# Rollback to an older revision, with optional revision number, otherwise rolls back to previous revieion
helm rollback api
```

## Notes
- If you do not pass an environment with `-e`, you will get an error. This forces the correct settings (env + kubeContext).
- Used ingress for api instead of explicit loadBalancers. Web shows as an example the use of a loadBalancer service
- Used Persistent Volume claims (pvc) instead of creating disks
- This allows for easy usage and addition of Helm charts from the helm repo
- Helmfile performs linting to check if your yaml files are valid
- The api and web deployment yaml files have the following annotation, to always force a graceful rollout when the image tag is set to `latest`. The random string forces the pods to terminate and restart (with rollout, so no interuptions). In production you should pin the `tag` to the digest of the image, so it won't restart any pods when there are no yaml changes:

```yaml
annotations:
{{- if eq .Values.image.web.tag "latest" }}
  rollme: {{ randAlphaNum 5 | quote }}
{{- else }}
  rollme: "{{ .Values.image.web.tag }}"
{{- end }}
```

See [Helm automatically-roll-deployments](https://helm.sh/docs/howto/charts_tips_and_tricks/#automatically-roll-deployments) for more info.

## Missing

- [ ] Git commit meta data on (helm) releases. However, you do already have more helm release data (`helm list`)
