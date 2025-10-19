# Kismet Camera Detector

A Python script that connects to a Kismet server and identifies camera devices on your network using multiple detection methods.

## Features

- **Multi-method Detection**: Uses MAC vendor analysis, device names, and port scanning
- **Real-time Monitoring**: Connects to Kismet API for live device detection
- **Confidence Scoring**: Provides confidence levels for camera identification
- **Port Scanning**: Checks for common camera ports (RTSP, HTTP, etc.)
- **Comprehensive Reporting**: Detailed results with detection reasoning

## Installation

1. Clone or download this repository
2. Create virtual environment using uv:
   ```bash
   uv venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```

## Usage

### Basic Usage
```bash
# Set API key first
export KISMET_API_KEY='your_api_key_here'
python camera_detector.py
```

### With Custom Settings
```bash
# Using environment variables
export KISMET_API_KEY='your_api_key_here'
export KISMET_HOST='http://192.168.0.128:2501'
python camera_detector.py --verbose

# OR using command line arguments
python camera_detector.py --api-key your_api_key_here --host http://192.168.0.128:2501 --verbose
```

### Get Recent Devices Only
```bash
export KISMET_API_KEY='your_api_key_here'
python camera_detector.py --since $(date +%s --date='1 hour ago')
```

## Configuration

The script uses environment variables or command-line arguments for configuration:

- **Kismet Host**: `http://localhost:2501` (default)
- **API Key**: Required (set via environment variable or command line)

### Setting up the API Key

**Method 1: Environment Variable (Recommended)**
```bash
export KISMET_API_KEY='your_api_key_here'
export KISMET_HOST='http://192.168.0.128:2501'  # Optional, if not localhost
python camera_detector.py
```

**Method 2: Using .env file**
```bash
# Copy the example file and update it
cp .env.example .env
# Edit .env with your actual API key and host
# Then run
python camera_detector.py
```

**Method 3: Command Line Arguments**
```bash
python camera_detector.py --api-key your_api_key_here --host http://192.168.0.128:2501
```

## Detection Methods

### 1. MAC Address Vendor Analysis
- Checks MAC address prefixes against known camera manufacturers
- Includes: Axis, Canon, Sony, Panasonic, Raspberry Pi (common for Pi cameras)

### 2. Device Name Analysis
- Searches device names for camera-related keywords
- Keywords include: camera, cam, ipcam, cctv, surveillance, etc.

### 3. Port Scanning
- Checks for common camera ports:
  - 554 (RTSP)
  - 80/8080 (HTTP)
  - 443 (HTTPS)
  - 8000/8001 (Alternative HTTP)

### 4. Device Characteristics
- Wireless devices (common for cameras)
- Multiple IP addresses
- Signal strength and channel information

## Output Example

```
============================================================
CAMERA DEVICE DETECTION RESULTS
============================================================
Found 2 potential camera devices:

1. IP_Camera_01
   Confidence: 85.0%
   MAC: B8:27:EB:12:34:56
   Type: wireless
   Signal: -45 dBm
   Channel: 6
   IPs: 192.168.0.150
   Open Ports: 554, 80
   Detection Reasons:
     • MAC vendor: Raspberry Pi Foundation
     • Device name contains: camera
     • Wireless device (common for cameras)
     • Open camera ports: [554, 80]

2. DCS-932L
   Confidence: 70.0%
   MAC: 00:05:1C:AB:CD:EF
   Type: wireless
   Signal: -62 dBm
   Channel: 11
   Detection Reasons:
     • MAC vendor: Panasonic
     • Device name contains: dcs-
     • Wireless device (common for cameras)
```

## Adding New Camera Vendors

To add more camera MAC address prefixes, edit the `CAMERA_MAC_PREFIXES` dictionary in the script:

```python
CAMERA_MAC_PREFIXES = {
    "00:12:15": "Axis Communications",
    "00:04:23": "Canon",
    # Add new entries here:
    "AA:BB:CC": "New Camera Brand",
}
```

## Troubleshooting

### Connection Issues
1. Verify Kismet server is running: `http://192.168.0.128:2501`
2. Check API key is correct and has sufficient permissions
3. Ensure network connectivity to the Kismet server

### No Devices Found
1. Check if Kismet is actively monitoring
2. Verify wireless adapters are working
3. Use `--since` parameter to get recent devices
4. Try `--verbose` for debugging information

### False Positives
- Confidence threshold can be adjusted in the code
- Add more specific keywords to `CAMERA_KEYWORDS`
- Modify MAC vendor database for better accuracy

## Security Notes

- This tool is for network security auditing and device inventory
- Only scan networks you own or have permission to test
- Port scanning may be detected by security systems
- Use responsibly and in accordance with local laws

## Requirements

- Python 3.7+
- Kismet server with REST API enabled
- Network connectivity to Kismet server
- `requests` library (automatically installed)

## License

This script is provided for educational and security research purposes.