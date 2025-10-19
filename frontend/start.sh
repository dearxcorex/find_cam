#!/bin/bash

# Kismet Camera Detector Start Script
# This script helps you start the application with either Docker or Podman

echo "🎯 Kismet Camera Detector Startup"
echo "================================="

# Check if docker or podman is available
if command -v podman &> /dev/null; then
    echo "✅ Podman found"
    CONTAINER_ENGINE="podman"
elif command -v docker &> /dev/null; then
    echo "✅ Docker found"
    CONTAINER_ENGINE="docker"
else
    echo "❌ Neither Docker nor Podman found. Please install one of them first."
    exit 1
fi

echo "🚀 Using container engine: $CONTAINER_ENGINE"

# Function to start with Docker
start_with_docker() {
    echo "🐳 Starting with Docker..."
    docker-compose up -d
    echo "✅ Application started with Docker"
    echo "🌐 Available at: http://localhost:3000"
}

# Function to start with Podman
start_with_podman() {
    echo "🐘 Starting with Podman..."
    # Try podman-compose first, then fall back to podman compose
    if command -v podman-compose &> /dev/null; then
        podman-compose -f docker-compose.podman.yml up -d
    elif podman compose version &> /dev/null; then
        podman compose -f docker-compose.podman.yml up -d
    else
        echo "⚠️  Podman compose not found. Please install podman-compose or use Podman 4.0+ with native compose."
        echo "📖 Alternative: Use 'npm run dev' for local development"
        return 1
    fi
    echo "✅ Application started with Podman"
    echo "🌐 Available at: http://localhost:3000"
}

# Main execution
if [ "$CONTAINER_ENGINE" = "podman" ]; then
    start_with_podman
else
    start_with_docker
fi

echo ""
echo "📋 Useful commands:"
echo "  Stop:     $CONTAINER_ENGINE-compose down"
echo "  Logs:     $CONTAINER_ENGINE-compose logs -f"
echo "  Status:   $CONTAINER_ENGINE-compose ps"

if [ "$CONTAINER_ENGINE" = "podman" ]; then
    echo "  Use podman-compose -f docker-compose.podman.yml for Podman commands"
fi

echo ""
echo "🔍 API Key: 611D867A37D3155BF28FC36A790E412C"
echo "📖 Documentation: Check README.md for setup instructions"