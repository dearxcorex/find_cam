# Raspberry Pi Deployment Guide

## Overview

This guide provides specific instructions for deploying the Kismet Camera Detector on Raspberry Pi hardware, optimized for performance and resource management.

## Supported Raspberry Pi Models

### Recommended Models
- **Raspberry Pi 4B** (4GB RAM or 8GB RAM) - Recommended
- **Raspberry Pi 400** - Excellent performance
- **Raspberry Pi 5** - Latest generation with best performance

### Compatible Models (with limitations)
- **Raspberry Pi 4B** (2GB RAM) - May require memory optimization
- **Raspberry Pi 3B+** - Slower performance, may struggle with large device lists

## Hardware Requirements

### Minimum Requirements
- Raspberry Pi 4B (2GB RAM)
- 16GB High-Speed microSD card (Class 10/U1)
- Ethernet connection or WiFi
- Power supply (3A for Pi 4, 2.5A for Pi 3)

### Recommended Setup
- Raspberry Pi 4B (4GB RAM)
- 32GB High-Speed microSD card (Class 10/U3 A2)
- Gigabit Ethernet connection
- Official Raspberry Pi 4 power supply (3A, 5V)
- Case with cooling (fan or heatsink)

## Preparing Raspberry Pi

### 1. Install Raspberry Pi OS

```bash
# Download Raspberry Pi Imager
# Use 64-bit Raspberry Pi OS Lite for better performance
# Enable SSH and set user credentials during imaging

# After first boot, update system
sudo apt update && sudo apt upgrade -y
```

### 2. Configure System Settings

```bash
# Open Raspberry Pi configuration
sudo raspi-config

# Recommended settings:
# - System Options -> Boot/Auto Login: Console Autologin
# - Performance Options -> GPU Memory: 16MB
# - Advanced Options -> Expand Filesystem
# - Advanced Options -> SSH: Enable
# - Localisation Options -> Timezone: Set your timezone
```

### 3. Optimize for Performance

```bash
# Edit boot configuration
sudo nano /boot/config.txt

# Add these lines for Pi 4 optimization:
arm_freq=1500
gpu_freq=500
over_voltage=2
disable_splash=1
gpu_mem=16

# Reboot to apply changes
sudo reboot
```

### 4. Setup Swap Space

```bash
# Configure swap for better memory management
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile

# Set swap size to 1GB
CONF_SWAPSIZE=1024

# Restart swap
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Verify swap
free -h
```

## Docker Installation on Raspberry Pi

### Method 1: Official Docker Script (Recommended)

```bash
# Install Docker using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo pip3 install docker-compose

# Enable Docker on boot
sudo systemctl enable docker
sudo systemctl start docker

# Reboot to apply group changes
sudo reboot
```

### Method 2: Manual Installation

```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/raspbian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/raspbian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo pip3 install docker-compose
```

## Deploying the Camera Detector

### 1. Clone Repository

```bash
# Install Git if not present
sudo apt install -y git

# Clone the repository
git clone https://github.com/dearxcorex/find_cam.git
cd find_cam/frontend
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration for Pi optimization
nano .env
```

**Pi-Optimized Environment Configuration:**
```bash
# Application Settings
NODE_ENV=production
PORT=3000
NODE_OPTIONS=--max-old-space-size=384

# Kismet Configuration
KISMET_HOST=http://192.168.0.128
KISMET_PORT=2501
KISMET_API_KEY=your_kismet_api_key_here

# Performance Settings
HTTP_PORT=80
HTTPS_PORT=443
```

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy with Pi optimizations
./scripts/deploy.sh
```

## Performance Optimization

### 1. Memory Management

```bash
# Monitor memory usage
free -h

# Check Docker container memory usage
docker stats

# Adjust Node.js memory limit if needed
# Edit .env file:
NODE_OPTIONS=--max-old-space-size=256  # For 2GB Pi
NODE_OPTIONS=--max-old-space-size=384  # For 4GB Pi
NODE_OPTIONS=--max-old-space-size=512  # For 8GB Pi
```

### 2. CPU Optimization

```bash
# Monitor CPU usage
top

# Check temperature
vcgencmd measure_temp

# If temperature > 75°C, consider cooling solutions
```

### 3. Storage Optimization

```bash
# Monitor disk usage
df -h

# Clean Docker periodically
docker system prune -a

# Set up log rotation
sudo nano /etc/logrotate.d/docker-containers
```

## Network Configuration

### 1. Static IP (Recommended)

```bash
# Edit network configuration
sudo nano /etc/dhcpcd.conf

