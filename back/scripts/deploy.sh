#!/bin/bash

set -e

NAMESPACE="odri-system"

echo "🚀 Starting deployment of ODRI WiFi Billing System..."

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
  echo "📦 Creating namespace: $NAMESPACE"
  kubectl create namespace "$NAMESPACE"
fi

echo "🔐 Applying secrets..."
kubectl apply -f k8s/secret.yaml --namespace=$NAMESPACE

echo "⚙️ Applying config map..."
kubectl apply -f k8s/configmap.yaml --namespace=$NAMESPACE

echo "🧱 Applying service..."
kubectl apply -f k8s/service.yaml --namespace=$NAMESPACE

echo "📦 Applying deployment..."
kubectl apply -f k8s/deployment.yaml --namespace=$NAMESPACE

echo "🌐 Applying ingress..."
kubectl apply -f k8s/ingress.yaml --namespace=$NAMESPACE

echo "✅ Deployment complete!"
kubectl get all -n $NAMESPACE
