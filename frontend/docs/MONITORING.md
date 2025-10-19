# Remote Monitoring and Access Guide

## Overview

This guide explains how to monitor your Kismet Camera Detector from any device (MacBook, PC, mobile) and set up remote access for continuous monitoring of your WiFi network.

## Access Methods

### 1. Local Network Access

#### From MacBook/PC
```bash
# Find your Raspberry Pi IP address
# On Pi: hostname -I
# Or check your router's connected devices list

# Access via browser
http://[PI_IP_ADDRESS]:3000

# Example: http://192.168.0.100:3000
```

#### From Mobile Devices
1. Connect to the same WiFi network as your Raspberry Pi
2. Open browser and navigate to: `http://[PI_IP_ADDRESS]:3000`
3. Bookmark the page for quick access

### 2. Remote Access Options

#### Option A: Port Forwarding (Simple)
```bash
# On your router, forward port 3000 to your Pi's IP:
# External Port: 3000
# Internal IP: [PI_IP_ADDRESS]
# Internal Port: 3000

# Access from anywhere:
http://[YOUR_PUBLIC_IP]:3000
```

#### Option B: VPN (Recommended for Security)
```bash
# Install WireGuard on Raspberry Pi
sudo apt install wireguard

# Configure VPN server
# Install VPN client on your monitoring devices

# Access via VPN IP:
http://[VPN_PI_IP]:3000
```

#### Option C: Cloud Tunnel (Tailscale/ZeroTier)
```bash
# Install Tailscale on Raspberry Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Install Tailscale on your devices
# Access via Tailscale IP:
http://[TAILSCALE_IP]:3000
```

## Mobile Optimization

### Responsive Design Features

The application is optimized for mobile devices with:
- **Touch-friendly interface**: Large buttons and touch targets
- **Responsive layout**: Adapts to screen size
- **Mobile navigation**: Collapsible sidebar
- **Performance optimization**: Efficient data loading

### Mobile Browser Compatibility

Tested on:
- **iOS Safari**: iPhone/iPad (iOS 12+)
- **Chrome Mobile**: Android (Chrome 80+)
- **Samsung Internet**: Android
- **Firefox Mobile**: Android/iOS

### Mobile-Specific Features

#### Touch Gestures
- **Tap** to select devices and view details
- **Swipe** to navigate between views
- **Pinch-to-zoom** on device details and charts

#### Progressive Web App (PWA)
```bash
# The application can be installed as a PWA:
# 1. Open in mobile browser
# 2. Tap "Share" menu
# 3. Select "Add to Home Screen"
# 4. Launch from home screen like a native app
```

## Dashboard Monitoring

### Real-Time Updates

The dashboard updates automatically:
- **Device List**: Refreshes every 30 seconds
- **Signal Strength**: Real-time signal monitoring
- **Interference Analysis**: Continuous channel monitoring
- **Camera Detection**: Automatic detection updates

### Key Monitoring Metrics

#### 1. Device Overview
```
Total Devices: 45
Camera Candidates: 12
High Confidence: 8
Medium Confidence: 4
```

#### 2. Signal Analysis
```
Strong Signal (> -60 dBm): 8 devices
Medium Signal (-60 to -80 dBm): 23 devices
Weak Signal (< -80 dBm): 14 devices
```

#### 3. Interference Analysis
```
High Priority Interference: 3 devices
Medium Priority: 7 devices
Non-Compliant Channels: 2 devices
```

### Alert Configuration

#### Setting Up Alerts (Future Feature)
```javascript
// Configure monitoring alerts:
const alerts = {
  highInterference: true,    // Alert for high interference
  newCamera: true,           // Alert for new camera detection
  signalLoss: false,         // Alert for device signal loss
  channelChange: true        // Alert for channel changes
};
```

## Cross-Platform Access

### MacBook Access

#### Browser Access
```bash
# Recommended browsers:
# - Safari 14+
# - Chrome 90+
# - Firefox 88+
# - Edge 90+

# Access URL:
http://[PI_IP_ADDRESS]:3000
```

