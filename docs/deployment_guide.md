# Deployment Guide - Hockey Live App

## Overview

This guide covers deploying the Hockey Live App to production environments, including cloud infrastructure setup, containerization, CI/CD pipelines, and monitoring configuration.

## Prerequisites

- AWS Account with appropriate permissions
- Docker and Docker Compose installed
- Terraform >= 1.0
- kubectl for Kubernetes management
- GitHub repository with CI/CD access

## Infrastructure Setup

### 1. AWS Infrastructure with Terraform

**main.tf**
```hcl
# Provider configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "hockey-live-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "hockey-live-vpc"
    Environment = "production"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "hockey-live-public-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "hockey-live-private-${count.index + 1}"
    Type = "private"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "hockey-live-igw"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "hockey-live-cluster"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
  
  tags = {
    Name = "hockey-live-cluster"
    Environment = "production"
  }
}

# RDS Aurora PostgreSQL
resource "aws_rds_cluster" "postgres" {
  cluster_identifier      = "hockey-live-db"
  engine                 = "aurora-postgresql"
  engine_version         = "15.3"
  database_name          = "hockey_live"
  master_username        = "admin"
  master_password        = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "hockey-live-final-snapshot"
  
  tags = {
    Name = "hockey-live-database"
    Environment = "production"
  }
}

# S3 Bucket for Video Storage
resource "aws_s3_bucket" "videos" {
  bucket = "hockey-live-videos-${random_string.bucket_suffix.result}"
  
  tags = {
    Name = "hockey-live-videos"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "videos" {
  bucket = aws_s3_bucket.videos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "videos" {
  bucket = aws_s3_bucket.videos.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "videos" {
  origin {
    domain_name = aws_s3_bucket.videos.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.videos.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.videos.cloudfront_access_identity_path
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.videos.id}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name = "hockey-live-cdn"
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "hockey-live-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "hockey-live-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
  
  tags = {
    Name = "hockey-live-redis"
    Environment = "production"
  }
}
```

### 2. Application Load Balancer

**load_balancer.tf**
```hcl
# Application Load Balancer
resource "aws_lb" "main" {
  name               = "hockey-live-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = false
  
  tags = {
    Name = "hockey-live-alb"
    Environment = "production"
  }
}

# Target Group for API
resource "aws_lb_target_group" "api" {
  name     = "hockey-live-api-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }
  
  tags = {
    Name = "hockey-live-api-target-group"
  }
}

# Listener
resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# HTTPS Listener (if SSL certificate is available)
resource "aws_lb_listener" "api_https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.ssl_certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}
```

### 3. Security Groups

**security_groups.tf**
```hcl
# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "hockey-live-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "hockey-live-alb-sg"
  }
}

# ECS Security Group
resource "aws_security_group" "ecs_tasks" {
  name        = "hockey-live-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "hockey-live-ecs-tasks-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "hockey-live-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  
  tags = {
    Name = "hockey-live-rds-sg"
  }
}
```

## Containerization

### 1. Docker Configuration

