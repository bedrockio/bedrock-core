# Deployment with Helm and Helmfile

## Folder structure

helm/
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
│       │   │   ├── cli-deployment.yaml
│       │   │   ├── deployment.yaml
│       │   │   ├── ingress.yaml
│       │   │   └── service.yaml
│       │   └── values.yaml
│       └── web
│           └── templates
├── envs
│   ├── production.yaml
│   └── staging.yaml
└── helmfile.yaml