#### Desktop Shortcuts
```bash
# Create desktop shortcut (macOS):
# 1. Open Safari
# 2. Navigate to application
# 3. File > Add to Dock

# Or create web app shortcut using Safari:
# 1. File > Create Shortcut
# 2. Add to Desktop
```

#### Menu Bar Integration (Optional)
```bash
# Use tools like:
# - BitBar (macOS)
# - Nativefier (cross-platform)
# - Electron (custom app)
```

### Windows PC Access

#### Browser Access
```bash
# Recommended browsers:
# - Chrome 90+
# - Edge 90+
# - Firefox 88+

# Access URL:
http://[PI_IP_ADDRESS]:3000
```

#### Desktop App Creation
```bash
# Create desktop app using:
npm install -g nativefier
nativefier "http://[PI_IP_ADDRESS]:3000" --name "Kismet Detector"
```

## Network Configuration

### Router Setup for Remote Access

#### Port Forwarding Configuration
```
Router Model: [Your Router Model]
External Port: 3000
Internal Port: 3000
Internal IP: [PI_IP_ADDRESS]
Protocol: TCP
```

#### Dynamic DNS Setup
```bash
# Configure DDNS for static domain:
# Services: No-IP, DuckDNS, Cloudflare

# Example with DuckDNS:
# 1. Create account at duckdns.org
# 2. Create subdomain
# 3. Configure on router or Pi
# 4. Access: http://your-subdomain.duckdns.org:3000
```

### Firewall Configuration

#### Raspberry Pi Firewall
```bash
# Configure UFW on Pi:
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw enable
```

#### Network Security
```bash
# Best practices:
# - Use strong passwords
# - Enable HTTPS/SSL
# - Use VPN for remote access
# - Regularly update systems
# - Monitor access logs
```

## Performance Optimization

### Mobile Data Usage

#### Data Optimization Settings
```javascript
// Mobile optimization:
const mobileSettings = {
  refreshInterval: 60000,    // 1 minute refresh (vs 30s desktop)
  lowDataMode: true,         // Reduced data transfer
  compressData: true,        // Compress API responses
  cacheResults: true         // Cache device lists
};
```

#### Bandwidth Monitoring
```bash
# Monitor data usage on Pi:
iftop -i eth0

# Check application data usage:
docker stats camera-detector
```

### Battery Optimization (Mobile)

#### Background Refresh
```javascript
// Background refresh behavior:
const backgroundSettings = {
  enableBackgroundRefresh: true,
  backgroundRefreshInterval: 300000,  // 5 minutes
  lowPowerMode: false,                 // Reduce updates on low battery
  wifiOnlyRefresh: true                // Only refresh on WiFi
};
```

## Troubleshooting Remote Access

### Common Issues

#### 1. Cannot Access from External Network
```bash
# Check port forwarding:
telnet [YOUR_PUBLIC_IP] 3000

# Verify Pi firewall:
sudo ufw status

# Check router configuration:
# Access router admin panel
# Verify port forwarding rules
# Check if ISP blocks ports
```

#### 2. Slow Performance on Mobile
```bash
# Check network speed:
# On Pi: speedtest-cli

# Optimize application:
# - Increase refresh intervals
# - Enable low data mode
# - Check signal strength
```

#### 3. Connection Drops
```bash
# Check WiFi stability:
ping -c 10 [PI_IP_ADDRESS]

# Monitor system resources:
htop
free -h

# Check Docker container:
docker-compose logs camera-detector
```

#### 4. SSL Certificate Issues
```bash
# For HTTPS/SSL setup:
# Verify certificate validity:
openssl s_client -connect [PI_IP_ADDRESS]:443

# Check certificate files:
ls -la docker/ssl/
```

### Performance Monitoring

#### System Monitoring Dashboard
```bash
# Access system health:
http://[PI_IP_ADDRESS]:3000/api/health

# Health check response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "memory": {
    "used": 256,
    "total": 512
  }
}
```