**Dockerfile**
```dockerfile
# Multi-stage build for Python FastAPI app
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml** (for local development)
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/hockey_live
      - REDIS_URL=redis://redis:6379
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=hockey_live
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 2. ECS Task Definition

**task_definition.json**
```json
{
  "family": "hockey-live-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hockey-live-api:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:hockey-live/database-url"
        },
        {
          "name": "JWT_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:hockey-live/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hockey-live-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

## CI/CD Pipeline

### 1. GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: hockey-live-api
  ECS_SERVICE: hockey-live-api
  ECS_CLUSTER: hockey-live-cluster
  ECS_TASK_DEFINITION: .aws/task_definition.json

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-asyncio
    
    - name: Run tests
      run: |
        pytest tests/ -v
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        JWT_SECRET_KEY: test-secret-key

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Fill in the new image ID in the Amazon ECS task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: ${{ env.ECS_TASK_DEFINITION }}
        container-name: api
        image: ${{ steps.build-image.outputs.image }}

    - name: Deploy Amazon ECS task definition
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: ${{ env.ECS_SERVICE }}
        cluster: ${{ env.ECS_CLUSTER }}
        wait-for-service-stability: true

  migrate:
    needs: deploy
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Run database migrations
      run: |
        # Run migrations using ECS task
        aws ecs run-task \
          --cluster ${{ env.ECS_CLUSTER }} \
          --task-definition hockey-live-migrate \
          --launch-type FARGATE \
          --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### 2. Database Migration Task

**migrate_task_definition.json**
```json
{
  "family": "hockey-live-migrate",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "migrate",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hockey-live-api:latest",
      "command": ["alembic", "upgrade", "head"],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:hockey-live/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hockey-live-migrate",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Environment Configuration

### 1. Environment Variables

**Production Environment (.env.production)**
```bash
# Application
ENV=production
DEBUG=False
APP_NAME=Hockey Live API
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://admin:${DB_PASSWORD}@hockey-live-db.cluster-xyz.us-east-1.rds.amazonaws.com:5432/hockey_live

# Redis
REDIS_URL=redis://hockey-live-redis.xyz.cache.amazonaws.com:6379

# JWT
JWT_SECRET_KEY=${JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=hockey-live-videos-prod
AWS_CLOUDFRONT_DOMAIN=cdn.hockeylive.app

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=${SMTP_USERNAME}
SMTP_PASSWORD=${SMTP_PASSWORD}

# Video Processing
MAX_VIDEO_SIZE_MB=1000
SUPPORTED_VIDEO_FORMATS=mp4,mov,avi
VIDEO_PROCESSING_TIMEOUT=1800

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=INFO
```

### 2. AWS Secrets Manager

**secrets.tf**
```hcl
# Database Password
resource "aws_secretsmanager_secret" "db_password" {
  name = "hockey-live/database-password"
  
  tags = {
    Name = "hockey-live-db-password"
    Environment = "production"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "hockey-live/jwt-secret"
  
  tags = {
    Name = "hockey-live-jwt-secret"
    Environment = "production"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret_key
}
```

## Monitoring and Logging

### 1. CloudWatch Configuration

**monitoring.tf**
```hcl
# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/hockey-live-api"
  retention_in_days = 7
  
  tags = {
    Name = "hockey-live-ecs-logs"
    Environment = "production"
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "hockey-live-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.api.name
    ClusterName = aws_ecs_cluster.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "hockey-live-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.api.name
    ClusterName = aws_ecs_cluster.main.name
  }
}
```

### 2. Application Monitoring

**monitoring_config.py**
```python
import logging
from pythonjsonlogger import jsonlogger
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# Configure structured logging
def setup_logging():
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
    logHandler.setFormatter(formatter)
    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)

# Configure Sentry for error tracking
def setup_sentry():
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1,
        environment=os.getenv('ENV', 'production')
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv('APP_VERSION', '1.0.0')
    }
```

## SSL/TLS Configuration

### 1. ACM Certificate

**ssl.tf**
```hcl
# ACM Certificate
resource "aws_acm_certificate" "main" {
  domain_name       = "api.hockeylive.app"
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "hockey-live-api-cert"
    Environment = "production"
  }
}

# Certificate Validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
```

## Backup and Recovery

### 1. RDS Backup Configuration

**backup.tf**
```hcl
# RDS Backup
resource "aws_rds_cluster" "postgres" {
  # ... other configuration
  
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  copy_tags_to_snapshot   = true
  
  # Enable automated backup to S3
  enable_cloudwatch_logs_exports = ["postgresql"]
}

# S3 Backup Bucket
resource "aws_s3_bucket" "backups" {
  bucket = "hockey-live-backups-${random_string.bucket_suffix.result}"
  
  tags = {
    Name = "hockey-live-backups"
    Environment = "production"
  }
}

# Backup Lambda Function
resource "aws_lambda_function" "backup" {
  filename         = "backup.zip"
  function_name    = "hockey-live-backup"
  role            = aws_iam_role.backup_lambda.arn
  handler         = "backup.lambda_handler"
  runtime         = "python3.9"
  timeout         = 300
  
  tags = {
    Name = "hockey-live-backup"
    Environment = "production"
  }
}
```

## Deployment Commands

### 1. Initial Deployment

```bash
# 1. Deploy infrastructure
cd terraform/
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"

# 2. Build and push Docker image
docker build -t hockey-live-api .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag hockey-live-api:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hockey-live-api:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hockey-live-api:latest

# 3. Deploy ECS service
aws ecs create-service --cli-input-json file://ecs-service.json

# 4. Run database migrations
aws ecs run-task --cluster hockey-live-cluster --task-definition hockey-live-migrate --launch-type FARGATE
```

### 2. Rolling Updates

```bash
# Update task definition with new image
aws ecs update-service --cluster hockey-live-cluster --service hockey-live-api --force-new-deployment

# Monitor deployment
aws ecs wait services-stable --cluster hockey-live-cluster --services hockey-live-api
```

### 3. Rollback Procedures

```bash
# Rollback to previous task definition
aws ecs update-service --cluster hockey-live-cluster --service hockey-live-api --task-definition hockey-live-api:PREVIOUS_REVISION

# Rollback database migration
docker run --rm -e DATABASE_URL="$DATABASE_URL" hockey-live-api:previous alembic downgrade -1
```

This deployment guide provides a comprehensive approach to deploying the Hockey Live App in a production environment with proper security, monitoring, and backup procedures.