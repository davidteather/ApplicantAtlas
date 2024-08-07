variable "database_env_vars" {
  description = "Environment variables for the database"
  type        = map(string)
}

variable "event_listener_env_vars" {
  description = "Environment variables for the event listener"
  type        = map(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "sqs_queue_arn" {
  description = "SQS queue ARN"
  type        = string
}

variable "software_version" {
  description = "The version to deploy"
  type        = string
}
