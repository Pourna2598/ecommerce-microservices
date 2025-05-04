# E-commerce Microservices Deployment Guide

## Prerequisites

Before starting, ensure you have the following software installed:

1. **Docker Desktop**

    - Download from: https://www.docker.com/products/docker-desktop
    - After installation, verify with:
        ```bash
        docker --version
        docker-compose --version
        ```

2. **Minikube**

    - Download from: https://minikube.sigs.k8s.io/docs/start/
    - After installation, verify with:
        ```bash
        minikube version
        ```

3. **kubectl**

    - Download from: https://kubernetes.io/docs/tasks/tools/install-kubectl/
    - After installation, verify with:
        ```bash
        kubectl version
        ```

4. **Node.js 18+**
    - Download from: https://nodejs.org/
    - After installation, verify with:
        ```bash
        node --version
        npm --version
        ```

## Initial Setup

1. **Start Docker Desktop**

    - Open Docker Desktop
    - Wait until it shows "Docker is running" in the status bar

2. **Start Minikube**

    ```bash
    # Start Minikube with enough resources
    minikube start --memory=4096 --cpus=2

    # Verify Minikube is running
    minikube status
    ```

3. **Create Namespace**

    ```bash
    # Create the namespace for our application
    kubectl create namespace ecommerce

    # Verify namespace creation
    kubectl get namespaces
    ```

## Deployment Steps

### 1. Deploy MongoDB

MongoDB is our primary database. We'll deploy it first because other services depend on it.

1. **Create MongoDB Configuration**

    ```bash
    # Apply MongoDB configuration
    kubectl apply -f kubernetes/mongodb/secret.yaml
    kubectl apply -f kubernetes/mongodb/pvc.yaml
    kubectl apply -f kubernetes/mongodb/init-configmap.yaml
    ```

2. **Deploy MongoDB**

    ```bash
    # Deploy MongoDB
    kubectl apply -f kubernetes/mongodb/deployment.yaml
    kubectl apply -f kubernetes/mongodb/service.yaml
    ```

3. **Verify MongoDB Deployment**

    ```bash
    # Check if MongoDB pod is running
    kubectl get pods -n ecommerce -l app=mongodb

    # Expected output should show STATUS as "Running"
    # If you see "ContainerCreating" or "Pending", wait a few minutes
    # If you see "Error" or "CrashLoopBackOff", check the logs:
    kubectl logs -l app=mongodb -n ecommerce
    ```

4. **Wait for MongoDB to be Ready**

    ```bash
    # This command will wait until MongoDB is ready
    kubectl wait --for=condition=ready pod -l app=mongodb -n ecommerce --timeout=300s
    ```

5. **Verify MongoDB Initialization**

    ```bash
    # Check if admin user was created
    kubectl exec -it $(kubectl get pod -l app=mongodb -n ecommerce -o jsonpath='{.items[0].metadata.name}') -n ecommerce -- mongosh --eval "db = db.getSiblingDB('userdb'); db.users.findOne({email: 'admin@ecommerce.com'})"

    # Check if products were seeded
    kubectl exec -it $(kubectl get pod -l app=mongodb -n ecommerce -o jsonpath='{.items[0].metadata.name}') -n ecommerce -- mongosh --eval "db = db.getSiblingDB('productdb'); db.products.countDocuments()"
    ```

### 2. Deploy RabbitMQ

RabbitMQ is our message broker for service communication.

1. **Deploy RabbitMQ**

    ```bash
    kubectl apply -f kubernetes/rabbitmq/deployment.yaml
    kubectl apply -f kubernetes/rabbitmq/service.yaml
    ```

2. **Verify RabbitMQ Deployment**

    ```bash
    # Check if RabbitMQ pod is running
    kubectl get pods -n ecommerce -l app=rabbitmq

    # Wait for RabbitMQ to be ready
    kubectl wait --for=condition=ready pod -l app=rabbitmq -n ecommerce --timeout=300s
    ```

### 3. Build and Load Docker Images

For each service, we need to build and load its Docker image into Minikube.

1. **Build Images**

    ```bash
    # Build images for all services
    docker build -t user-service:1.0 ./user-service
    docker build -t product-service:1.0 ./product-service
    docker build -t order-service:1.0 ./order-service
    docker build -t payment-service:1.0 ./payment-service
    docker build -t notification-service:1.0 ./notification-service
    docker build -t api-gateway:1.0 ./api-gateway
    docker build -t ui:1.0 ./ui
    ```

2. **Load Images into Minikube**
    ```bash
    # Load all images into Minikube
    minikube image load user-service:1.0
    minikube image load product-service:1.0
    minikube image load order-service:1.0
    minikube image load payment-service:1.0
    minikube image load notification-service:1.0
    minikube image load api-gateway:1.0
    minikube image load ui:1.0
    ```

### 4. Deploy Services

Deploy services in the following order:

