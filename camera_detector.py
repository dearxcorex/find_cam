#!/usr/bin/env python3
"""
Kismet Camera Detector

This script connects to a Kismet server and identifies camera devices on the network
using multiple detection methods including MAC vendor analysis, device names,
and common camera ports.
"""

import os
from pathlib import Path
import requests
import json
import re
import socket
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import argparse
import logging
from urllib.parse import quote

# Load environment variables from .env file if it exists
def load_env_file():
    """Load environment variables from .env file"""
    env_file = Path('.env')
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value.strip()

# Load .env file at startup
load_env_file()

# Configuration
KISMET_API_KEY = os.getenv('KISMET_API_KEY', '')
KISMET_HOST = os.getenv('KISMET_HOST', 'http://localhost:2501')

# Enhanced manufacturer database with categories and confidence
MANUFACTURER_DATABASE = {
    # Camera Manufacturers
    "00:12:15": {"name": "Axis Communications", "category": "camera", "confidence": 0.9},
    "00:04:23": {"name": "Canon", "category": "camera", "confidence": 0.85},
    "00:1D:C1": {"name": "Canon", "category": "camera", "confidence": 0.85},
    "00:1E:8F": {"name": "Canon", "category": "camera", "confidence": 0.85},
    "00:26:AB": {"name": "Canon", "category": "camera", "confidence": 0.85},
    "00:40:8C": {"name": "Sony", "category": "camera", "confidence": 0.85},
    "00:50:DA": {"name": "Sony", "category": "camera", "confidence": 0.85},
    "00:05:1C": {"name": "Panasonic", "category": "camera", "confidence": 0.85},
    "00:0F:F7": {"name": "Panasonic", "category": "camera", "confidence": 0.85},
    "B8:27:EB": {"name": "Raspberry Pi Foundation", "category": "iot", "confidence": 0.7},
    "DC:A6:32": {"name": "Raspberry Pi Foundation", "category": "iot", "confidence": 0.7},
    "E4:5F:01": {"name": "Raspberry Pi Foundation", "category": "iot", "confidence": 0.7},

    # Additional Camera Brands
    "00:12:0E": {"name": "Hikvision Digital Technology", "category": "camera", "confidence": 0.9},
    "00:26:7C": {"name": "Hikvision Digital Technology", "category": "camera", "confidence": 0.9},
    "68:A3:C4": {"name": "Hikvision Digital Technology", "category": "camera", "confidence": 0.9},
    "00:1E:58": {"name": "Dahua Technology", "category": "camera", "confidence": 0.9},
    "AC:5A:FC": {"name": "Dahua Technology", "category": "camera", "confidence": 0.9},
    "00:17:88": {"name": "Amcrest Technologies", "category": "camera", "confidence": 0.85},
    "00:16:6C": {"name": "Amcrest Technologies", "category": "camera", "confidence": 0.85},
    "C4:5E:0C": {"name": "Wyze Labs", "category": "camera", "confidence": 0.8},
    "34:CE:00": {"name": "Wyze Labs", "category": "camera", "confidence": 0.8},
    "40:B4:CD": {"name": "Ring", "category": "camera", "confidence": 0.85},
    "F0:B4:29": {"name": "Ring", "category": "camera", "confidence": 0.85},
    "54:4A:00": {"name": "Arlo Technologies", "category": "camera", "confidence": 0.85},
    "70:88:6B": {"name": "Arlo Technologies", "category": "camera", "confidence": 0.85},
    "18:B4:30": {"name": "Reolink", "category": "camera", "confidence": 0.85},
    "28:6E:D4": {"name": "Reolink", "category": "camera", "confidence": 0.85},
    "00:8E:F2": {"name": "Foscam", "category": "camera", "confidence": 0.8},
    "C0:4A:00": {"name": "Foscam", "category": "camera", "confidence": 0.8},
    "00:0D:C5": {"name": "D-Link", "category": "camera", "confidence": 0.75},
    "1C:BD:B9": {"name": "D-Link", "category": "camera", "confidence": 0.75},
    "00:07:50": {"name": "Swann Communications", "category": "camera", "confidence": 0.8},
    "00:1B:1F": {"name": "Swann Communications", "category": "camera", "confidence": 0.8},
    "00:90:F5": {"name": "Lorex Technology", "category": "camera", "confidence": 0.8},
    "00:40:63": {"name": "Lorex Technology", "category": "camera", "confidence": 0.8},

    # Networking Equipment (often confused with cameras)
    "00:1B:11": {"name": "Ubiquiti Networks", "category": "networking", "confidence": 0.7},
    "04:18:D6": {"name": "Ubiquiti Networks", "category": "networking", "confidence": 0.7},
    "80:2A:A8": {"name": "Ubiquiti Networks", "category": "networking", "confidence": 0.7},
    "E8:94:F6": {"name": "Ubiquiti Networks", "category": "networking", "confidence": 0.7},
    "00:C0:CA": {"name": "TP-Link", "category": "networking", "confidence": 0.7},
    "50:C7:BF": {"name": "TP-Link", "category": "networking", "confidence": 0.7},
    "68:FF:7B": {"name": "TP-Link", "category": "networking", "confidence": 0.7},
    "00:1E:58": {"name": "Netgear", "category": "networking", "confidence": 0.7},
    "30:46:9A": {"name": "Netgear", "category": "networking", "confidence": 0.7},
    "A0:C5:89": {"name": "Netgear", "category": "networking", "confidence": 0.7},
    "00:04:ED": {"name": "Linksys", "category": "networking", "confidence": 0.7},
    "00:18:01": {"name": "Linksys", "category": "networking", "confidence": 0.7},
    "00:1D:0F": {"name": "ASUSTek Computer", "category": "networking", "confidence": 0.7},
    "04:D4:C4": {"name": "ASUSTek Computer", "category": "networking", "confidence": 0.7},
    "28:28:5D": {"name": "ASUSTek Computer", "category": "networking", "confidence": 0.7},

    # Computing/IoT Devices
    "00:1C:BF": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "28:CF:E9": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "40:A6:D9": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "98:01:A7": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "3C:15:C2": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "64:20:9F": {"name": "Apple", "category": "computing", "confidence": 0.8},
    "00:16:32": {"name": "Google", "category": "iot", "confidence": 0.75},
    "F4:F5:DB": {"name": "Google", "category": "iot", "confidence": 0.75},
    "44:07:0B": {"name": "Amazon Technologies", "category": "iot", "confidence": 0.75},
    "70:72:3C": {"name": "Amazon Technologies", "category": "iot", "confidence": 0.75},
    "00:FC:8B": {"name": "Samsung Electronics", "category": "iot", "confidence": 0.7},
    "E8:50:8B": {"name": "Samsung Electronics", "category": "iot", "confidence": 0.7},

    # Smart Home & IoT
    "00:12:1B": {"name": "Nest Labs", "category": "camera", "confidence": 0.85},
    "18:B4:30": {"name": "Nest Labs", "category": "camera", "confidence": 0.85},
    "64:16:66": {"name": "Nest Labs", "category": "camera", "confidence": 0.85},
}

