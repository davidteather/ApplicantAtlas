locals {
  combined_env_vars = merge(var.database_env_vars, var.api_env_vars)
}

data "aws_caller_identity" "current" {}

resource "aws_ecr_repository" "applicant_atlas_api_lambda" {
  name = "applicant-atlas-api-lambda"
}

resource "aws_ecr_lifecycle_policy" "applicant_atlas_api_lambda_lifecycle_policy" {
  repository = aws_ecr_repository.applicant_atlas_api_lambda.name
  policy     = <<POLICY
{
    "rules": [
        {
            "rulePriority": 2,
            "description": "Retain only the last 5 ECR images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 5
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
POLICY
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/applicant_atlas_api"
  retention_in_days = 14
}

data "aws_ecr_image" "lambda_image" {
  repository_name = aws_ecr_repository.applicant_atlas_api_lambda.name
  image_tag       = var.software_version
}

resource "aws_lambda_function" "applicant_atlas_api" {
  function_name = "applicant_atlas_api"
  image_uri     = data.aws_ecr_image.lambda_image.image_uri
  role          = aws_iam_role.iam_for_lambda.arn
  package_type  = "Image"
  memory_size   = 128
  timeout       = 10

  environment {
    variables = local.combined_env_vars
  }

  depends_on = [aws_cloudwatch_log_group.lambda_log_group]
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_applicant_atlas_api_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      }
    ]
  })

  inline_policy {
    name = "lambda-logs"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect   = "Allow"
          Resource = "arn:aws:logs:*:*:*"
        }
      ]
    })
  }

  inline_policy {
    name = "sqs-permission"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "sqs:SendMessage",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl"
          ]
          Effect   = "Allow"
          Resource = var.sqs_queue_arn
        }
      ]
    })
  }
}

resource "aws_api_gateway_rest_api" "api" {
  name = "applicant_atlas_api_lambda_gateway"
}
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.applicant_atlas_api.invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.applicant_atlas_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*/*"
}

resource "aws_api_gateway_deployment" "api_deploy" {
  depends_on = [aws_api_gateway_integration.proxy_integration]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "v1"
}

module "cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.api.id
  api_resource_id = aws_api_gateway_resource.proxy.id
}

output "url" {
  value = "${aws_api_gateway_deployment.api_deploy.invoke_url}/v1/{proxy+}"
}