1. **Apply Secrets**

    ```bash
    # Apply secrets for all services
    kubectl apply -f user-service/kubernetes/secret.yaml
    kubectl apply -f product-service/kubernetes/secret.yaml
    kubectl apply -f order-service/kubernetes/secret.yaml
    kubectl apply -f payment-service/kubernetes/secret.yaml
    kubectl apply -f notification-service/kubernetes/secret.yaml
    kubectl apply -f api-gateway/kubernetes/secret.yaml
    kubectl apply -f ui/kubernetes/secret.yaml
    ```

2. **Deploy Services**

    ```bash
    # Deploy all services
    kubectl apply -f user-service/kubernetes/deployment.yaml
    kubectl apply -f user-service/kubernetes/service.yaml

    kubectl apply -f product-service/kubernetes/deployment.yaml
    kubectl apply -f product-service/kubernetes/service.yaml

    kubectl apply -f order-service/kubernetes/deployment.yaml
    kubectl apply -f order-service/kubernetes/service.yaml

    kubectl apply -f payment-service/kubernetes/deployment.yaml
    kubectl apply -f payment-service/kubernetes/service.yaml

    kubectl apply -f notification-service/kubernetes/deployment.yaml
    kubectl apply -f notification-service/kubernetes/service.yaml

    kubectl apply -f api-gateway/kubernetes/deployment.yaml
    kubectl apply -f api-gateway/kubernetes/service.yaml

    kubectl apply -f ui/kubernetes/deployment.yaml
    kubectl apply -f ui/kubernetes/service.yaml
    ```

3. **Verify Service Deployments**

    ```bash
    # Check if all pods are running
    kubectl get pods -n ecommerce

    # Wait for all pods to be ready
    kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s
    ```

### 5. Configure Ingress

1. **Enable Ingress**

    ```bash
    # Enable ingress in Minikube
    minikube addons enable ingress

    # Wait for ingress controller to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=nginx-ingress-controller -n ingress-nginx --timeout=300s
    ```

2. **Apply Ingress Configuration**

    ```bash
    kubectl apply -f kubernetes/ingress/ingress.yaml
    ```

3. **Get Ingress IP**

    ```bash
    # Get the ingress IP
    kubectl get ingress -n ecommerce

    # If you don't see an IP address, wait a few minutes and try again
    # It might take some time for the ingress controller to assign an IP
    ```

### 6. Access the Application

1. **Get the Application URL**

    ```bash
    # Get the ingress IP
    INGRESS_IP=$(kubectl get ingress -n ecommerce -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')

    # If the IP is not available, use Minikube IP
    if [ -z "$INGRESS_IP" ]; then
      INGRESS_IP=$(minikube ip)
    fi

    echo "Application is available at: http://$INGRESS_IP"
    ```

2. **Default Login Credentials**
    - Email: admin@ecommerce.com
    - Password: admin

## Troubleshooting

### Common Issues and Solutions

1. **Pod in CrashLoopBackOff**

    ```bash
    # Check pod logs
    kubectl logs <pod-name> -n ecommerce

    # Check pod description
    kubectl describe pod <pod-name> -n ecommerce
    ```

2. **Service Not Accessible**

    ```bash
    # Check service endpoints
    kubectl get endpoints -n ecommerce

    # Check service description
    kubectl describe service <service-name> -n ecommerce
    ```

3. **MongoDB Connection Issues**

    ```bash
    # Check MongoDB pod status
    kubectl get pods -n ecommerce -l app=mongodb

    # Check MongoDB logs
    kubectl logs -l app=mongodb -n ecommerce

    # Check MongoDB service
    kubectl get svc -n ecommerce mongodb
    ```

4. **RabbitMQ Connection Issues**

    ```bash
    # Check RabbitMQ pod status
    kubectl get pods -n ecommerce -l app=rabbitmq

    # Check RabbitMQ logs
    kubectl logs -l app=rabbitmq -n ecommerce
    ```

5. **Ingress Not Working**

    ```bash
    # Check ingress status
    kubectl describe ingress -n ecommerce

    # Check ingress controller logs
    kubectl logs -l app.kubernetes.io/name=nginx-ingress-controller -n ingress-nginx
    ```

### Rollback Instructions

If something goes wrong, you can rollback the deployment:

1. **Rollback a Deployment**

    ```bash
    # Rollback to previous version
    kubectl rollout undo deployment/<service-name> -n ecommerce
    ```

2. **Delete and Redeploy**

    ```bash
    # Delete all resources
    kubectl delete namespace ecommerce

    # Start over from the beginning
    ```

## Cleanup

To remove the entire application:

1. **Delete All Resources**

    ```bash
    # Delete the namespace (this will delete everything in it)
    kubectl delete namespace ecommerce
    ```

2. **Remove Images**

    ```bash
    # Remove images from Minikube
    minikube image rm user-service:1.0
    minikube image rm product-service:1.0
    minikube image rm order-service:1.0
    minikube image rm payment-service:1.0
    minikube image rm notification-service:1.0
    minikube image rm api-gateway:1.0
    minikube image rm ui:1.0
    ```

3. **Stop Minikube**
    ```bash
    minikube stop
    ```

## Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at the logs of the specific service
3. Open an issue in the repository
4. Contact the development team

## License

MIT License