# Manufacturer name normalization and aliases
MANUFACTURER_ALIASES = {
    "Raspberry Pi Foundation": ["Raspberry Pi", "Pi"],
    "Hikvision Digital Technology": ["Hikvision", "HKVision"],
    "Dahua Technology": ["Dahua", "DH-Technology"],
    "Amcrest Technologies": ["Amcrest", "AmcrestCam"],
    "Ubiquiti Networks": ["Ubiquiti", "Ubnt", "UI"],
    "ASUSTek Computer": ["ASUS", "AsusTek"],
    "Samsung Electronics": ["Samsung", "SamSung"],
    "Amazon Technologies": ["Amazon", "AMZN"],
}

# Manufacturer category priorities for camera detection
CATEGORY_CONFIDENCE_BOOST = {
    "camera": 0.3,
    "iot": 0.1,
    "networking": -0.2,
    "computing": -0.3,
    "unknown": 0.0,
}

# Camera-related keywords in device names
CAMERA_KEYWORDS = [
    "camera", "cam", "ipcam", "ip-camera", "webcam", "cctv",
    "surveillance", "security", "dlink", "dcs-", "foscam",
    "hikvision", "axis", "reolink", "wyze", "arlo", "nest",
    "ring", "blink", "swann", "lorex", "amcrest", "tenvis"
]

# Common camera ports to check
CAMERA_PORTS = [
    554,   # RTSP
    80,    # HTTP
    8080,  # HTTP Alt
    443,   # HTTPS
    8000,  # HTTP Alt
    8554,  # RTSP Alt
    9080,  # Some cameras use this
    1935,  # RTMP
    5000,  # Some Chinese cameras
    8001,  # IP camera default
]

@dataclass
class FrequencyInfo:
    """Enhanced precise frequency information for network devices"""
    raw_frequency: Optional[float] = None  # Raw frequency from Kismet (MHz/Hz)
    frequency_ghz: Optional[float] = None   # Precise frequency in GHz (e.g., 2.434)
    frequency_mhz: Optional[float] = None   # Precise frequency in MHz (e.g., 2434)
    channel: Optional[str] = None           # Channel number
    channel_width: Optional[str] = None     # "20MHz", "40MHz", "80MHz", etc.
    band: str = "unknown"                   # "2.4GHz", "5GHz", "6GHz", "unknown"
    is_standard_wifi: bool = False          # Is standard WiFi frequency

    def get_display_frequency(self) -> str:
        """Return precise frequency string like '2.434 GHz'"""
        if self.frequency_ghz:
            return f"{self.frequency_ghz:.3f} GHz"
        elif self.frequency_mhz:
            return f"{self.frequency_mhz:.0f} MHz"
        else:
            return "Unknown"

    def get_display_frequency_mhz(self) -> str:
        """Return precise frequency in MHz like '2434 MHz'"""
        if self.frequency_mhz:
            return f"{self.frequency_mhz:.0f} MHz"
        else:
            return "Unknown"

@dataclass
class ManufacturerInfo:
    """Enhanced manufacturer information for network devices"""
    name: str
    confidence: float
    source: str  # "mac_api", "hardcoded", "inferred", "kismet"
    category: str  # "camera", "networking", "computing", "iot", "unknown"
    is_known_camera: bool
    aliases: List[str]
    raw_name: Optional[str] = None  # Original name from API/source

@dataclass
class Device:
    """Represents a network device detected by Kismet"""
    key: str
    mac: str
    name: str
    type: str
    signal: Optional[int] = None
    channel: Optional[str] = None
    vendor: Optional[str] = None
    manufacturer: Optional[ManufacturerInfo] = None
    frequency_info: Optional[FrequencyInfo] = None
    ip_addresses: List[str] = None
    last_seen: Optional[str] = None
    raw_data: Dict = None

@dataclass
class CameraCandidate:
    """Represents a potential camera device"""
    device: Device
    confidence: float
    reasons: List[str]
    open_ports: List[int] = None