#### Log Monitoring
```bash
# View application logs:
docker-compose logs -f camera-detector

# Monitor system logs:
journalctl -u docker -f
```

## Security Best Practices

### Remote Access Security

#### 1. HTTPS/SSL Setup
```bash
# Generate SSL certificate:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem

# Deploy with Nginx and SSL:
./scripts/deploy.sh with-nginx
```

#### 2. VPN Configuration
```bash
# WireGuard setup:
sudo apt install wireguard

# Generate keys:
wg genkey | tee privatekey | wg pubkey > publickey

# Configure VPN server:
sudo nano /etc/wireguard/wg0.conf
```

#### 3. Access Control
```bash
# Configure application authentication:
# - Add password protection
# - Implement IP whitelisting
# - Set up rate limiting
# - Monitor access logs
```

### Monitoring Security

#### Access Logs
```bash
# Monitor access patterns:
docker-compose logs camera-detector | grep "GET"

# Check for suspicious activity:
grep -i "error\|warning\|failed" /var/log/nginx/access.log
```

#### Intrusion Detection
```bash
# Monitor failed login attempts:
grep "authentication failure" /var/log/auth.log

# Set up alerts for unusual activity:
# - Multiple failed attempts
# - Access from unknown IPs
# - Unusual time patterns
```

## Mobile Apps Integration

### Third-Party Apps

#### Home Assistant Integration
```yaml
# Home Assistant configuration:
sensor:
  - platform: rest
    name: Kismet Camera Detector
    resource: http://[PI_IP_ADDRESS]:3000/api/health
    value_template: "{{ value_json.status }}"
    json_attributes:
      - uptime
      - memory
```

#### Push Notifications
```bash
# Set up push notifications:
# Services: Pushbullet, Pushover, IFTTT

# Example with Pushbullet:
curl -u API_KEY: https://api.pushbullet.com/v2/pushes \
  -d type=note \
  -d title="Camera Detector Alert" \
  -d body="New camera detected on network"
```

## Advanced Monitoring

### Custom Dashboards

#### Grafana Integration
```bash
# Set up Grafana for monitoring:
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana

# Configure data source from application API
```

#### Data Export
```bash
# Export monitoring data:
curl http://[PI_IP_ADDRESS]:3000/api/devices/export \
  -H "Content-Type: application/json" \
  -o devices.json
```

### Automation

#### IFTTT Integration
```bash
# Set up IFTTT webhooks:
# Trigger: New camera detected
# Action: Send notification, turn on lights, etc.

# Webhook URL:
https://maker.ifttt.com/trigger/camera_detected/with/key/YOUR_KEY
```

#### Script Monitoring
```bash
# Create custom monitoring script:
nano ~/monitor_app.sh

#!/bin/bash
response=$(curl -s http://localhost:3000/api/health)
status=$(echo $response | jq -r '.status')

if [ "$status" != "healthy" ]; then
  echo "Alert: Application is not healthy!"
  # Send notification
fi

chmod +x ~/monitor_app.sh
```

## Quick Reference

### Access URLs
```
Local Network:    http://[PI_IP]:3000
Remote Access:     http://[PUBLIC_IP]:3000
Health Check:      http://[PI_IP]:3000/api/health
```

### Management Commands
```bash
# Application management:
./scripts/deploy.sh              # Deploy application
./scripts/deploy.sh logs        # View logs
./scripts/deploy.sh health      # Health check
./scripts/deploy.sh stop        # Stop application

# System monitoring:
htop                             # System resources
docker stats                     # Container stats
free -h                         # Memory usage
df -h                           # Disk usage
```

### Troubleshooting Commands
```bash
# Network issues:
ping [PI_IP]                     # Test connectivity
telnet [PI_IP] 3000              # Test port access

# Application issues:
docker-compose logs camera-detector
curl http://localhost:3000/api/health

# Performance issues:
docker stats
top
vcgencmd measure_temp            # CPU temperature
```