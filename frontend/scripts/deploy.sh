#!/bin/bash

# Raspberry Pi Deployment Script for Kismet Camera Detector
# This script builds and deploys the application on Raspberry Pi

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="kismet-camera-detector"
DOCKER_REGISTRY="localhost"
VERSION=${1:-latest}

echo -e "${BLUE}🐳 Kismet Camera Detector - Raspberry Pi Deployment${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Raspberry Pi
check_raspberry_pi() {
    print_status "Checking system compatibility..."

    if [ -f /proc/device-tree/model ]; then
        MODEL=$(cat /proc/device-tree/model)
        if [[ $MODEL == *"Raspberry Pi"* ]]; then
            print_status "✓ Detected Raspberry Pi: $MODEL"
        else
            print_warning "Not running on Raspberry Pi: $MODEL"
        fi
    fi

    # Check architecture
    ARCH=$(uname -m)
    if [ "$ARCH" == "aarch64" ] || [ "$ARCH" == "armv7l" ]; then
        print_status "✓ ARM architecture detected: $ARCH"
    else
        print_warning "Non-ARM architecture detected: $ARCH"
    fi
}

# Check Docker installation
check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo "Please install Docker first:"
        echo "curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "sudo sh get-docker.sh"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        echo "Please install Docker Compose first:"
        echo "sudo pip3 install docker-compose"
        exit 1
    fi

    print_status "✓ Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    mkdir -p data
    mkdir -p logs
    mkdir -p docker/ssl

    print_status "✓ Directories created"
}

# Check environment configuration
check_environment() {
    print_status "Checking environment configuration..."

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            print_warning ".env file not found, creating from .env.example"
            cp .env.example .env
            print_warning "Please edit .env file with your Kismet server configuration"
            echo "Required settings:"
            echo "- KISMET_HOST: Your Kismet server IP"
            echo "- KISMET_PORT: Kismet server port (default: 2501)"
            echo "- KISMET_API_KEY: Your Kismet API key"
            read -p "Press Enter to continue after editing .env file..."
        else
            print_error ".env.example file not found!"
            exit 1
        fi
    fi

    print_status "✓ Environment configuration checked"
}

# Build Docker image
build_image() {
    print_status "Building Docker image for ARM64..."

    # Build for specific platform based on architecture
    ARCH=$(uname -m)
    PLATFORM="linux/arm64"

    if [ "$ARCH" == "x86_64" ]; then
        PLATFORM="linux/amd64"
    fi

    docker build --platform "$PLATFORM" -t "${PROJECT_NAME}:${VERSION}" .

    print_status "✓ Docker image built successfully"
}

# Deploy application
deploy() {
    print_status "Deploying application..."

    # Stop existing containers
    docker-compose down 2>/dev/null || true

    # Start new containers
    if [ "$1" == "with-nginx" ]; then
        print_status "Starting with Nginx reverse proxy..."
        docker-compose --profile with-nginx up -d
    else
        print_status "Starting standalone application..."
        docker-compose up -d
    fi

    print_status "✓ Application deployed successfully"
}

# Health check
health_check() {
    print_status "Performing health check..."

    # Wait for application to start
    sleep 10

    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_status "✓ Application is healthy and responding"
    else
        print_error "Health check failed!"
        print_status "Checking container logs..."
        docker-compose logs camera-detector
        exit 1
    fi
}

# Show deployment information
show_info() {
    print_status "Deployment completed successfully!"
    echo ""
    echo "Application Information:"
    echo "- Web Interface: http://localhost:3000"
    echo "- Health Check: http://localhost:3000/api/health"
    echo "- Logs: docker-compose logs -f camera-detector"
    echo "- Stop: docker-compose down"
    echo ""
    echo "To monitor from other devices:"
    echo "1. Ensure PORT=3000 is accessible from your network"
    echo "2. Configure firewall if needed"
    echo "3. Access via: http://[YOUR_PI_IP]:3000"
}

# Main deployment flow
main() {
    echo ""
    check_raspberry_pi
    echo ""
    check_docker
    echo ""
    create_directories
    echo ""
    check_environment
    echo ""
    build_image
    echo ""
    deploy "$1"
    echo ""
    health_check
    echo ""
    show_info
}

# Handle script arguments
case "${1:-}" in
    "with-nginx")
        main "with-nginx"
        ;;
    "build-only")
        check_docker
        create_directories
        build_image
        print_status "Build completed. Use './scripts/deploy.sh' to deploy."
        ;;
    "stop")
        print_status "Stopping application..."
        docker-compose down
        print_status "✓ Application stopped"
        ;;
    "logs")
        docker-compose logs -f camera-detector
        ;;
    "health")
        curl -f http://localhost:3000/api/health || echo "Application is not responding"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  (no args)    Deploy application standalone"
        echo "  with-nginx   Deploy with Nginx reverse proxy"
        echo "  build-only   Build Docker image without deploying"
        echo "  stop         Stop running application"
        echo "  logs         Show application logs"
        echo "  health       Check application health"
        echo "  help         Show this help message"
        ;;
    *)
        main
        ;;
esac