class KismetCameraDetector:
    def __init__(self, host: str = KISMET_HOST, api_key: str = KISMET_API_KEY, use_mac_api: bool = False):
        self.host = host.rstrip('/')
        self.api_key = api_key
        self.use_mac_api = use_mac_api  # Disabled by default due to rate limits
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'KismetCameraDetector/1.0',
            'Accept': 'application/json'
        })

        # MAC vendor cache to avoid excessive API calls
        self.mac_vendor_cache = {}

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    # Precise Frequency Analysis Utilities

    def _create_frequency_info(self, raw_frequency, channel_str: str = None) -> Optional[FrequencyInfo]:
        """Create enhanced frequency information from raw frequency data"""
        if not raw_frequency:
            return None

        try:
            # Detect and convert frequency unit to MHz
            freq_mhz = self._convert_to_mhz(raw_frequency)
            if not freq_mhz:
                return None

            # Convert to GHz for display
            freq_ghz = freq_mhz / 1000.0

            # Determine band and channel info
            band = self._classify_frequency_band(freq_mhz)
            channel = channel_str or self._get_channel_from_precise_frequency(freq_mhz)
            channel_width = self._get_channel_width(channel) if channel else None
            is_standard_wifi = self._is_standard_wifi_frequency(freq_mhz)

            return FrequencyInfo(
                raw_frequency=raw_frequency,
                frequency_ghz=freq_ghz,
                frequency_mhz=freq_mhz,
                channel=channel,
                channel_width=channel_width,
                band=band,
                is_standard_wifi=is_standard_wifi
            )
        except Exception as e:
            self.logger.warning(f"Error processing frequency {raw_frequency}: {e}")
            return None

    def _convert_to_mhz(self, raw_freq) -> Optional[float]:
        """Convert raw frequency to MHz, detecting the input unit"""
        if raw_freq is None:
            return None

        try:
            freq = float(raw_freq)

            # Determine unit based on magnitude
            if freq < 1000:        # Likely GHz
                return freq * 1000
            elif freq < 1000000:   # Likely MHz
                return freq
            elif freq < 10000000:  # Likely KHz
                return freq / 1000
            else:                   # Likely Hz
                return freq / 1000000
        except (ValueError, TypeError):
            return None

    def _classify_frequency_band(self, freq_mhz: float) -> str:
        """Classify frequency band with precise boundaries"""
        if 2400 <= freq_mhz <= 2495:
            return "2.4GHz"
        elif 5150 <= freq_mhz <= 5850:
            return "5GHz"
        elif 5925 <= freq_mhz <= 7125:
            return "6GHz"
        else:
            return "unknown"

    def _get_channel_from_precise_frequency(self, freq_mhz: float) -> Optional[str]:
        """Get channel number from precise frequency"""
        # 2.4GHz channels (center frequencies)
        freq_to_channel_2_4 = {
            2412: "1", 2417: "2", 2422: "3", 2427: "4", 2432: "5", 2437: "6",
            2442: "7", 2447: "8", 2452: "9", 2457: "10", 2462: "11", 2467: "12", 2472: "13", 2484: "14"
        }

        # 5GHz channels (UNII bands)
        freq_to_channel_5 = {
            # UNII-1 (5.15-5.25 GHz)
            5180: "36", 5190: "38", 5200: "40", 5210: "42", 5220: "44", 5230: "46", 5240: "48", 5250: "50",
            # UNII-2A (5.25-5.35 GHz)
            5260: "52", 5270: "54", 5280: "56", 5290: "58", 5300: "60", 5310: "62", 5320: "64",
            # UNII-2C (5.47-5.725 GHz)
            5500: "100", 5510: "102", 5520: "104", 5530: "106", 5540: "108", 5550: "110", 5560: "112",
            5570: "114", 5580: "116", 5590: "118", 5600: "120", 5610: "122", 5620: "124", 5630: "126",
            5640: "128", 5650: "130", 5660: "132", 5670: "134", 5680: "136", 5690: "138", 5700: "140",
            # UNII-3 (5.725-5.850 GHz)
            5745: "149", 5760: "151", 5775: "153", 5790: "155", 5805: "157", 5820: "159", 5835: "161", 5850: "165"
        }

        # For WiFi channels, frequencies are already at standard 5 MHz intervals
        # No need to round - use exact frequency matching
        rounded_freq = freq_mhz

        if rounded_freq in freq_to_channel_2_4:
            return freq_to_channel_2_4[rounded_freq]
        elif rounded_freq in freq_to_channel_5:
            return freq_to_channel_5[rounded_freq]
        else:
            return None

    def _get_channel_width(self, channel_str: str) -> Optional[str]:
        """Extract channel width from channel string"""
        if not channel_str:
            return None

        channel_lower = channel_str.lower()
        if "ht40" in channel_lower or "40" in channel_lower:
            return "40MHz"
        elif "ht80" in channel_lower or "80" in channel_lower:
            return "80MHz"
        elif "ht160" in channel_lower or "160" in channel_lower:
            return "160MHz"
        elif "vht" in channel_lower:
            return "VHT"
        else:
            return "20MHz"  # Default

    def _is_standard_wifi_frequency(self, freq_mhz: float) -> bool:
        """Check if frequency is a standard WiFi frequency"""
        return self._get_channel_from_precise_frequency(freq_mhz) is not None

    def _is_camera_frequency(self, freq_info: FrequencyInfo) -> bool:
        """Check if specific frequency is common for cameras"""
        if not freq_info or not freq_info.frequency_mhz:
            return False

        freq_mhz = freq_info.frequency_mhz

        # Common camera frequencies with precise values
        camera_frequencies = [
            # 2.4GHz camera-preferred channels
            2412,  # Channel 1
            2437,  # Channel 6 (most common for cameras)
            2462,  # Channel 11
            # 5GHz camera channels
            5180,  # Channel 36
            5220,  # Channel 44
            5745,  # Channel 149
            5825,  # Channel 165
        ]

        # Check if exact match or very close (within 2 MHz)
        for camera_freq in camera_frequencies:
            if abs(freq_mhz - camera_freq) <= 2:
                return True

        return False

    def _get_camera_frequency_confidence(self, freq_info: FrequencyInfo) -> float:
        """Get confidence boost for camera detection based on specific frequency"""
        if not freq_info or not freq_info.frequency_mhz:
            return 0.0

        freq_mhz = freq_info.frequency_mhz

        # High-confidence camera frequencies
        if freq_mhz == 2437:  # Channel 6 - most common for cameras
            return 0.15
        elif freq_mhz == 5180:  # Channel 36 - common for 5GHz cameras
            return 0.15
        elif freq_mhz == 5745:  # Channel 149 - common for 5GHz cameras
            return 0.10
        elif freq_mhz in [2412, 2462]:  # Channels 1 and 11
            return 0.08
        elif freq_mhz in [5220, 5825]:  # Other common 5GHz camera channels
            return 0.08
        elif freq_info.band == "2.4GHz":  # General 2.4GHz preference
            return 0.05
        elif freq_info.band == "5GHz":   # General 5GHz preference
            return 0.03
        else:
            return 0.0

    def test_connection(self) -> bool:
        """Test connection to Kismet server"""
        try:
            url = f"{self.host}/system/status.json"
            params = {'KISMET': self.api_key}
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            self.logger.info("Successfully connected to Kismet server")
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect to Kismet: {e}")
            return False

    def get_mac_vendor_api(self, mac: str) -> Optional[str]:
        """Get MAC vendor using macvendors.com API with caching and rate limiting"""
        if not mac or len(mac) < 8:
            return None

        # Extract first 3 octets (OUI) for vendor lookup
        # Format: XX:XX:XX or XXXXXX
        mac_clean = mac.upper().replace('-', ':')
        if ':' in mac_clean:
            oui = ':'.join(mac_clean.split(':')[:3])
        else:
            oui = mac_clean[:6]

        # Check cache first
        if oui in self.mac_vendor_cache:
            return self.mac_vendor_cache[oui]

        # Rate limiting - only lookup for promising candidates
        # Only check vendors for devices with camera-like characteristics
        # This reduces API calls significantly

        try:
            # Use macvendors.com API with longer timeout
            url = f"https://api.macvendors.com/{oui}"

            # Create a new session for vendor API to avoid conflicts
            vendor_session = requests.Session()
            vendor_session.headers.update({
                'User-Agent': 'KismetCameraDetector/1.0'
            })

            response = vendor_session.get(url, timeout=10)

            if response.status_code == 200:
                vendor = response.text.strip()
                self.mac_vendor_cache[oui] = vendor
                self.logger.debug(f"MAC vendor lookup: {oui} -> {vendor}")
                return vendor
            elif response.status_code == 429:
                # Rate limited - wait and try once more
                self.logger.warning(f"MAC vendor API rate limited for {oui}")
                time.sleep(1)
                response = vendor_session.get(url, timeout=5)
                if response.status_code == 200:
                    vendor = response.text.strip()
                    self.mac_vendor_cache[oui] = vendor
                    self.logger.debug(f"MAC vendor lookup (retry): {oui} -> {vendor}")
                    return vendor
                else:
                    self.mac_vendor_cache[oui] = None
                    return None
            else:
                # Cache failed lookups to avoid repeated attempts
                self.mac_vendor_cache[oui] = None
                return None

        except Exception as e:
            self.logger.debug(f"Failed to lookup MAC vendor for {oui}: {e}")
            self.mac_vendor_cache[oui] = None
            return None

    def get_devices(self, since_timestamp: Optional[int] = None) -> List[Device]:
        """Retrieve devices from Kismet API"""
        try:
            if since_timestamp:
                # Get devices active since timestamp
                url = f"{self.host}/devices/last-time/{since_timestamp}/devices.json"
            else:
                # Get all devices using the correct endpoint
                url = f"{self.host}/devices/views/all/devices.json"

            params = {'KISMET': self.api_key}
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            devices = []

            for device_data in data:
                device = self._parse_device(device_data)
                devices.append(device)

            self.logger.info(f"Retrieved {len(devices)} devices from Kismet")
            return devices

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                self.logger.warning("Endpoint not found, trying alternative method...")
                return self._get_devices_fallback()
            else:
                self.logger.error(f"HTTP error retrieving devices: {e}")
                return []
        except Exception as e:
            self.logger.error(f"Failed to retrieve devices: {e}")
            return []

    def _get_devices_fallback(self) -> List[Device]:
        """Alternative method to get devices using different endpoint"""
        try:
            import time

            # Try getting recent devices with a very short time window
            five_minutes_ago = int(time.time()) - 300
            url = f"{self.host}/devices/last-time/{five_minutes_ago}/devices.json"

            params = {'KISMET': self.api_key}
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            devices = []

            for device_data in data:
                device = self._parse_device(device_data)
                devices.append(device)

            self.logger.info(f"Retrieved {len(devices)} devices using fallback method")
            return devices

        except Exception as e:
            self.logger.error(f"Fallback method also failed: {e}")
            return []

    def _parse_device(self, device_data: Dict) -> Device:
        """Parse device data from Kismet API response with enhanced manufacturer detection"""
        # Extract basic device information from flat structure
        key = device_data.get('kismet.device.base.key', '')
        mac = device_data.get('kismet.device.base.macaddr', '')
        name = device_data.get('kismet.device.base.commonname', '') or device_data.get('kismet.device.base.name', '')
        type_name = device_data.get('kismet.device.base.type', '')
        kismet_manufacturer = device_data.get('kismet.device.base.manuf', '')

        # Enhanced manufacturer detection
        manufacturer_info = self._detect_manufacturer(mac, kismet_manufacturer)

        # Get signal information
        signal_data = device_data.get('kismet.device.base.signal', {})
        signal = signal_data.get('kismet.common.signal.last_signal') if signal_data else None

        # Get channel information
        channel = device_data.get('kismet.device.base.channel', '')

        # Get last seen time
        last_seen = device_data.get('kismet.device.base.last_time', '')

        # Get frequency and create enhanced frequency info
        frequency = device_data.get('kismet.device.base.frequency', '')
        frequency_info = self._create_frequency_info(frequency, channel)

        # Try to get IP addresses (check multiple possible locations)
        ip_addresses = []
        # Direct IP addresses
        if 'kismet.device.base.ip' in device_data:
            ip_data = device_data['kismet.device.base.ip']
            if isinstance(ip_data, list):
                for ip_entry in ip_data:
                    if isinstance(ip_entry, dict) and 'address' in ip_entry:
                        ip_addresses.append(ip_entry['address'])

        # Get device type set
        type_set = device_data.get('kismet.device.base.basic_type_set', [])

        return Device(
            key=key,
            mac=mac,
            name=name,
            type=type_name,
            signal=signal,
            channel=channel,
            vendor=kismet_manufacturer,
            manufacturer=manufacturer_info,
            frequency_info=frequency_info,
            ip_addresses=ip_addresses,
            last_seen=last_seen,
            raw_data=device_data
        )

    def identify_camera_devices(self, devices: List[Device]) -> List[CameraCandidate]:
        """Identify potential camera devices from the device list with packet analysis"""
        candidates = []

        for device in devices:
            confidence = 0
            reasons = []

            # Extract packet data from raw device data
            packet_data = self._extract_packet_data(device.raw_data)

            # Enhanced camera detection with packet analysis
            confidence, reasons = self._assess_camera_likelihood(
                device, packet_data, confidence, reasons
            )

            # Enhanced MAC vendor API lookup for promising candidates
            # This significantly reduces API calls and avoids rate limiting
            if self.use_mac_api and confidence > 0.1:
                # Get accurate MAC vendor from API if we don't have enhanced manufacturer info
                if not device.manufacturer or device.manufacturer.source == "inferred":
                    api_vendor = self.get_mac_vendor_api(device.mac)
                    if api_vendor:
                        # Create enhanced manufacturer info from API response
                        api_manufacturer = self._create_manufacturer_info(
                            api_vendor, "mac_api", 0.8, api_vendor
                        )
                        device.manufacturer = api_manufacturer

                        # Re-evaluate confidence with accurate manufacturer
                        manufacturer_confidence = self._evaluate_vendor_for_camera(api_manufacturer)
                        if manufacturer_confidence > 0:
                            confidence += manufacturer_confidence
                            if manufacturer_confidence > 0.2:
                                reasons.append(f"Camera manufacturer from API: {api_manufacturer.name}")
                            elif manufacturer_confidence < -0.1:
                                reasons.append(f"Non-camera manufacturer from API: {api_manufacturer.name}")
            elif self.use_mac_api and not device.manufacturer:
                reasons.append("MAC vendor API lookup failed")

            # Only add as candidate if confidence meets threshold
            if confidence >= 0.3:
                # Check for open camera ports
                open_ports = self._check_camera_ports(device.ip_addresses)
                if open_ports:
                    confidence += 0.2
                    reasons.append(f"Open camera ports: {open_ports}")

                candidate = CameraCandidate(
                    device=device,
                    confidence=min(confidence, 1.0),
                    reasons=reasons,
                    open_ports=open_ports
                )
                candidates.append(candidate)
            elif confidence > 0:
                # Debug: show near-miss candidates
                self.logger.debug(f"Near-miss candidate: {device.name} - confidence: {confidence:.2f} - reasons: {reasons}")

        # Sort by confidence
        candidates.sort(key=lambda x: x.confidence, reverse=True)
        return candidates

    def _evaluate_vendor_for_camera(self, manufacturer: Optional[ManufacturerInfo]) -> float:
        """Enhanced vendor evaluation using ManufacturerInfo object"""
        if not manufacturer:
            return 0

        # Use category-based confidence boost
        base_confidence = CATEGORY_CONFIDENCE_BOOST.get(manufacturer.category, 0.0)

        # Additional confidence based on manufacturer-specific knowledge
        if manufacturer.is_known_camera:
            base_confidence += 0.2

        # Adjust based on source reliability
        source_boost = {
            "hardcoded": 0.1,
            "mac_api": 0.05,
            "kismet": 0.0,
            "inferred": -0.05
        }
        base_confidence += source_boost.get(manufacturer.source, 0.0)

        return base_confidence

    def _extract_packet_data(self, raw_device_data):
        """Extract packet data from raw Kismet device data"""
        return {
            'total_packets': raw_device_data.get('kismet.device.base.packets.total', 0),
            'rx_packets': raw_device_data.get('kismet.device.base.packets.rx_total', 0),
            'tx_packets': raw_device_data.get('kismet.device.base.packets.tx_total', 0),
            'data_packets': raw_device_data.get('kismet.device.base.packets.data', 0),
            'llc_packets': raw_device_data.get('kismet.device.base.packets.llc', 0)
        }

    def _assess_camera_likelihood(self, device, packet_data, confidence, reasons):
        """Enhanced camera likelihood assessment with packet analysis"""
        total_packets = packet_data['total_packets']
        tx_packets = packet_data['tx_packets']
        data_packets = packet_data['data_packets']

        # Calculate ratios
        tx_ratio = tx_packets / total_packets if total_packets > 0 else 0
        data_ratio = data_packets / total_packets if total_packets > 0 else 0

        # Enhanced manufacturer evaluation
        if device.manufacturer:
            manufacturer_confidence = self._evaluate_vendor_for_camera(device.manufacturer)
            confidence += manufacturer_confidence

            if manufacturer_confidence > 0.1:
                reasons.append(f"Camera manufacturer: {device.manufacturer.name} ({device.manufacturer.category})")
            elif manufacturer_confidence < -0.1:
                reasons.append(f"Non-camera manufacturer: {device.manufacturer.name} ({device.manufacturer.category})")

            # Add source information for high-confidence matches
            if manufacturer_confidence > 0.2 and device.manufacturer.source != "inferred":
                reasons.append(f"Manufacturer source: {device.manufacturer.source}")
        else:
            # No manufacturer information available
            reasons.append("No manufacturer information available")

        # Enhanced frequency analysis for camera detection
        if device.frequency_info:
            frequency_confidence = self._get_camera_frequency_confidence(device.frequency_info)
            confidence += frequency_confidence

            if frequency_confidence > 0.05:
                freq_display = device.frequency_info.get_display_frequency()
                reasons.append(f"Camera frequency: {freq_display} (Channel {device.frequency_info.channel})")
            elif frequency_confidence < -0.05:
                freq_display = device.frequency_info.get_display_frequency()
                reasons.append(f"Unusual frequency for camera: {freq_display}")

            # Add frequency-specific indicators
            if self._is_camera_frequency(device.frequency_info):
                reasons.append(f"Common camera frequency band: {device.frequency_info.band}")
        else:
            # No frequency information available
            reasons.append("No frequency information available")

        # Check device name for camera keywords
        name_match = self._check_device_name(device.name)
        if name_match:
            confidence += 0.3
            reasons.append(f"Device name contains: {name_match}")

        # NEW: Enhanced device type analysis
        device_type_lower = device.type.lower()
        if device_type_lower == 'wi-fi ap':
            confidence -= 0.5  # Strong negative indicator
            reasons.append("Access Point (unlikely to be camera)")
        elif device_type_lower in ['wi-fi client', 'wi-fi bridged']:
            confidence += 0.1
            reasons.append("Wireless client (could be camera)")
        elif device_type_lower in ['wireless', 'wifi', '802.11']:
            confidence += 0.05  # Weak positive

        # NEW: Packet count analysis
        if total_packets < 200:
            confidence += 0.2
            reasons.append("Low packet count (typical of cameras)")
        elif total_packets > 5000:
            confidence -= 0.3
            reasons.append("High packet count (typical of APs)")

        # NEW: Traffic pattern analysis
        if total_packets > 1000 and tx_ratio > 0.9 and data_ratio < 0.05:
            confidence -= 0.4
            reasons.append("AP beacon traffic pattern (high TX, low data)")
        elif data_ratio > 0.3:
            confidence += 0.2
            reasons.append("High data ratio (possible video streaming)")

        # NEW: Enhanced manufacturer check for camera brands
        if device.vendor:
            vendor_lower = device.vendor.lower()
            camera_brands = [
                'axis', 'canon', 'sony', 'panasonic', 'foscam', 'hikvision', 'dahua',
                'd-link', 'tp-link', 'netgear', 'linksys', 'asus', 'tenda',
                'tplink', 'dahua', 'uniview', 'avtech', 'zmodo', 'swann',
                'lorex', 'qsee', 'night owl', 'lorex', 'amcrest', 'reolink'
            ]

            # Enhanced camera brand detection
            for brand in camera_brands:
                if brand in vendor_lower:
                    confidence += 0.3
                    reasons.append(f"Camera manufacturer: {device.vendor}")
                    break

            # Check for IoT/Smart home manufacturers (often make cameras)
            iot_brands = ['xiaomi', 'wyze', 'arlo', 'blink', 'ring', 'nest', 'google', 'amazon']
            for brand in iot_brands:
                if brand in vendor_lower:
                    confidence += 0.2
                    reasons.append(f"IoT/Smart manufacturer: {device.vendor}")
                    break

            # Check for network equipment manufacturers (usually NOT cameras)
            network_brands = ['cisco', 'juniper', 'aruba', 'ruckus', 'fortinet', 'ubiquiti']
            for brand in network_brands:
                if brand in vendor_lower:
                    confidence -= 0.2
                    reasons.append(f"Network equipment manufacturer: {device.vendor}")
                    break

        # Check for multiple IP addresses (might indicate multi-interface camera)
        if len(device.ip_addresses or []) > 1:
            confidence += 0.1
            reasons.append("Multiple IP addresses")

        # Normalize confidence to 0-1 range
        confidence = max(0.0, min(1.0, confidence))

        return confidence, reasons

    def _create_manufacturer_info(self, name: str, source: str, confidence: float = 0.5, raw_name: str = None) -> ManufacturerInfo:
        """Create a ManufacturerInfo object with normalized data"""
        # Normalize manufacturer name
        normalized_name = self._normalize_manufacturer_name(name)

        # Determine category
        category = self._determine_manufacturer_category(normalized_name, name)

        # Check if known camera manufacturer
        is_known_camera = category == "camera" or self._is_camera_brand(normalized_name)

        # Get aliases for this manufacturer
        aliases = MANUFACTURER_ALIASES.get(normalized_name, [])

        return ManufacturerInfo(
            name=normalized_name,
            confidence=confidence,
            source=source,
            category=category,
            is_known_camera=is_known_camera,
            aliases=aliases,
            raw_name=raw_name or name
        )

    def _normalize_manufacturer_name(self, name: str) -> str:
        """Normalize manufacturer name to standard form"""
        if not name:
            return "Unknown"

        name_lower = name.lower()

        # Check for exact matches first
        for standard_name, aliases in MANUFACTURER_ALIASES.items():
            if name_lower == standard_name.lower() or name_lower in [alias.lower() for alias in aliases]:
                return standard_name

        # Check partial matches for variations
        for standard_name, aliases in MANUFACTURER_ALIASES.items():
            if any(alias.lower() in name_lower for alias in aliases):
                return standard_name

        return name.strip()

    def _determine_manufacturer_category(self, normalized_name: str, original_name: str) -> str:
        """Determine manufacturer category based on name and database"""
        # Check our database first
        for mac_data in MANUFACTURER_DATABASE.values():
            if mac_data["name"] == normalized_name:
                return mac_data["category"]

        # Infer category from name patterns
        name_lower = normalized_name.lower()

        # Camera indicators
        camera_terms = ['axis', 'hikvision', 'dahua', 'foscam', 'reolink', 'amcrest', 'swann', 'lorex']
        if any(term in name_lower for term in camera_terms):
            return "camera"

        # Networking indicators
        network_terms = ['cisco', 'juniper', 'aruba', 'ruckus', 'fortinet', 'ubiquiti', 'tp-link', 'netgear', 'linksys']
        if any(term in name_lower for term in network_terms):
            return "networking"

        # Computing indicators
        computing_terms = ['apple', 'microsoft', 'intel', 'amd', 'dell', 'hp']
        if any(term in name_lower for term in computing_terms):
            return "computing"

        # IoT/Smart home indicators
        iot_terms = ['google', 'amazon', 'samsung', 'xiaomi', 'wyze', 'arlo', 'ring', 'nest']
        if any(term in name_lower for term in iot_terms):
            return "iot"

        return "unknown"

    def _is_camera_brand(self, normalized_name: str) -> bool:
        """Check if manufacturer is a known camera brand"""
        camera_brands = [
            'axis communications', 'canon', 'sony', 'panasonic', 'hikvision digital technology',
            'dahua technology', 'amcrest technologies', 'foscam', 'reolink', 'swann communications',
            'lorex technology', 'wyze labs', 'ring', 'arlo technologies', 'nest labs'
        ]
        return normalized_name.lower() in [brand.lower() for brand in camera_brands]

    def _detect_manufacturer(self, mac: str, kismet_vendor: str = None) -> Optional[ManufacturerInfo]:
        """Enhanced manufacturer detection using multiple sources"""
        if not mac:
            return None

        # Normalize MAC address
        mac = mac.upper().replace('-', ':')

        # Method 1: Check our enhanced database
        if len(mac) >= 8:
            oui = mac[:8]
            if oui in MANUFACTURER_DATABASE:
                db_info = MANUFACTURER_DATABASE[oui]
                return self._create_manufacturer_info(
                    db_info["name"],
                    "hardcoded",
                    db_info["confidence"]
                )

        # Method 2: Use Kismet vendor if available
        if kismet_vendor and kismet_vendor.lower() != 'unknown':
            return self._create_manufacturer_info(kismet_vendor, "kismet", 0.6)

        # Method 3: Try MAC vendor API if enabled
        if self.use_mac_api:
            api_vendor = self.get_mac_vendor_api(mac)
            if api_vendor and api_vendor.lower() != 'unknown':
                return self._create_manufacturer_info(api_vendor, "mac_api", 0.8)

        return None

    def _check_device_name(self, name: str) -> Optional[str]:
        """Check if device name contains camera-related keywords"""
        if not name:
            return None

        name_lower = name.lower()
        for keyword in CAMERA_KEYWORDS:
            if keyword in name_lower:
                return keyword

        return None

    def _check_camera_ports(self, ip_addresses: List[str]) -> List[int]:
        """Check if device has open camera-related ports"""
        if not ip_addresses:
            return []

        open_ports = []
        for ip in ip_addresses[:3]:  # Limit to avoid too many scans
            for port in CAMERA_PORTS[:3]:  # Check most common ports first
                if self._is_port_open(ip, port):
                    open_ports.append(port)
                    break  # Found one open port, that's enough for confidence

        return open_ports

    def _is_port_open(self, ip: str, port: int, timeout: float = 1.0) -> bool:
        """Check if a specific port is open on the target IP"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((ip, port))
            sock.close()
            return result == 0
        except Exception:
            return False

    def display_results(self, candidates: List[CameraCandidate]):
        """Enhanced camera detection results display with manufacturer information"""
        print(f"\n{'='*60}")
        print("CAMERA DEVICE DETECTION RESULTS")
        print(f"{'='*60}")
        print(f"Found {len(candidates)} potential camera devices:\n")

        for i, candidate in enumerate(candidates, 1):
            device = candidate.device

            # Device name and confidence
            print(f"{i}. {device.name or 'Unknown Device'}")
            print(f"   Confidence: {candidate.confidence:.1%}")

            # Enhanced manufacturer display
            if device.manufacturer:
                # Color coding by category (using simple text formatting)
                category_symbol = self._get_category_symbol(device.manufacturer.category)
                print(f"   Manufacturer: {device.manufacturer.name} {category_symbol}")
                print(f"   Category: {device.manufacturer.category.title()} (Source: {device.manufacturer.source})")

                if device.manufacturer.aliases:
                    print(f"   Also known as: {', '.join(device.manufacturer.aliases[:2])}")
            else:
                print(f"   Manufacturer: Unknown")

            # Enhanced precise frequency display
            if device.frequency_info:
                freq_display = device.frequency_info.get_display_frequency()
                band_symbol = self._get_frequency_band_symbol(device.frequency_info.band)
                print(f"   Frequency: {freq_display} {band_symbol} (Band: {device.frequency_info.band})")
                print(f"   Channel: {device.frequency_info.channel}" if device.frequency_info.channel else "   Channel: N/A")
                if device.frequency_info.channel_width:
                    print(f"   Channel Width: {device.frequency_info.channel_width}")
            else:
                print(f"   Frequency: Unknown")
                print(f"   Channel: {device.channel}" if device.channel else "   Channel: N/A")

            # Basic device info
            print(f"   MAC: {device.mac}")
            print(f"   Type: {device.type}")
            print(f"   Signal: {device.signal} dBm" if device.signal else "   Signal: N/A")

            if device.ip_addresses:
                print(f"   IPs: {', '.join(device.ip_addresses)}")

            if candidate.open_ports:
                print(f"   Open Ports: {', '.join(map(str, candidate.open_ports))}")

            print(f"   Detection Reasons:")
            for reason in candidate.reasons:
                print(f"     • {reason}")
            print()

    def _get_category_symbol(self, category: str) -> str:
        """Get a symbol for manufacturer category"""
        symbols = {
            "camera": "📹",
            "networking": "🌐",
            "computing": "💻",
            "iot": "🏠",
            "unknown": "❓"
        }
        return symbols.get(category, "❓")

    def _get_frequency_band_symbol(self, band: str) -> str:
        """Get a symbol for frequency band"""
        symbols = {
            "2.4GHz": "📡",
            "5GHz": "📶",
            "6GHz": "📡",
            "unknown": "❓"
        }
        return symbols.get(band, "❓")

    def display_manufacturer_summary(self, candidates: List[CameraCandidate]):
        """Display manufacturer statistics summary"""
        if not candidates:
            return

        manufacturer_counts = {}
        category_counts = {}

        for candidate in candidates:
            if candidate.device.manufacturer:
                mfr = candidate.device.manufacturer.name
                cat = candidate.device.manufacturer.category
                manufacturer_counts[mfr] = manufacturer_counts.get(mfr, 0) + 1
                category_counts[cat] = category_counts.get(cat, 0) + 1

        print(f"\n{'='*60}")
        print("MANUFACTURER SUMMARY")
        print(f"{'='*60}")

        if manufacturer_counts:
            print("Top Manufacturers:")
            for mfr, count in sorted(manufacturer_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"  • {mfr}: {count} device(s)")

        if category_counts:
            print("\nDevice Categories:")
            for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
                symbol = self._get_category_symbol(cat)
                print(f"  {symbol} {cat.title()}: {count} device(s)")
        print()

    def display_frequency_summary(self, candidates: List[CameraCandidate]):
        """Display precise frequency statistics summary"""
        if not candidates:
            return

        frequency_counts = {}
        band_counts = {}
        channel_counts = {}

        for candidate in candidates:
            if candidate.device.frequency_info:
                freq_display = candidate.device.frequency_info.get_display_frequency()
                band = candidate.device.frequency_info.band
                channel = candidate.device.frequency_info.channel

                if freq_display:
                    frequency_counts[freq_display] = frequency_counts.get(freq_display, 0) + 1
                if band:
                    band_counts[band] = band_counts.get(band, 0) + 1
                if channel:
                    channel_counts[channel] = channel_counts.get(channel, 0) + 1

        print(f"\n{'='*60}")
        print("PRECISE FREQUENCY SUMMARY")
        print(f"{'='*60}")

        if frequency_counts:
            print("Top Precise Frequencies:")
            for freq, count in sorted(frequency_counts.items(), key=lambda x: x[1], reverse=True):
                symbol = self._get_frequency_band_symbol(self._get_band_from_frequency_display(freq))
                print(f"  {symbol} {freq}: {count} device(s)")

        if band_counts:
            print("\nFrequency Bands:")
            for band, count in sorted(band_counts.items(), key=lambda x: x[1], reverse=True):
                symbol = self._get_frequency_band_symbol(band)
                print(f"  {symbol} {band}: {count} device(s)")

        if channel_counts:
            print("\nTop Channels:")
            for channel, count in sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"  📺 Channel {channel}: {count} device(s)")
        print()

    def _get_band_from_frequency_display(self, freq_display: str) -> str:
        """Extract band from frequency display string"""
        freq_ghz = float(freq_display.split()[0])
        freq_mhz = freq_ghz * 1000
        return self._classify_frequency_band(freq_mhz)

    def filter_by_manufacturer(self, candidates: List[CameraCandidate], manufacturer_filter: str) -> List[CameraCandidate]:
        """Filter candidates by manufacturer name"""
        filtered = []
        filter_lower = manufacturer_filter.lower()

        for candidate in candidates:
            if candidate.device.manufacturer:
                # Check manufacturer name and aliases
                mfr_name = candidate.device.manufacturer.name.lower()
                aliases = [alias.lower() for alias in candidate.device.manufacturer.aliases]

                if (filter_lower in mfr_name or
                    any(filter_lower in alias for alias in aliases)):
                    filtered.append(candidate)

        return filtered

    def filter_by_category(self, candidates: List[CameraCandidate], category_filter: str) -> List[CameraCandidate]:
        """Filter candidates by manufacturer category"""
        return [
            candidate for candidate in candidates
            if candidate.device.manufacturer and
            candidate.device.manufacturer.category == category_filter
        ]

    def filter_by_exact_frequency(self, candidates: List[CameraCandidate], exact_freq_ghz: float, tolerance: float = 0.001) -> List[CameraCandidate]:
        """Filter candidates by exact frequency in GHz with tolerance"""
        filtered = []
        for candidate in candidates:
            if candidate.device.frequency_info and candidate.device.frequency_info.frequency_ghz:
                if abs(candidate.device.frequency_info.frequency_ghz - exact_freq_ghz) <= tolerance:
                    filtered.append(candidate)
        return filtered

    def filter_by_frequency_range(self, candidates: List[CameraCandidate], range_str: str) -> List[CameraCandidate]:
        """Filter candidates by frequency range in GHz (e.g., '2.430-2.450')"""
        try:
            if '-' not in range_str:
                return []

            start_str, end_str = range_str.split('-', 1)
            start_freq = float(start_str.strip())
            end_freq = float(end_str.strip())

            filtered = []
            for candidate in candidates:
                if candidate.device.frequency_info and candidate.device.frequency_info.frequency_ghz:
                    freq = candidate.device.frequency_info.frequency_ghz
                    if start_freq <= freq <= end_freq:
                        filtered.append(candidate)
            return filtered
        except (ValueError, TypeError):
            return []

    def filter_by_frequency_band(self, candidates: List[CameraCandidate], band_filter: str) -> List[CameraCandidate]:
        """Filter candidates by frequency band"""
        return [
            candidate for candidate in candidates
            if candidate.device.frequency_info and
            candidate.device.frequency_info.band == band_filter
        ]

    def filter_by_channel(self, candidates: List[CameraCandidate], channel_filter: str) -> List[CameraCandidate]:
        """Filter candidates by channel number"""
        return [
            candidate for candidate in candidates
            if candidate.device.frequency_info and
            candidate.device.frequency_info.channel == channel_filter
        ]

    def group_by_frequency(self, candidates: List[CameraCandidate]) -> Dict[str, List[CameraCandidate]]:
        """Group candidates by precise frequency"""
        groups = {}
        for candidate in candidates:
            if candidate.device.frequency_info:
                freq_display = candidate.device.frequency_info.get_display_frequency()
                if freq_display:
                    if freq_display not in groups:
                        groups[freq_display] = []
                    groups[freq_display].append(candidate)
        return groups

    def group_by_manufacturer(self, candidates: List[CameraCandidate]) -> Dict[str, List[CameraCandidate]]:
        """Group candidates by manufacturer"""
        groups = {}
        for candidate in candidates:
            mfr_name = candidate.device.manufacturer.name if candidate.device.manufacturer else "Unknown"
            if mfr_name not in groups:
                groups[mfr_name] = []
            groups[mfr_name].append(candidate)
        return groups

    def display_grouped_results(self, candidates: List[CameraCandidate]):
        """Display results grouped by manufacturer"""
        groups = self.group_by_manufacturer(candidates)

        print(f"\n{'='*60}")
        print("CAMERA DEVICES GROUPED BY MANUFACTURER")
        print(f"{'='*60}")
        print(f"Found {len(candidates)} potential camera devices from {len(groups)} manufacturers:\n")

        for manufacturer, mfr_candidates in sorted(groups.items()):
            if mfr_candidates:
                device = mfr_candidates[0].device
                category_symbol = self._get_category_symbol(device.manufacturer.category) if device.manufacturer else "❓"
                category = device.manufacturer.category.title() if device.manufacturer else "Unknown"

                print(f"📁 {manufacturer} {category_symbol} ({category}) - {len(mfr_candidates)} device(s)")
                print("-" * 50)

                for i, candidate in enumerate(mfr_candidates, 1):
                    device = candidate.device
                    print(f"  {i}. {device.name or 'Unknown Device'}")
                    print(f"     Confidence: {candidate.confidence:.1%}")
                    print(f"     MAC: {device.mac}")
                    print(f"     Type: {device.type}")

                    if device.ip_addresses:
                        print(f"     IPs: {', '.join(device.ip_addresses)}")

                    if candidate.open_ports:
                        print(f"     Open Ports: {', '.join(map(str, candidate.open_ports))}")

                    # Show key detection reasons only
                    key_reasons = [r for r in candidate.reasons if
                                 any(keyword in r.lower() for keyword in ['camera', 'manufacturer', 'vendor'])]
                    if key_reasons:
                        print(f"     Key Indicators:")
                        for reason in key_reasons[:2]:  # Show max 2 key reasons
                            print(f"       • {reason}")
                print()

    def display_grouped_by_frequency(self, candidates: List[CameraCandidate]):
        """Display results grouped by precise frequency"""
        groups = self.group_by_frequency(candidates)

        print(f"\n{'='*60}")
        print("CAMERA DEVICES GROUPED BY PRECISE FREQUENCY")
        print(f"{'='*60}")
        print(f"Found {len(candidates)} potential camera devices across {len(groups)} frequencies:\n")

        for frequency, freq_candidates in sorted(groups.items(), key=lambda x: float(x[0].split()[0])):
            if freq_candidates:
                device = freq_candidates[0].device
                band_symbol = self._get_frequency_band_symbol(device.frequency_info.band) if device.frequency_info else "❓"
                band = device.frequency_info.band if device.frequency_info else "Unknown"
                channel = device.frequency_info.channel if device.frequency_info else "Unknown"

                print(f"📡 {frequency} {band_symbol} (Band: {band}, Channel: {channel}) - {len(freq_candidates)} device(s)")
                print("-" * 50)

                for i, candidate in enumerate(freq_candidates, 1):
                    device = candidate.device
                    print(f"  {i}. {device.name or 'Unknown Device'}")
                    print(f"     Confidence: {candidate.confidence:.1%}")
                    print(f"     MAC: {device.mac}")
                    print(f"     Type: {device.type}")

                    if device.manufacturer:
                        mfr_symbol = self._get_category_symbol(device.manufacturer.category)
                        print(f"     Manufacturer: {device.manufacturer.name} {mfr_symbol}")

                    if device.ip_addresses:
                        print(f"     IPs: {', '.join(device.ip_addresses)}")

                    if candidate.open_ports:
                        print(f"     Open Ports: {', '.join(map(str, candidate.open_ports))}")

                    # Show key detection reasons only
                    key_reasons = [r for r in candidate.reasons if
                                 any(keyword in r.lower() for keyword in ['camera', 'manufacturer', 'frequency'])]
                    if key_reasons:
                        print(f"     Key Indicators:")
                        for reason in key_reasons[:2]:  # Show max 2 key reasons
                            print(f"       • {reason}")
                print()

def main():
    parser = argparse.ArgumentParser(description='Detect camera devices using Kismet')
    parser.add_argument('--host', help='Kismet server URL (default: http://localhost:2501)')
    parser.add_argument('--api-key', help='Kismet API key (set via KISMET_API_KEY env var)')
    parser.add_argument('--since', type=int, help='Get devices since timestamp')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--use-mac-api', action='store_true', help='Use MAC vendor API (may be rate limited)')

    # Enhanced manufacturer options
    parser.add_argument('--group-by-manufacturer', action='store_true',
                       help='Group results by manufacturer')
    parser.add_argument('--manufacturer-filter', type=str,
                       help='Filter by manufacturer name (e.g., "hikvision", "axis")')
    parser.add_argument('--category-filter', type=str, choices=['camera', 'networking', 'computing', 'iot'],
                       help='Filter by manufacturer category')
    parser.add_argument('--show-manufacturer-summary', action='store_true', default=True,
                       help='Show manufacturer summary statistics (default: enabled)')
    parser.add_argument('--no-manufacturer-summary', action='store_true',
                       help='Hide manufacturer summary statistics')

    # Enhanced precise frequency options
    parser.add_argument('--exact-frequency', type=float,
                       help='Filter by exact frequency in GHz (e.g., 2.437, 5.180)')
    parser.add_argument('--frequency-range', type=str,
                       help='Filter by frequency range in GHz (e.g., "2.430-2.450" or "5.180-5.220")')
    parser.add_argument('--frequency-band', type=str, choices=['2.4GHz', '5GHz', '6GHz'],
                       help='Filter by frequency band')
    parser.add_argument('--channel-filter', type=str,
                       help='Filter by channel number (e.g., "6", "36", "149")')
    parser.add_argument('--group-by-frequency', action='store_true',
                       help='Group results by frequency')
    parser.add_argument('--no-frequency-summary', action='store_true',
                       help='Hide frequency summary statistics')

    args = parser.parse_args()

    # Get host and API key from arguments or environment
    host = args.host or os.getenv('KISMET_HOST', 'http://localhost:2501')
    api_key = args.api_key or os.getenv('KISMET_API_KEY')

    if not api_key:
        print("Error: Kismet API key is required.")
        print("Set it via:")
        print("  1. KISMET_API_KEY environment variable")
        print("  2. --api-key command line argument")
        print("\nExample:")
        print("  export KISMET_API_KEY='your_api_key_here'")
        print("  python camera_detector.py")
        print("  # OR")
        print("  python camera_detector.py --api-key your_api_key_here")
        return 1

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize detector
    use_mac_api = args.use_mac_api
    if use_mac_api:
        print("Note: MAC vendor API enabled (may encounter rate limits)")

    detector = KismetCameraDetector(host, api_key, use_mac_api)

    # Test connection
    if not detector.test_connection():
        print("Failed to connect to Kismet server. Please check the host and API key.")
        print(f"Host: {host}")
        return 1

    # Get devices
    print("Retrieving devices from Kismet...")
    devices = detector.get_devices(args.since)

    if not devices:
        print("No devices found.")
        return 0

    # Identify camera candidates
    candidates = detector.identify_camera_devices(devices)

    if not candidates:
        print("No potential camera devices found.")
        return 0

    # Apply filters if specified
    if args.manufacturer_filter:
        original_count = len(candidates)
        candidates = detector.filter_by_manufacturer(candidates, args.manufacturer_filter)
        print(f"Filtered by manufacturer '{args.manufacturer_filter}': {len(candidates)} devices (from {original_count})")

    if args.category_filter:
        original_count = len(candidates)
        candidates = detector.filter_by_category(candidates, args.category_filter)
        print(f"Filtered by category '{args.category_filter}': {len(candidates)} devices (from {original_count})")

    # Apply frequency filters if specified
    if args.exact_frequency:
        original_count = len(candidates)
        candidates = detector.filter_by_exact_frequency(candidates, args.exact_frequency)
        print(f"Filtered by exact frequency '{args.exact_frequency:.3f} GHz': {len(candidates)} devices (from {original_count})")

    if args.frequency_range:
        original_count = len(candidates)
        candidates = detector.filter_by_frequency_range(candidates, args.frequency_range)
        print(f"Filtered by frequency range '{args.frequency_range} GHz': {len(candidates)} devices (from {original_count})")

    if args.frequency_band:
        original_count = len(candidates)
        candidates = detector.filter_by_frequency_band(candidates, args.frequency_band)
        print(f"Filtered by frequency band '{args.frequency_band}': {len(candidates)} devices (from {original_count})")

    if args.channel_filter:
        original_count = len(candidates)
        candidates = detector.filter_by_channel(candidates, args.channel_filter)
        print(f"Filtered by channel '{args.channel_filter}': {len(candidates)} devices (from {original_count})")

    # Display results based on grouping preference
    if args.group_by_frequency:
        detector.display_grouped_by_frequency(candidates)
    elif args.group_by_manufacturer:
        detector.display_grouped_results(candidates)
    else:
        detector.display_results(candidates)

    # Display manufacturer summary if not disabled
    if not args.no_manufacturer_summary:
        detector.display_manufacturer_summary(candidates)

    # Display precise frequency summary if not disabled
    if not args.no_frequency_summary:
        detector.display_frequency_summary(candidates)

    return 0

if __name__ == "__main__":
    exit(main())