# Kismet Camera Detector - Installation Guide

## Overview

The Kismet Camera Detector is a Next.js web application that provides real-time WiFi camera detection and interference analysis. This guide will help you deploy it using Docker on any system, including Raspberry Pi.

## Requirements

### System Requirements
- **Raspberry Pi**: Raspberry Pi 4B+ (4GB RAM recommended) or greater
- **Docker**: Version 20.10+ with Docker Compose
- **Network**: Access to Kismet server on the same network
- **Storage**: Minimum 8GB SD card, 16GB recommended

### Software Requirements
- Docker Engine
- Docker Compose
- Git (for cloning the repository)

## Quick Start (Raspberry Pi)

### 1. Install Docker on Raspberry Pi

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo pip3 install docker-compose

# Reboot to apply group changes
sudo reboot
```

### 2. Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/dearxcorex/find_cam.git
cd find_cam/frontend

# Copy environment configuration
cp .env.example .env

# Edit the configuration file
nano .env

# Deploy the application
./scripts/deploy.sh
```

### 3. Configure Environment

Edit `.env` file with your settings:

```bash
# Kismet Server Configuration
KISMET_HOST=http://192.168.0.128  # Your Kismet server IP
KISMET_PORT=2501                  # Kismet server port
KISMET_API_KEY=your_api_key_here   # Your Kismet API key

# Application Settings
PORT=3000                         # Application port
NODE_ENV=production              # Environment mode
```

## Detailed Installation

### Step 1: Prepare the System

#### For Raspberry Pi:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl

# Enable SSH (optional, for remote management)
sudo systemctl enable ssh
sudo systemctl start ssh
```

#### For Other Systems (Linux/macOS/Windows):
```bash
# Install Docker (https://docs.docker.com/get-docker/)
# Install Docker Compose (https://docs.docker.com/compose/install/)

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone the Repository

```bash
# Clone the project
git clone https://github.com/dearxcorex/find_cam.git
cd find_cam/frontend

# Create necessary directories
mkdir -p data logs docker/ssl
```

### Step 3: Configure the Application

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Important Configuration Options:**

| Variable | Description | Example |
|----------|-------------|---------|
| `KISMET_HOST` | Kismet server IP address | `http://192.168.0.128` |
| `KISMET_PORT` | Kismet server port | `2501` |
| `KISMET_API_KEY` | Kismet API authentication key | `EBE296C5407BC8C834F8F85FDE63711F` |
| `PORT` | Application port | `3000` |
| `NODE_OPTIONS` | Node.js memory settings | `--max-old-space-size=512` |

### Step 4: Deploy the Application

#### Option A: Standalone Deployment (Recommended for Pi)
```bash
# Deploy without reverse proxy
./scripts/deploy.sh
```

#### Option B: With Nginx Reverse Proxy
```bash
# Deploy with Nginx (for production)
./scripts/deploy.sh with-nginx
```

#### Option C: Manual Docker Deployment
```bash
# Build the image
docker build --platform linux/arm64 -t kismet-camera-detector .

# Run with Docker Compose
docker-compose up -d

# Or run with Docker directly
docker run -d \
  --name kismet-camera-detector \
  -p 3000:3000 \
  --env-file .env \
  kismet-camera-detector
```

## Accessing the Application

### Local Access
- **Web Interface**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### Remote Access
To access from other devices on your network:

1. **Find your Raspberry Pi IP**:
   ```bash
   hostname -I
   ```

2. **Access via browser**:
   ```
   http://[YOUR_PI_IP]:3000
   ```

3. **Configure firewall** (if needed):
   ```bash
   # Allow traffic on port 3000
   sudo ufw allow 3000
   ```

## SSL/HTTPS Setup (Optional)

### Option 1: Self-Signed Certificate
```bash
# Create SSL directory
mkdir -p docker/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Deploy with Nginx and SSL
./scripts/deploy.sh with-nginx
```

### Option 2: Let's Encrypt (for domains)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem

# Set proper permissions
sudo chown $USER:$USER docker/ssl/*.pem
```

## Management Commands

### Using Deployment Script
```bash
# Deploy application
./scripts/deploy.sh

# Deploy with Nginx
./scripts/deploy.sh with-nginx

# Stop application
./scripts/deploy.sh stop

# View logs
./scripts/deploy.sh logs

# Health check
./scripts/deploy.sh health

# Build only (no deployment)
./scripts/deploy.sh build-only
```

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f camera-detector

# Restart services
docker-compose restart camera-detector

# Update application
git pull
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### 1. Application Not Responding
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs camera-detector

# Check health endpoint
curl http://localhost:3000/api/health
```

#### 2. Memory Issues on Raspberry Pi
```bash
# Monitor memory usage
free -h

# Check Docker resource usage
docker stats

# Reduce Node.js memory limit in .env
NODE_OPTIONS=--max-old-space-size=256
```

#### 3. Kismet Connection Issues
```bash
# Test Kismet connectivity
curl http://192.168.0.128:2501/system/status.json?KISMET=your_api_key

# Check network connectivity
ping 192.168.0.128

# Verify API key in .env file
grep KISMET_API_KEY .env
```

#### 4. Port Conflicts
```bash
# Check port usage
sudo netstat -tlnp | grep :3000

# Change port in .env
PORT=3001
```

#### 5. Docker Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Performance Optimization

#### For Raspberry Pi:
1. **Increase swap space**:
   ```bash
   sudo dphys-swapfile swapoff
   sudo sed -i 's/CONF_SWAPSIZE=100/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile
   sudo dphys-swapfile swapon
   ```

2. **Overclock Pi** (in `/boot/config.txt`):
   ```
   arm_freq=1500
   gpu_freq=500
   over_voltage=2
   ```

3. **Use zram**:
   ```bash
   sudo apt install zram-config
   sudo reboot
   ```

## Security Considerations

1. **Change Default Passwords**: Update Raspberry Pi default password
2. **Firewall Configuration**: Configure UFW or iptables
3. **VPN Access**: Consider VPN for remote access
4. **SSL/TLS**: Use HTTPS for production deployments
5. **Regular Updates**: Keep system and Docker updated

## Next Steps

After successful installation:

1. **Test the Interface**: Access the web interface and verify functionality
2. **Configure Kismet**: Ensure proper connection to your Kismet server
3. **Set Up Monitoring**: Configure remote access from your monitoring devices
4. **Backup Configuration**: Save your `.env` file and configuration
5. **Schedule Updates**: Set up automated updates for maintenance

## Support

For issues and support:
- GitHub Issues: https://github.com/dearxcorex/find_cam/issues
- Documentation: Check the `/docs` directory for additional guides
- Health Check: http://your-pi-ip:3000/api/health