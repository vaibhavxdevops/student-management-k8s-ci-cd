output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "region" {
  value = var.region
}

output "update_kubeconfig_command" {
  description = "Run this (in CloudShell or anywhere with kubectl) to connect to the cluster"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.main.name}"
}