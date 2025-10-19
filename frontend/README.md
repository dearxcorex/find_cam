# Kismet Camera Detector

A modern, Docker-based web application for detecting WiFi cameras and analyzing network interference using Kismet. Perfect for deployment on Raspberry Pi with remote monitoring capabilities.

## 🚀 Quick Start (Docker Deployment)

### For Raspberry Pi Production Deployment:

```bash
# 1. Clone the repository
git clone https://github.com/dearxcorex/find_cam.git
cd find_cam/frontend

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your Kismet server details

# 3. Deploy with Docker (one command)
./scripts/deploy.sh

# 4. Access from any device
# Local: http://localhost:3000
# Remote: http://[YOUR_PI_IP]:3000
```

### For Development:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

## 🎯 Key Features

### 🔍 Advanced Camera Detection
- **Real-time Detection**: Live device discovery from Kismet API
- **Confidence Scoring**: Intelligent camera identification with accuracy scores
- **Manufacturer Analysis**: Comprehensive vendor database with 80+ manufacturers
- **Enhanced Detection**: Imilab, Chinese camera brands, and pattern recognition

### 📡 WiFi Interference Analysis ⭐ NEW
- **Extended Channel Detection**: Identifies devices using channels >13
- **Regulatory Compliance**: Flags non-compliant WiFi channels
- **Priority Classification**: HIGH/MEDIUM/LOW interference risk assessment
- **Channel Overlap Analysis**: Visualize potential interference sources
- **DFS Channel Support**: Dynamic Frequency Selection channel detection

### 🎛️ Comprehensive Filtering
- **Manufacturer Filter**: Search and filter by device manufacturers
- **Frequency Analysis**: Filter by 2.4GHz, 5GHz, 6GHz bands
- **Channel Filtering**: Specific WiFi channel selection
- **Confidence Thresholds**: Adjustable detection sensitivity
- **Interference Filters**: Priority and compliance-based filtering

### 📊 Multiple View Modes
- **Default View**: Clean grid layout with device cards
- **Group by Manufacturer**: Organize by vendor categories
- **Group by Frequency**: Channel-based organization
- **Interference Analysis**: Priority-based interference grouping

### 📈 Real-time Analytics
- **Live Statistics**: Device counts, manufacturer summaries
- **Auto-refresh**: Configurable update intervals (30s default)
- **Connection Monitoring**: Kismet server health status
- **Performance Metrics**: Memory and system usage tracking

### 💾 Export & Reporting
- **JSON Export**: Complete device data with metadata
- **CSV Export**: Spreadsheet-compatible format
- **Configurable Options**: Select data fields for export

## 🐳 Docker Deployment

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MacBook/PC    │────│  Raspberry Pi   │────│  Kismet Server  │
│  (Monitoring)   │    │   (Docker App)  │    │ (Network Scan)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Supported Platforms
- **Raspberry Pi 4B+** (4GB+ RAM recommended)
- **Linux x86_64** (Ubuntu, CentOS, etc.)
- **macOS** (Intel/Apple Silicon)
- **Windows 10/11** (with WSL2)

### Quick Deployment Commands

```bash
# Standalone deployment
./scripts/deploy.sh

# With Nginx reverse proxy
./scripts/deploy.sh with-nginx

# Build only (no deployment)
./scripts/deploy.sh build-only

# View logs
./scripts/deploy.sh logs

# Health check
./scripts/deploy.sh health

# Stop application
./scripts/deploy.sh stop
```

## 📱 Cross-Platform Monitoring

### Remote Access Options

1. **Local Network**: `http://[PI_IP]:3000`
2. **Port Forwarding**: Access from anywhere via public IP
3. **VPN**: Secure remote access (recommended)
4. **Cloud Tunneling**: Tailscale, ZeroTier, etc.

### Mobile-Ready Interface
- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Large buttons and gestures
- **PWA Support**: Install as mobile app
- **Performance Optimized**: Efficient data usage

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```bash
# Kismet Server Configuration
KISMET_HOST=http://192.168.0.128
KISMET_PORT=2501
KISMET_API_KEY=your_kismet_api_key_here

# Application Settings
PORT=3000
NODE_ENV=production

# Performance (optimized for Raspberry Pi)
NODE_OPTIONS=--max-old-space-size=512
```

### SSL/HTTPS Setup (Optional)

```bash
# Generate SSL certificates
mkdir -p docker/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem

# Deploy with Nginx and SSL
./scripts/deploy.sh with-nginx
```

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Complete setup instructions
- **[Raspberry Pi Guide](docs/RASPBERRY_PI.md)** - Pi-specific deployment
- **[Monitoring Guide](docs/MONITORING.md)** - Remote access and mobile monitoring

## 🏗️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Containerization**: Docker & Docker Compose
- **Deployment**: Multi-platform (ARM64/x86_64)
- **Data Fetching**: SWR for real-time updates
- **Icons**: Lucide React

## 🔍 Detection Features

### Camera Identification Algorithm
- **Manufacturer Database**: 80+ known camera manufacturers
- **Pattern Recognition**: Chinese camera brands, Imilab, etc.
- **Frequency Analysis**: Common camera frequency bands
- **Traffic Patterns**: Video streaming characteristics
- **Device Naming**: Camera-related keyword detection

