variable "global" {
  type = map(string)
  description = "Global variables used in all modules"
}

variable "buckets" {
  type = set(string)

  default = [
    "uploads",
    "uploads-backup",
    "mongodb-backups"
  ]
}