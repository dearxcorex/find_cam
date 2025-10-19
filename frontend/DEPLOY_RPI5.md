# Raspberry Pi 5 Deployment Guide

## 🍓 Overview
This guide provides optimized deployment instructions for running the Kismet Camera Detector on a Raspberry Pi 5.

## 🚀 Quick Start

### Prerequisites
- Raspberry Pi 5 (recommended 8GB RAM model)
- Raspberry Pi OS (64-bit recommended)
- Docker & Docker Compose installed
- At least 16GB SD card or external storage

### One-Command Deployment
```bash
# Clone and deploy
git clone <your-repo-url>
cd <repo-directory>/frontend
docker-compose -f docker-compose.rpi5.yml up -d
```

## 📋 Pre-Deployment Setup

### 1. Update Raspberry Pi OS
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker (if not already installed)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Reboot to apply changes
sudo reboot
```

### 3. Enable 64-bit Kernel (Recommended)
For better performance, ensure you're running the 64-bit kernel:
```bash
uname -m
# Should show "aarch64" for 64-bit, "armv7l" for 32-bit
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `frontend` directory:
```bash
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
```

### Raspberry Pi 5 Specific Optimizations
The `docker-compose.rpi5.yml` includes:

- **Memory**: 2GB limit (optimized for 8GB RAM Pi 5)
- **CPU**: 2 cores allocated (of 4 available)
- **Cache**: Dedicated volumes for better I/O performance
- **Health Checks**: Longer timeouts suitable for ARM architecture
- **Startup**: Extended grace period for slower ARM boot

## 🚀 Deployment Steps

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd <repository-name>/frontend
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your configuration
```

### 3. Create Required Directories
```bash
mkdir -p data logs docker/tmp/kismet-cache
```

### 4. Deploy Application
```bash
# Build and start with RPi5 optimizations
docker-compose -f docker-compose.rpi5.yml up -d --build
```

### 5. Verify Deployment
```bash
# Check container status
docker-compose -f docker-compose.rpi5.yml ps

# Check logs
docker-compose -f docker-compose.rpi5.yml logs -f

# Test application
curl http://localhost:3000/api/health
```

## 📊 Performance Monitoring

### Monitor Resource Usage
```bash
# System resources
htop

# Docker stats
docker stats

# Container-specific logs
docker-compose -f docker-compose.rpi5.yml logs camera-detector
```

### Performance Optimizations Applied

#### Memory Management
- **Node.js**: Limited to 1GB heap size
- **Container**: 2GB memory limit
- **Cache**: Dedicated volume for Next.js cache

#### CPU Optimization
- **Allocation**: 2 of 4 CPU cores
- **Worker Processes**: Optimized for ARM64
- **Priority**: Balanced for background operation

#### I/O Performance
- **Volumes**: Local disk I/O optimized
- **Cache Strategy**: Persistent cache for Next.js
- **Logging**: Structured logging for better performance

## 🔒 Security Considerations

### 1. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Application (if not using nginx)
sudo ufw enable
```

### 2. Docker Security
```bash
# Run containers as non-root (already configured)
# Use read-only filesystems where possible
# Regular security updates
sudo apt update && sudo apt upgrade -y
```

### 3. Application Security
- API key is configured via environment variables
- HTTPS termination via nginx (optional)
- No sensitive data in container images

## 🛠️ Maintenance

### Regular Updates
```bash
# Update application
git pull
docker-compose -f docker-compose.rpi5.yml up -d --build

# Update Docker images
docker-compose -f docker-compose.rpi5.yml pull
docker-compose -f docker-compose.rpi5.yml up -d
```

### Backup Configuration
```bash
# Backup data directory
sudo tar -czf kismet-backup-$(date +%Y%m%d).tar.gz data/ logs/

# Backup environment configuration
cp .env .env.backup
```

### Log Management
```bash
# Rotate logs (add to crontab)
0 2 * * * docker-compose -f /path/to/docker-compose.rpi5.yml logs --no-log-prefix > /path/to/logs/backup-$(date +\%Y\%m\%d).log 2>&1
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check Docker service
sudo systemctl status docker

# Check available memory
free -h

# Check disk space
df -h

# Check container logs
docker-compose -f docker-compose.rpi5.yml logs camera-detector
```

#### Performance Issues
```bash
# Check CPU usage
top

# Check memory usage
free -h

# Check container resources
docker stats

# Restart if needed
docker-compose -f docker-compose.rpi5.yml restart
```

#### Network Issues
```bash
# Check network connectivity
ping 8.8.8.8

# Check port availability
netstat -tlnp | grep :3000

# Check Docker networks
docker network ls
```

### Emergency Recovery
```bash
# Stop all services
docker-compose -f docker-compose.rpi5.yml down

# Remove containers (preserve data)
docker-compose -f docker-compose.rpi5.yml rm -f

# Clean up unused images
docker image prune -f

# Restart services
docker-compose -f docker-compose.rpi5.yml up -d
```

## 📈 Scaling Considerations

### Multiple Pis Setup
For improved performance, consider running multiple instances:
```bash
# On each Pi, use different ports
PI1_PORT=3000 docker-compose -f docker-compose.rpi5.yml up -d
PI2_PORT=3001 docker-compose -f docker-compose.rpi5.yml up -d
```

### Load Balancing
Use nginx or HAProxy for load balancing across multiple Pis.

## 🎯 Next Steps

1. **Monitor**: Set up monitoring tools (Prometheus/Grafana)
2. **Alerts**: Configure alerts for system health
3. **Backups**: Automate regular backups
4. **Updates**: Set up automated security updates
5. **Performance**: Fine-tune based on actual usage patterns

## 📞 Support

For issues related to:
- **Application**: Check GitHub Issues
- **Docker on Pi**: Refer to Docker documentation
- **Raspberry Pi**: Refer to Raspberry Pi documentation
- **Kismet**: Refer to Kismet documentation

---

**Note**: This configuration is specifically optimized for Raspberry Pi 5. For other Raspberry Pi models, use the standard `docker-compose.yml` file.