### Interference Analysis ⭐
- **Extended Channels**: Detects non-standard channels (>13)
- **Regulatory Compliance**: Identifies non-compliant devices
- **Risk Assessment**: Priority-based interference scoring
- **Channel Overlap**: Visualizes potential conflicts
- **DFS Channels**: Dynamic frequency selection support

## 📊 Performance

### Raspberry Pi 4B (4GB) Benchmarks
- **Startup Time**: ~25-30 seconds
- **Memory Usage**: ~200-300MB during operation
- **CPU Usage**: ~10-20% normal operation
- **Response Time**: <200ms for web interface
- **Concurrent Users**: 3-5 simultaneous users

### Optimization Features
- **ARM64 Support**: Native Raspberry Pi performance
- **Memory Management**: Configurable Node.js limits
- **Image Optimization**: Unoptimized images for Pi performance
- **Compression**: Gzip and response compression
- **Caching**: SWR caching for efficient data fetching

## 🛠️ Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Project Structure
```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── page.tsx        # Main page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   ├── lib/               # Utilities and API
│   └── types/             # TypeScript definitions
├── docs/                  # Documentation
├── docker/                # Docker configuration
├── scripts/               # Deployment scripts
├── Dockerfile             # Multi-stage build
├── docker-compose.yml     # Deployment configuration
└── .env.example           # Environment template
```

## 🔧 Troubleshooting

### Common Issues

#### Docker Deployment Problems
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs camera-detector

# Health check
curl http://localhost:3000/api/health
```

#### Raspberry Pi Issues
```bash
# Monitor memory usage
free -h

# Check temperature
vcgencmd measure_temp

# Optimize performance
sudo nano /boot/config.txt  # Add overclocking settings
```

#### Connection Issues
```bash
# Test Kismet connectivity
curl http://[KISMET_IP]:2501/system/status.json?KISMET=[API_KEY]

# Check network
ping [KISMET_IP]

# Verify port access
telnet [KISMET_IP] 2501
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project follows the same license as the original camera detector.

## 🙏 Acknowledgments

- **Kismet Team**: For the excellent network monitoring tool
- **Raspberry Pi Foundation**: For the amazing hardware platform
- **Next.js Team**: For the fantastic React framework
- **Docker Team**: For containerization technology

## Usage

1. **Connect to Kismet**: Enter your server URL and API key
2. **View Devices**: Browse detected devices with camera confidence scores
3. **Apply Filters**: Use the sidebar to narrow down results
4. **Change Views**: Switch between grid and grouped views
5. **Export Results**: Download findings in JSON or CSV format

## Device Detection Logic

The application uses multiple factors to identify potential cameras:

### Manufacturer Analysis
- Known camera manufacturers (Hikvision, Axis, Dahua, etc.)
- Category-based confidence scoring
- Manufacturer aliases and normalization

### Frequency Analysis
- Common camera frequency bands and channels
- Precise frequency matching with tolerance
- Channel-specific confidence boosts

### Traffic Patterns
- Packet count analysis (cameras typically have lower counts)
- Data ratio analysis (video streaming patterns)
- Device type classification (access points vs clients)

### Device Names
- Camera-related keyword detection
- Common naming patterns
- Brand-specific identifiers

## Component Structure

```
src/
├── app/
│   ├── page.tsx              # Main application page
│   └── layout.tsx            # Root layout
├── components/
│   ├── CameraDetectorDashboard.tsx  # Main dashboard container
│   ├── ConnectionForm.tsx           # Server connection form
│   ├── Header.tsx                   # Top navigation bar
│   ├── Sidebar.tsx                  # Filters and view options
│   ├── DeviceGrid.tsx               # Device grid display
│   ├── GroupedView.tsx              # Manufacturer/frequency groups
│   ├── DeviceModal.tsx              # Device detail modal
│   ├── ExportModal.tsx              # Export functionality
│   └── SummaryStats.tsx             # Statistics overview
├── lib/
│   └── kismet-api.ts         # Kismet API service and detection logic
└── types/
    └── kismet.ts             # TypeScript type definitions
```

## API Integration

The frontend connects directly to your Kismet server using REST API endpoints:

- `/system/status.json` - Connection testing
- `/devices/views/all/devices.json` - Device enumeration
- `/devices/last-time/{timestamp}/devices.json` - Recent devices

## Security Notes

- API keys are stored in localStorage for convenience
- No sensitive data is sent to external servers
- All communication is direct with your Kismet instance
- MAC vendor API calls are rate-limited and optional

## Development

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Environment Variables
Create a `.env.local` file for development:
```env
NEXT_PUBLIC_KISMET_HOST=http://192.168.0.128:2501
NEXT_PUBLIC_KISMET_API_KEY=your_api_key_here
```

## Troubleshooting

### Connection Issues
1. Verify Kismet server is running
2. Check API key is correct
3. Ensure server URL includes port number
4. Check network connectivity

### No Devices Found
1. Verify Kismet is detecting devices
2. Check if devices have been recently active
3. Try reducing confidence threshold in filters
4. Verify Kismet has proper permissions

### Performance Issues
1. Disable MAC vendor API if rate limited
2. Increase refresh interval
3. Reduce number of displayed devices with filters

## Contributing

This frontend is designed to work with the existing Python camera detector script. It provides all the same functionality with an enhanced user interface and real-time capabilities.

## License

This project follows the same license as the original camera detector.