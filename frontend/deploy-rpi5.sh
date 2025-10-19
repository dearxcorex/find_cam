#!/bin/bash

# Raspberry Pi 5 Quick Deployment Script
# This script handles the complete deployment process for RPi5

echo "🍓 Kismet Camera Detector - Raspberry Pi 5 Deployment"
echo "===================================================="

# Check if running on Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "⚠️  Warning: This script is optimized for Raspberry Pi 5"
    echo "   You can continue, but some optimizations may not apply"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please reboot and run this script again."
    exit 0
fi

echo "✅ Docker found: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install docker-compose-plugin"
    exit 1
fi

echo "✅ Docker Compose found"

# Create required directories
echo "📁 Creating required directories..."
mkdir -p data logs cache

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Application Configuration
NODE_ENV=production
PORT=3000

# Kismet Configuration
KISMET_HOST=http://192.168.0.128
KISMET_PORT=2501
KISMET_API_KEY=611D867A37D3155BF28FC36A790E412C

# Performance Tuning for RPi5
NODE_OPTIONS=--max-old-space-size=1024
NEXT_TELEMETRY_DISABLED=1
NEXT_MINIMIZE=true

# Optional: Nginx Reverse Proxy
HTTP_PORT=80
HTTPS_PORT=443
EOF
    echo "✅ .env file created. Please edit it with your specific configuration."
    echo "   Current Kismet host: http://192.168.0.128:2501"
    echo "   Current API key: 611D867A37D3155BF28FC36A790E412C"
    read -p "Press Enter to continue or Ctrl+C to edit .env file first..."
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.rpi5.yml down 2>/dev/null || true

# Pull latest updates if in git repository
if [ -d .git ]; then
    echo "📥 Pulling latest updates..."
    git pull origin main
fi

# Build and deploy
echo "🚀 Building and deploying application..."
docker-compose -f docker-compose.rpi5.yml up -d --build

# Wait for container to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if container is running
if docker-compose -f docker-compose.rpi5.yml ps | grep -q "Up"; then
    echo "✅ Application successfully deployed!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Direct access: http://$(hostname -I | awk '{print $1}'):3000"
    echo "   Local access: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:     docker-compose -f docker-compose.rpi5.yml logs -f"
    echo "   Check status:  docker-compose -f docker-compose.rpi5.yml ps"
    echo "   Stop:         docker-compose -f docker-compose.rpi5.yml down"
    echo "   Restart:      docker-compose -f docker-compose.rpi5.yml restart"
    echo ""
    echo "🔍 Testing connection..."
    sleep 5
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Health check passed - Application is responding!"
    else
        echo "⚠️  Health check failed - Check logs for troubleshooting"
        echo "   Command: docker-compose -f docker-compose.rpi5.yml logs camera-detector"
    fi
else
    echo "❌ Deployment failed. Container is not running."
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   Check logs: docker-compose -f docker-compose.rpi5.yml logs"
    echo "   Check status: docker-compose -f docker-compose.rpi5.yml ps"
    echo "   Check Docker: docker system info"
    exit 1
fi

echo ""
echo "🎉 Deployment complete! Your Kismet Camera Detector is now running on your Raspberry Pi 5."