# Add at the end:
interface eth0
static ip_address=192.168.0.100/24
static routers=192.168.0.1
static domain_name_servers=192.168.0.1 8.8.8.8

# Reboot
sudo reboot
```

### 2. Port Forwarding (Router Configuration)

Forward the following ports to your Raspberry Pi:
- `3000` - Application port (HTTP)
- `443` - HTTPS port (if using SSL)
- `80` - HTTP port (if using Nginx)

### 3. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## Remote Access Setup

### 1. SSH Configuration

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart ssh
```

### 2. Dynamic DNS (Optional)

```bash
# Install ddclient
sudo apt install ddclient

# Configure with your DNS provider
sudo nano /etc/ddclient.conf
```

## Monitoring and Maintenance

### 1. System Monitoring

```bash
# Create monitoring script
nano ~/monitor.sh

#!/bin/bash
echo "=== System Status ==="
echo "Uptime: $(uptime -p)"
echo "Temperature: $(vcgencmd measure_temp)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h /)"
echo "=== Docker Status ==="
docker-compose ps
echo "=== Application Health ==="
curl -s http://localhost:3000/api/health | jq .

# Make executable
chmod +x ~/monitor.sh

# Run monitoring script
~/monitor.sh
```

### 2. Log Management

```bash
# Create log rotation script
sudo nano /etc/logrotate.d/kismet-detector

/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

### 3. Automatic Updates

```bash
# Create update script
nano ~/update.sh

#!/bin/bash
cd /home/pi/find_cam/frontend
git pull
docker-compose build
docker-compose up -d
echo "Application updated at $(date)"

# Make executable
chmod +x ~/update.sh

# Add to crontab for weekly updates
crontab -e

# Add line:
0 3 * * 0 /home/pi/update.sh >> /home/pi/update.log 2>&1
```

## Troubleshooting Pi-Specific Issues

### 1. Memory Issues

**Symptoms**: Container crashes, system becomes unresponsive
**Solutions**:
```bash
# Reduce memory allocation
NODE_OPTIONS=--max-old-space-size=256

# Increase swap
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### 2. Storage Issues

**Symptoms**: Docker fails to start, corrupted SD card
**Solutions**:
```bash
# Check disk health
sudo fsck -f /dev/mmcblk0p2

# Clean Docker
docker system prune -a --volumes

# Move Docker data to external storage if needed
```

### 3. Network Issues

**Symptoms**: Cannot access application remotely
**Solutions**:
```bash
# Check network configuration
ip addr show

# Test port accessibility
sudo netstat -tlnp | grep :3000

# Check firewall
sudo ufw status
```

### 4. Performance Issues

**Symptoms**: Slow response, high CPU usage
**Solutions**:
```bash
# Check system load
htop

# Optimize Docker resources
sudo nano docker-compose.yml

# Adjust memory limits:
deploy:
  resources:
    limits:
      memory: 384M  # Reduce for better performance
```

## Backup and Recovery

### 1. System Backup

```bash
# Create backup script
nano ~/backup.sh

#!/bin/bash
BACKUP_DIR="/home/pi/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/kismet_data_$DATE.tar.gz data/ .env

# Backup Docker configuration
docker-compose config > $BACKUP_DIR/docker_config_$DATE.yml

echo "Backup completed: $BACKUP_DIR/kismet_data_$DATE.tar.gz"

# Make executable
chmod +x ~/backup.sh
```

### 2. SD Card Backup

```bash
# Backup entire SD card (from another computer)
sudo dd if=/dev/sdX of=raspberry_pi_backup.img bs=4M status=progress

# Compress backup
gzip raspberry_pi_backup.img
```

## Security Considerations

1. **Change Default Password**: Modify default Raspberry Pi password
2. **SSH Key Authentication**: Disable password authentication for SSH
3. **Firewall**: Configure UFW to allow only necessary ports
4. **VPN**: Consider VPN for remote access instead of exposing ports
5. **Regular Updates**: Keep system and Docker containers updated
6. **Monitoring**: Monitor logs and system performance regularly

## Performance Benchmarks

### Raspberry Pi 4B (4GB) Performance:
- **Startup Time**: ~25-30 seconds
- **Memory Usage**: ~200-300MB during operation
- **CPU Usage**: ~10-20% during normal operation
- **Response Time**: <200ms for web interface
- **Concurrent Users**: 3-5 simultaneous users

### Scaling Considerations:
- **Small Networks** (<50 devices): Pi 3B+ acceptable
- **Medium Networks** (50-200 devices): Pi 4B 2GB minimum
- **Large Networks** (200+ devices): Pi 4B 4GB+ recommended