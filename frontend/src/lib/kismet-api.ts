import {
  Device,
  CameraCandidate,
  KismetDeviceResponse,
  KismetStatusResponse,
  ManufacturerInfo,
  FrequencyInfo,
  InterferenceInfo,
  PacketData,
  ManufacturerDatabaseEntry,
  KismetConfig,
  DataSourceInterface,
  DataSourceConfig,
  AddSourceRequest,
  ConfigureSourceRequest
} from '@/types/kismet';

// Enhanced manufacturer database with categories and confidence
export const MANUFACTURER_DATABASE: Record<string, ManufacturerDatabaseEntry> = {
  // Camera Manufacturers
  "00:12:15": {name: "Axis Communications", category: "camera", confidence: 0.9},
  "00:04:23": {name: "Canon", category: "camera", confidence: 0.85},
  "00:1D:C1": {name: "Canon", category: "camera", confidence: 0.85},
  "00:1E:8F": {name: "Canon", category: "camera", confidence: 0.85},
  "00:26:AB": {name: "Canon", category: "camera", confidence: 0.85},
  "00:40:8C": {name: "Sony", category: "camera", confidence: 0.85},
  "00:50:DA": {name: "Sony", category: "camera", confidence: 0.85},
  "00:05:1C": {name: "Panasonic", category: "camera", confidence: 0.85},
  "00:0F:F7": {name: "Panasonic", category: "camera", confidence: 0.85},
  "B8:27:EB": {name: "Raspberry Pi Foundation", category: "iot", confidence: 0.7},
  "DC:A6:32": {name: "Raspberry Pi Foundation", category: "iot", confidence: 0.7},
  "E4:5F:01": {name: "Raspberry Pi Foundation", category: "iot", confidence: 0.7},

  // Additional Camera Brands
  "00:12:0E": {name: "Hikvision Digital Technology", category: "camera", confidence: 0.9},
  "00:26:7C": {name: "Hikvision Digital Technology", category: "camera", confidence: 0.9},
  "68:A3:C4": {name: "Hikvision Digital Technology", category: "camera", confidence: 0.9},
  "00:1E:58": {name: "Dahua Technology", category: "camera", confidence: 0.9},
  "AC:5A:FC": {name: "Dahua Technology", category: "camera", confidence: 0.9},
  "00:17:88": {name: "Amcrest Technologies", category: "camera", confidence: 0.85},
  "00:16:6C": {name: "Amcrest Technologies", category: "camera", confidence: 0.85},
  "C4:5E:0C": {name: "Wyze Labs", category: "camera", confidence: 0.8},
  "34:CE:00": {name: "Wyze Labs", category: "camera", confidence: 0.8},
  "40:B4:CD": {name: "Ring", category: "camera", confidence: 0.85},
  "F0:B4:29": {name: "Ring", category: "camera", confidence: 0.85},
  "54:4A:00": {name: "Arlo Technologies", category: "camera", confidence: 0.85},
  "70:88:6B": {name: "Arlo Technologies", category: "camera", confidence: 0.85},
  "18:B4:30": {name: "Reolink", category: "camera", confidence: 0.85},
  "28:6E:D4": {name: "Reolink", category: "camera", confidence: 0.85},
  "00:8E:F2": {name: "Foscam", category: "camera", confidence: 0.8},
  "C0:4A:00": {name: "Foscam", category: "camera", confidence: 0.8},
  "00:0D:C5": {name: "D-Link", category: "camera", confidence: 0.75},
  "1C:BD:B9": {name: "D-Link", category: "camera", confidence: 0.75},
  "00:07:50": {name: "Swann Communications", category: "camera", confidence: 0.8},
  "00:1B:1F": {name: "Swann Communications", category: "camera", confidence: 0.8},
  "00:90:F5": {name: "Lorex Technology", category: "camera", confidence: 0.8},
  "00:40:63": {name: "Lorex Technology", category: "camera", confidence: 0.8},

  // Additional Chinese/IoT Camera Brands
  "94:F8:27": {name: "Shanghai Imilab Technology Co.Ltd", category: "camera", confidence: 0.85},
    "64:09:80": {name: "Xiaomi Communications", category: "iot", confidence: 0.8},
  "50:8F:4C": {name: "Xiaomi Communications", category: "iot", confidence: 0.8},
    "A0:91:25": {name: "Hiseeu", category: "camera", confidence: 0.8},
    "B4:42:3F": {name: "TP-Link Tapo", category: "camera", confidence: 0.8},
  "50:C7:BF": {name: "TP-Link Tapo", category: "camera", confidence: 0.8},
    "28:E3:1F": {name: "EZVIZ", category: "camera", confidence: 0.85},
  "70:4F:81": {name: "EZVIZ", category: "camera", confidence: 0.85},
  
  // Networking Equipment (often confused with cameras)
  "00:1B:11": {name: "Ubiquiti Networks", category: "networking", confidence: 0.7},
  "04:18:D6": {name: "Ubiquiti Networks", category: "networking", confidence: 0.7},
  "80:2A:A8": {name: "Ubiquiti Networks", category: "networking", confidence: 0.7},
  "E8:94:F6": {name: "Ubiquiti Networks", category: "networking", confidence: 0.7},
  "00:C0:CA": {name: "TP-Link", category: "networking", confidence: 0.7},
    "68:FF:7B": {name: "TP-Link", category: "networking", confidence: 0.7},
    "30:46:9A": {name: "Netgear", category: "networking", confidence: 0.7},
  "A0:C5:89": {name: "Netgear", category: "networking", confidence: 0.7},
  "00:04:ED": {name: "Linksys", category: "networking", confidence: 0.7},
  "00:18:01": {name: "Linksys", category: "networking", confidence: 0.7},
  "00:1D:0F": {name: "ASUSTek Computer", category: "networking", confidence: 0.7},
  "04:D4:C4": {name: "ASUSTek Computer", category: "networking", confidence: 0.7},
  "28:28:5D": {name: "ASUSTek Computer", category: "networking", confidence: 0.7},

  // Computing/IoT Devices
  "00:1C:BF": {name: "Apple", category: "computing", confidence: 0.8},
  "28:CF:E9": {name: "Apple", category: "computing", confidence: 0.8},
  "40:A6:D9": {name: "Apple", category: "computing", confidence: 0.8},
  "98:01:A7": {name: "Apple", category: "computing", confidence: 0.8},
  "3C:15:C2": {name: "Apple", category: "computing", confidence: 0.8},
  "64:20:9F": {name: "Apple", category: "computing", confidence: 0.8},
  "00:16:32": {name: "Google", category: "iot", confidence: 0.75},
  "F4:F5:DB": {name: "Google", category: "iot", confidence: 0.75},
  "44:07:0B": {name: "Amazon Technologies", category: "iot", confidence: 0.75},
  "70:72:3C": {name: "Amazon Technologies", category: "iot", confidence: 0.75},
  "00:FC:8B": {name: "Samsung Electronics", category: "iot", confidence: 0.7},
  "E8:50:8B": {name: "Samsung Electronics", category: "iot", confidence: 0.7},

  // Smart Home & IoT
  "00:12:1B": {name: "Nest Labs", category: "camera", confidence: 0.85},
    "64:16:66": {name: "Nest Labs", category: "camera", confidence: 0.85},
};

// Manufacturer name normalization and aliases
export const MANUFACTURER_ALIASES: Record<string, string[]> = {
  "Raspberry Pi Foundation": ["Raspberry Pi", "Pi"],
  "Hikvision Digital Technology": ["Hikvision", "HKVision"],
  "Dahua Technology": ["Dahua", "DH-Technology"],
  "Amcrest Technologies": ["Amcrest", "AmcrestCam"],
  "Ubiquiti Networks": ["Ubiquiti", "Ubnt", "UI"],
  "ASUSTek Computer": ["ASUS", "AsusTek"],
  "Samsung Electronics": ["Samsung", "SamSung"],
  "Amazon Technologies": ["Amazon", "AMZN"],
  "Shanghai Imilab Technology Co.Ltd": ["Imilab", "Xiaomi Imilab", "Mi Home Camera"],
  "Xiaomi Communications": ["Xiaomi", "Mi", "Mi Home", "Xiaomi Camera"],
  "TP-Link Tapo": ["Tapo", "TP-Link Camera"],
  "EZVIZ": ["EZVIZ", "Hikvision EZVIZ"],
};

// Category confidence boosts
export const CATEGORY_CONFIDENCE_BOOST: Record<string, number> = {
  "camera": 0.3,
  "iot": 0.1,
  "networking": -0.2,
  "computing": -0.3,
  "unknown": 0.0,
};

// Camera-related keywords
export const CAMERA_KEYWORDS = [
  "camera", "cam", "ipcam", "ip-camera", "webcam", "cctv",
  "surveillance", "security", "dlink", "dcs-", "foscam",
  "hikvision", "axis", "reolink", "wyze", "arlo", "nest",
  "ring", "blink", "swann", "lorex", "amcrest", "tenvis"
];

// Common camera ports
export const CAMERA_PORTS = [554, 80, 8080, 443, 8000, 8554, 9080, 1935, 5000, 8001];

// Helper function for frequency band classification
function classifyFrequencyBand(freqMhz: number): '2.4GHz' | '5GHz' | '6GHz' | 'unknown' {
  if (freqMhz >= 2400 && freqMhz <= 2495) {
    return '2.4GHz';
  } else if (freqMhz >= 5000 && freqMhz <= 5895) {
    return '5GHz';
  } else if (freqMhz >= 5925 && freqMhz <= 7125) {
    return '6GHz';
  } else {
    return 'unknown';
  }
}

export class KismetService {
  private host: string;
  private apiKey: string;
  private macVendorCache: Map<string, string | null> = new Map();

  constructor(host: string, apiKey: string) {
    this.host = host.endsWith('/') ? host.slice(0, -1) : host;
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Use API proxy to avoid CORS issues
      const response = await fetch(`/api/kismet?endpoint=/system/status.json&apiKey=${this.apiKey}`);
      const data: KismetStatusResponse = await response.json();
      return response.ok && !data.error;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getDevices(sinceTimestamp?: number): Promise<Device[]> {
    try {
      let endpoint: string;
      if (sinceTimestamp) {
        endpoint = `/devices/last-time/${sinceTimestamp}/devices.json`;
      } else {
        endpoint = `/devices/views/all/devices.json`;
      }

      // Use API proxy to avoid CORS issues
      const response = await fetch(`/api/kismet?endpoint=${endpoint}&apiKey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: KismetDeviceResponse[] = await response.json();
      return data.map(deviceData => this.parseDevice(deviceData));
    } catch (error) {
      console.error('Failed to retrieve devices:', error);
      return [];
    }
  }

  // Data Source Interface Management Methods

  async getAvailableInterfaces(): Promise<DataSourceInterface[]> {
    try {
      const response = await fetch(`/api/kismet?endpoint=/datasource/list_interfaces.json&apiKey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform Kismet 2025.09.0 interface data to our format
      const interfaces: DataSourceInterface[] = [];

      if (Array.isArray(data)) {
        for (const iface of data) {
          const kismetInterface = iface as Record<string, unknown>;
          const driverInfo = kismetInterface['kismet.datasource.type_driver'] as Record<string, unknown>;

          interfaces.push({
            name: kismetInterface['kismet.datasource.probed.interface'] as string,
            driver: driverInfo['kismet.datasource.driver.type'] as string,
            hardware: kismetInterface['kismet.datasource.probed.hardware'] as string,
            version: kismetInterface['kismet.datasource.probed.datasource_version'] as string,
            type: driverInfo['kismet.datasource.driver.type'] as string,
            capabilities: this.getInterfaceCapabilities(driverInfo),
            description: driverInfo['kismet.datasource.driver.description'] as string,
            status: this.determineInterfaceStatus2025(kismetInterface),
            interface_type: this.determineInterfaceType2025(driverInfo['kismet.datasource.driver.type'] as string)
          });
        }
      }

      return interfaces;
    } catch (error) {
      console.warn('Failed to fetch interfaces from Kismet API:', error);
      throw error;
    }
  }

  async getActiveDataSources(): Promise<DataSourceConfig[]> {
    try {
      const response = await fetch(`/api/kismet?endpoint=/datasource/all_sources.json&apiKey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform Kismet source data to our format
      const sources: DataSourceConfig[] = [];

      if (data && data.datasources) {
        for (const source of data.datasources as Array<Record<string, unknown>>) {
          const kismetData = (source.kismet as Record<string, unknown>)?.datasource as Record<string, unknown>;
          const sourceData: DataSourceConfig = {
            uuid: (kismetData.uuid as string) || '',
            name: (kismetData.name as string) || '',
            interface: (kismetData.interface as string) || '',
            driver: (kismetData.driver as string) || '',
            hardware: (kismetData.hardware as string) || '',
            channel: kismetData.channel?.toString(),
            hop: (kismetData.hopping as boolean) || false,
            hop_rate: kismetData.hop_rate as number,
            channels: kismetData.channels as string[],
            active: (kismetData.running as boolean) || false,
            capture_options: (kismetData.source_options as Record<string, unknown>) || {}
          };
          sources.push(sourceData);
        }
      }

      return sources;
    } catch (error) {
      console.error('Error fetching active data sources:', error);
      return [];
    }
  }

  async addDataSource(request: AddSourceRequest): Promise<string> {
    try {
      const response = await fetch(`/api/kismet?endpoint=/datasource/add_source.cmd&apiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data['kismet.datasource.uuid'] || '';
    } catch (error) {
      console.error('Error adding data source:', error);
      throw error;
    }
  }

  async removeDataSource(uuid: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/kismet?endpoint=/datasource/remove_source&apiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing data source:', error);
      return false;
    }
  }

  async configureDataSource(request: ConfigureSourceRequest): Promise<boolean> {
    try {
      const { uuid, config } = request;

      // Build channel configuration based on the documentation
      const channelConfig: Record<string, unknown> = {};

      if (config.channel) {
        channelConfig.channel = config.channel;
      }

      if (config.hop !== undefined) {
        channelConfig.hop = config.hop ? 1 : 0;
      }

      if (config.hop_rate) {
        channelConfig.rate = config.hop_rate;
      }

      if (config.channels && config.channels.length > 0) {
        channelConfig.channels = config.channels;
      }

      const response = await fetch(`/api/kismet?endpoint=/datasource/by-uuid/${uuid}/set_channel.cmd&apiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelConfig),
      });

      return response.ok;
    } catch (error) {
      console.error('Error configuring data source:', error);
      return false;
    }
  }

  async selectInterface(interfaceName: string, _options?: {
    channel?: string;
    hop?: boolean;
    hopRate?: number;
  }): Promise<string> {
    // For Kismet 2025.09.0, we just pass the interface name as definition
    // Additional configuration can be done later with set_channel.cmd
    // Kismet API expects 'definition' field, not 'source'
    const requestData = {
      definition: interfaceName,
      name: `Monitoring on ${interfaceName}`
    };

    const response = await fetch(`/api/kismet?endpoint=/datasource/add_source.cmd&apiKey=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const uuid = data['kismet.datasource.uuid'] || '';

    // For now, skip immediate configuration since the datasource starts with working defaults
    // Configuration can be done later through the UI if needed
    // TODO: Add proper configuration after datasource is fully initialized

    return uuid;
  }

  private parseDevice(deviceData: KismetDeviceResponse): Device {
    const key = deviceData['kismet.device.base.key'] || '';
    const mac = deviceData['kismet.device.base.macaddr'] || '';
    const name = deviceData['kismet.device.base.commonname'] || deviceData['kismet.device.base.name'] || '';
    const type = deviceData['kismet.device.base.type'] || '';
    const kismetManufacturer = deviceData['kismet.device.base.manuf'] || '';

    // Enhanced manufacturer detection
    const manufacturer = this.detectManufacturer(mac, kismetManufacturer);

    // Get signal information
    const signalData = deviceData['kismet.device.base.signal'];
    const signal = signalData?.['kismet.common.signal.last_signal'];

    // Get channel information
    const channel = deviceData['kismet.device.base.channel'] || '';

    // Get last seen time
    const lastSeen = deviceData['kismet.device.base.last_time'] || '';

    // Get frequency and create enhanced frequency info
    const frequency = deviceData['kismet.device.base.frequency'];
    const frequencyInfo = this.createFrequencyInfo(frequency, channel);

    // Try to get IP addresses
    const ipAddresses: string[] = [];
    const ipData = deviceData['kismet.device.base.ip'];
    if (Array.isArray(ipData)) {
      ipData.forEach(ipEntry => {
        if (ipEntry.address) {
          ipAddresses.push(ipEntry.address);
        }
      });
    }

    return {
      key,
      mac,
      name,
      type,
      signal: signal || null,
      channel: channel || null,
      vendor: kismetManufacturer || null,
      manufacturer,
      frequencyInfo,
      ipAddresses,
      lastSeen: lastSeen || null,
      rawData: deviceData
    };
  }

  private convertToMhz(rawFreq: number): number | null {
    if (rawFreq < 1000) {        // Likely GHz
      return rawFreq * 1000;
    } else if (rawFreq < 1000000) {   // Likely MHz
      return rawFreq;
    } else if (rawFreq < 10000000) {  // Likely KHz
      return rawFreq / 1000;
    } else {                   // Likely Hz
      return rawFreq / 1000000;
    }
  }

  private createFrequencyInfo(rawFrequency: number | undefined, channelStr: string): FrequencyInfo | null {
    if (!rawFrequency) {
      return null;
    }

    try {
      const freqMhz = this.convertToMhz(rawFrequency);
      if (!freqMhz) {
        return null;
      }

      const freqGhz = freqMhz / 1000;
      const band = classifyFrequencyBand(freqMhz);
      const channel = channelStr || this.getChannelFromPreciseFrequency(freqMhz);
      const channelWidth = this.getChannelWidth(channel) || null;
      const isStandardWifi = this.isStandardWifiFrequency(freqMhz);

      // Analyze interference
      const interferenceInfo = this.analyzeInterference(freqMhz, channel);

      return {
        rawFrequency,
        frequencyGhz: freqGhz,
        frequencyMhz: freqMhz,
        channel: channel || null,
        channelWidth,
        band,
        isStandardWifi,
        interferenceInfo: interferenceInfo || undefined
      };
    } catch (error) {
      console.error('Error processing frequency:', error);
      return null;
    }
  }

  private getChannelFromPreciseFrequency(freqMhz: number): string | null {
    const freqToChannel: Record<number, string> = {
      // 2.4GHz channels
      2412: '1', 2417: '2', 2422: '3', 2427: '4', 2432: '5', 2437: '6',
      2442: '7', 2447: '8', 2452: '9', 2457: '10', 2462: '11', 2467: '12', 2472: '13', 2484: '14',
      // 5GHz channels (key ones)
      5180: '36', 5200: '40', 5220: '44', 5240: '48', 5260: '52', 5280: '56', 5300: '60', 5320: '64',
      5500: '100', 5520: '104', 5540: '108', 5560: '112', 5580: '116', 5600: '120', 5620: '124', 5640: '128', 5660: '132', 5680: '136', 5700: '140',
      5745: '149', 5765: '153', 5785: '157', 5805: '161', 5825: '165'
    };

    return freqToChannel[freqMhz] || null;
  }

  private analyzeInterference(freqMhz: number, channel: string | null): InterferenceInfo | null {
    if (!freqMhz) return null;

    const channelNumber = channel ? parseInt(channel) : null;
    if (!channelNumber) return null;

    let interferenceRisk = 0;
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let regulatoryCompliance: 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT' = 'COMPLIANT';
    let overlapsWith: number[] = [];
    const recommendations: string[] = [];
    let isExtendedChannel = false;
    let isDFSChannel = false;

    // Check for extended 2.4GHz channels (>13)
    if (channelNumber > 13 && freqMhz < 2500) {
      isExtendedChannel = true;
      interferenceRisk = 90;
      priority = 'HIGH';
      regulatoryCompliance = 'NON_COMPLIANT';
      recommendations.push('This channel is non-standard and likely illegal in most regions');
      recommendations.push('Consider moving to standard channels 1, 6, or 11');
      recommendations.push('This device may cause severe interference with standard WiFi networks');
    }

    // Check for problematic 2.4GHz channels
    if (channelNumber >= 12 && channelNumber <= 13) {
      interferenceRisk = Math.max(interferenceRisk, 60);
      if (priority !== 'HIGH') priority = 'MEDIUM';
      regulatoryCompliance = 'QUESTIONABLE';
      overlapsWith.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
      recommendations.push('Channels 12-13 have limited availability and may interfere with standard channels');
    }

    // Check for DFS channels in 5GHz
    const dfsChannels = [52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140];
    if (dfsChannels.includes(channelNumber)) {
      isDFSChannel = true;
      interferenceRisk = Math.max(interferenceRisk, 40);
      if (priority === 'LOW') priority = 'MEDIUM';
      recommendations.push('DFS channel - may require radar detection and can cause interference');
    }

    // Calculate channel overlaps for 2.4GHz
    if (freqMhz >= 2400 && freqMhz <= 2500) {
      const overlapMap: Record<number, number[]> = {
        1: [1, 2, 3, 4, 5, 6],
        2: [1, 2, 3, 4, 5, 6, 7],
        3: [1, 2, 3, 4, 5, 6, 7, 8],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        7: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        8: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        9: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        10: [5, 6, 7, 8, 9, 10, 11, 12, 13],
        11: [6, 7, 8, 9, 10, 11, 12, 13],
        12: [7, 8, 9, 10, 11, 12, 13],
        13: [8, 9, 10, 11, 12, 13],
      };

      if (overlapMap[channelNumber]) {
        overlapsWith = [...new Set([...overlapsWith, ...overlapMap[channelNumber]])];
        if (overlapsWith.length > 3 && !isExtendedChannel) {
          interferenceRisk = Math.max(interferenceRisk, 30);
          if (priority === 'LOW') priority = 'MEDIUM';
        }
      }
    }

    // Add specific recommendations for common problematic scenarios
    if (channelNumber === 14) {
      recommendations.push('Channel 14 is only legal in Japan and interferes with channels 1-13');
    }

    if (overlapsWith.length > 0) {
      recommendations.push(`This channel interferes with: ${overlapsWith.filter(c => c !== channelNumber).join(', ')}`);
    }

    return {
      channelNumber,
      isExtendedChannel,
      priority,
      interferenceRisk: Math.min(100, interferenceRisk),
      regulatoryCompliance,
      overlapsWith,
      recommendations,
      isDFSChannel
    };
  }

  private getChannelWidth(channel: string | null): string | null {
    if (!channel) {
      return null;
    }

    const channelLower = channel.toLowerCase();
    if (channelLower.includes('ht40') || channelLower.includes('40')) {
      return '40MHz';
    } else if (channelLower.includes('ht80') || channelLower.includes('80')) {
      return '80MHz';
    } else if (channelLower.includes('ht160') || channelLower.includes('160')) {
      return '160MHz';
    } else if (channelLower.includes('vht')) {
      return 'VHT';
    }
    return '20MHz';
  }

  private isStandardWifiFrequency(freqMhz: number): boolean {
    return this.getChannelFromPreciseFrequency(freqMhz) !== null;
  }

  private detectManufacturer(mac: string, kismetVendor: string): ManufacturerInfo | null {
    if (!mac) {
      return null;
    }

    const macUpper = mac.toUpperCase().replace('-', ':');

    // Method 1: Check our enhanced database
    if (macUpper.length >= 8) {
      const oui = macUpper.substring(0, 8);
      if (MANUFACTURER_DATABASE[oui]) {
        const dbInfo = MANUFACTURER_DATABASE[oui];
        return this.createManufacturerInfo(
          dbInfo.name,
          'hardcoded',
          dbInfo.confidence
        );
      }
    }

    // Method 2: Use Kismet vendor if available
    if (kismetVendor && kismetVendor.toLowerCase() !== 'unknown') {
      return this.createManufacturerInfo(kismetVendor, 'kismet', 0.6);
    }

    return null;
  }

  private createManufacturerInfo(
    name: string,
    source: 'mac_api' | 'hardcoded' | 'inferred' | 'kismet',
    confidence: number = 0.5,
    rawName?: string
  ): ManufacturerInfo {
    const normalizedName = this.normalizeManufacturerName(name);
    const category = this.determineManufacturerCategory(normalizedName);
    const isKnownCamera = category === 'camera' || this.isCameraBrand(normalizedName);
    const aliases = MANUFACTURER_ALIASES[normalizedName] || [];

    return {
      name: normalizedName,
      confidence,
      source,
      category,
      isKnownCamera,
      aliases,
      rawName: rawName || name
    };
  }

  private normalizeManufacturerName(name: string): string {
    if (!name) {
      return 'Unknown';
    }

    const nameLower = name.toLowerCase();

    // Check for exact matches first
    for (const [standardName, aliases] of Object.entries(MANUFACTURER_ALIASES)) {
      if (nameLower === standardName.toLowerCase() ||
          aliases.some(alias => alias.toLowerCase() === nameLower)) {
        return standardName;
      }
    }

    // Check partial matches for variations
    for (const [standardName, aliases] of Object.entries(MANUFACTURER_ALIASES)) {
      if (aliases.some(alias => alias.toLowerCase().includes(nameLower) ||
                               nameLower.includes(alias.toLowerCase()))) {
        return standardName;
      }
    }

    return name.trim();
  }

  private determineManufacturerCategory(normalizedName: string): 'camera' | 'networking' | 'computing' | 'iot' | 'unknown' {
    // Check our database first
    for (const dbInfo of Object.values(MANUFACTURER_DATABASE)) {
      if (dbInfo.name === normalizedName) {
        return dbInfo.category;
      }
    }

    // Infer category from name patterns
    const nameLower = normalizedName.toLowerCase();

    const cameraTerms = ['axis', 'hikvision', 'dahua', 'foscam', 'reolink', 'amcrest', 'swann', 'lorex'];
    if (cameraTerms.some(term => nameLower.includes(term))) {
      return 'camera';
    }

    const networkTerms = ['cisco', 'juniper', 'aruba', 'ruckus', 'fortinet', 'ubiquiti', 'tp-link', 'netgear', 'linksys'];
    if (networkTerms.some(term => nameLower.includes(term))) {
      return 'networking';
    }

    const computingTerms = ['apple', 'microsoft', 'intel', 'amd', 'dell', 'hp'];
    if (computingTerms.some(term => nameLower.includes(term))) {
      return 'computing';
    }

    const iotTerms = ['google', 'amazon', 'samsung', 'xiaomi', 'wyze', 'arlo', 'ring', 'nest'];
    if (iotTerms.some(term => nameLower.includes(term))) {
      return 'iot';
    }

    return 'unknown';
  }

  private isCameraBrand(normalizedName: string): boolean {
    const cameraBrands = [
      'axis communications', 'canon', 'sony', 'panasonic', 'hikvision digital technology',
      'dahua technology', 'amcrest technologies', 'foscam', 'reolink', 'swann communications',
      'lorex technology', 'wyze labs', 'ring', 'arlo technologies', 'nest labs'
    ];
    return cameraBrands.some(brand => brand.toLowerCase() === normalizedName.toLowerCase());
  }

  identifyCameraDevices(devices: Device[]): CameraCandidate[] {
    const candidates: CameraCandidate[] = [];

    for (const device of devices) {
      const { confidence, reasons } = this.assessCameraLikelihood(device);

      if (confidence >= 0.3) {
        const candidate: CameraCandidate = {
          device,
          confidence: Math.min(confidence, 1.0),
          reasons,
          openPorts: [] // Port scanning would be implemented separately
        };
        candidates.push(candidate);
      }
    }

    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  private assessCameraLikelihood(device: Device): { confidence: number; reasons: string[] } {
    let confidence = 0;
    const reasons: string[] = [];

    // Extract packet data
    const packetData = this.extractPacketData(device.rawData);
    const { totalPackets, txPackets, dataPackets } = packetData;
    const txRatio = totalPackets > 0 ? txPackets / totalPackets : 0;
    const dataRatio = totalPackets > 0 ? dataPackets / totalPackets : 0;

    // Enhanced manufacturer evaluation
    if (device.manufacturer) {
      const manufacturerConfidence = this.evaluateVendorForCamera(device.manufacturer);
      confidence += manufacturerConfidence;

      if (manufacturerConfidence > 0.1) {
        reasons.push(`Camera manufacturer: ${device.manufacturer.name} (${device.manufacturer.category})`);
      } else if (manufacturerConfidence < -0.1) {
        reasons.push(`Non-camera manufacturer: ${device.manufacturer.name} (${device.manufacturer.category})`);
      }
    } else {
      reasons.push('No manufacturer information available');
    }

    // Enhanced frequency analysis
    if (device.frequencyInfo) {
      const frequencyConfidence = this.getCameraFrequencyConfidence(device.frequencyInfo);
      confidence += frequencyConfidence;

      if (frequencyConfidence > 0.05) {
        reasons.push(`Camera frequency: ${device.frequencyInfo.frequencyGhz?.toFixed(3)} GHz (Channel ${device.frequencyInfo.channel})`);
      }
    } else {
      reasons.push('No frequency information available');
    }

    // Check device name for camera keywords
    const nameMatch = this.checkDeviceName(device.name);
    if (nameMatch) {
      confidence += 0.3;
      reasons.push(`Device name contains: ${nameMatch}`);
    }

    // Enhanced device type analysis
    const deviceTypeLower = device.type.toLowerCase();
    if (deviceTypeLower === 'wi-fi ap') {
      confidence -= 0.5;
      reasons.push('Access Point (unlikely to be camera)');
    } else if (deviceTypeLower === 'wi-fi client' || deviceTypeLower === 'wi-fi bridged') {
      confidence += 0.1;
      reasons.push('Wireless client (could be camera)');
    }

    // Enhanced packet count analysis
    if (totalPackets < 200) {
      confidence += 0.2;
      reasons.push('Low packet count (typical of cameras)');
    } else if (totalPackets >= 200 && totalPackets <= 1000) {
      confidence += 0.3;
      reasons.push('Moderate packet count (camera sweet spot)');
    } else if (totalPackets > 5000) {
      confidence -= 0.3;
      reasons.push('High packet count (typical of APs)');
    }

    // Enhanced traffic pattern analysis
    if (totalPackets > 1000 && txRatio > 0.9 && dataRatio < 0.05) {
      confidence -= 0.4;
      reasons.push('AP beacon traffic pattern (high TX, low data)');
    } else if (dataRatio > 0.9) {
      confidence += 0.3;
      reasons.push('Very high data ratio (strong video streaming indicator)');
    } else if (dataRatio > 0.7) {
      confidence += 0.25;
      reasons.push('High data ratio (likely video streaming)');
    } else if (dataRatio > 0.5) {
      confidence += 0.2;
      reasons.push('Moderate-high data ratio (possible video streaming)');
    } else if (dataRatio > 0.3) {
      confidence += 0.15;
      reasons.push('High data ratio (possible video streaming)');
    }

    // Enhanced manufacturer check
    if (device.vendor) {
      const vendorLower = device.vendor.toLowerCase();
      const cameraBrands = [
        'axis', 'canon', 'sony', 'panasonic', 'foscam', 'hikvision', 'dahua',
        'd-link', 'tp-link', 'netgear', 'linksys', 'asus', 'tenda', 'amcrest', 'reolink',
        'imilab', 'ezviz', 'zosi', 'hiseeu', 'tapo', 'xiaomi mi home', 'lorex', 'swann'
      ];

      for (const brand of cameraBrands) {
        if (vendorLower.includes(brand)) {
          confidence += 0.3;
          reasons.push(`Camera manufacturer: ${device.vendor}`);
          break;
        }
      }

      // Enhanced IoT/Smart home brands with camera focus
      const iotBrands = [
        'xiaomi', 'mi', 'wyze', 'arlo', 'blink', 'ring', 'nest', 'google', 'amazon',
        'shanghai imilab', 'ezviz', 'tp-link tapo', 'mi home'
      ];
      for (const brand of iotBrands) {
        if (vendorLower.includes(brand)) {
          confidence += 0.25;
          reasons.push(`IoT/Smart camera manufacturer: ${device.vendor}`);
          break;
        }
      }

      // Special pattern detection for Chinese camera manufacturers
      if (vendorLower.includes('co.ltd') || vendorLower.includes('technology') ||
          vendorLower.includes('shenzhen') || vendorLower.includes('shanghai')) {
        // Check if it's likely a camera manufacturer based on other indicators
        if (dataRatio > 0.5 && totalPackets < 2000) {
          confidence += 0.2;
          reasons.push(`Chinese manufacturer with camera characteristics: ${device.vendor}`);
        }
      }
    }

    confidence = Math.max(0.0, Math.min(1.0, confidence));
    return { confidence, reasons };
  }

  private extractPacketData(rawDeviceData: KismetDeviceResponse): PacketData {
    return {
      totalPackets: rawDeviceData['kismet.device.base.packets.total'] || 0,
      rxPackets: rawDeviceData['kismet.device.base.packets.rx_total'] || 0,
      txPackets: rawDeviceData['kismet.device.base.packets.tx_total'] || 0,
      dataPackets: rawDeviceData['kismet.device.base.packets.data'] || 0,
      llcPackets: rawDeviceData['kismet.device.base.packets.llc'] || 0
    };
  }

  private evaluateVendorForCamera(manufacturer: ManufacturerInfo): number {
    let baseConfidence = CATEGORY_CONFIDENCE_BOOST[manufacturer.category] || 0.0;

    if (manufacturer.isKnownCamera) {
      baseConfidence += 0.2;
    }

    const sourceBoost: Record<string, number> = {
      'hardcoded': 0.1,
      'mac_api': 0.05,
      'kismet': 0.0,
      'inferred': -0.05
    };

    return baseConfidence + (sourceBoost[manufacturer.source] || 0.0);
  }

  private getCameraFrequencyConfidence(freqInfo: FrequencyInfo): number {
    if (!freqInfo.frequencyMhz) {
      return 0.0;
    }

    const freqMhz = freqInfo.frequencyMhz;

    // High-confidence camera channels
    if (freqMhz === 2437) { // Channel 6 - most common for cameras
      return 0.15;
    } else if (freqMhz === 5180) { // Channel 36 - common for 5GHz cameras
      return 0.15;
    } else if (freqMhz === 5745) { // Channel 149 - common for 5GHz cameras
      return 0.10;
    } else if (freqMhz === 2452) { // Channel 9 - increasingly common for IoT cameras
      return 0.10;
    } else if (freqMhz === 2412 || freqMhz === 2462) { // Channels 1 and 11
      return 0.08;
    } else if (freqMhz === 2432 || freqMhz === 2447) { // Channels 5 and 8
      return 0.08;
    } else if (freqMhz === 5220 || freqMhz === 5825) { // Other common 5GHz camera channels
      return 0.08;
    } else if (freqInfo.band === '2.4GHz') {
      return 0.08; // Increased from 0.05 - 2.4GHz is camera-friendly
    } else if (freqInfo.band === '5GHz') {
      return 0.05; // Increased from 0.03
    }

    return 0.0;
  }

  private checkDeviceName(name: string): string | null {
    if (!name) {
      return null;
    }

    const nameLower = name.toLowerCase();
    for (const keyword of CAMERA_KEYWORDS) {
      if (nameLower.includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  // Filter methods
  filterByManufacturer(candidates: CameraCandidate[], manufacturerFilter: string): CameraCandidate[] {
    const filterLower = manufacturerFilter.toLowerCase();
    return candidates.filter(candidate => {
      if (!candidate.device.manufacturer) return false;
      const mfrName = candidate.device.manufacturer.name.toLowerCase();
      const aliases = candidate.device.manufacturer.aliases.map(a => a.toLowerCase());
      return mfrName.includes(filterLower) || aliases.some(alias => alias.includes(filterLower));
    });
  }

  filterByCategory(candidates: CameraCandidate[], categoryFilter: string): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.manufacturer?.category === categoryFilter
    );
  }

  filterByExactFrequency(candidates: CameraCandidate[], exactFreqGhz: number, tolerance: number = 0.001): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.frequencyGhz &&
      Math.abs(candidate.device.frequencyInfo.frequencyGhz - exactFreqGhz) <= tolerance
    );
  }

  filterByFrequencyRange(candidates: CameraCandidate[], rangeStr: string): CameraCandidate[] {
    try {
      if (!rangeStr.includes('-')) return [];

      const [startStr, endStr] = rangeStr.split('-', 2);
      const startFreq = parseFloat(startStr.trim());
      const endFreq = parseFloat(endStr.trim());

      return candidates.filter(candidate => {
        const freq = candidate.device.frequencyInfo?.frequencyGhz;
        return freq && startFreq <= freq && freq <= endFreq;
      });
    } catch {
      return [];
    }
  }

  filterByFrequencyBand(candidates: CameraCandidate[], bandFilter: string): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.band === bandFilter
    );
  }

  filterByChannel(candidates: CameraCandidate[], channelFilter: string): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.channel === channelFilter
    );
  }

  filterByConfidence(candidates: CameraCandidate[], minConfidence: number): CameraCandidate[] {
    return candidates.filter(candidate => candidate.confidence >= minConfidence);
  }

  // Interference filtering methods
  filterByInterferencePriority(candidates: CameraCandidate[], priorityFilter: 'HIGH' | 'MEDIUM' | 'LOW'): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.interferenceInfo?.priority === priorityFilter
    );
  }

  filterByRegulatoryCompliance(candidates: CameraCandidate[], complianceFilter: 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT'): CameraCandidate[] {
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.interferenceInfo?.regulatoryCompliance === complianceFilter
    );
  }

  filterByExtendedChannels(candidates: CameraCandidate[], extendedOnly: boolean): CameraCandidate[] {
    if (extendedOnly) {
      return candidates.filter(candidate =>
        candidate.device.frequencyInfo?.interferenceInfo?.isExtendedChannel === true
      );
    }
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.interferenceInfo?.isExtendedChannel !== true
    );
  }

  filterByDFSChannels(candidates: CameraCandidate[], showDFS: boolean): CameraCandidate[] {
    if (showDFS) {
      return candidates.filter(candidate =>
        candidate.device.frequencyInfo?.interferenceInfo?.isDFSChannel === true
      );
    }
    return candidates.filter(candidate =>
      candidate.device.frequencyInfo?.interferenceInfo?.isDFSChannel !== true
    );
  }

  filterByInterferenceRisk(candidates: CameraCandidate[], minRisk: number, maxRisk: number = 100): CameraCandidate[] {
    return candidates.filter(candidate => {
      const risk = candidate.device.frequencyInfo?.interferenceInfo?.interferenceRisk || 0;
      return risk >= minRisk && risk <= maxRisk;
    });
  }

  // Grouping methods
  groupByManufacturer(candidates: CameraCandidate[]): Record<string, CameraCandidate[]> {
    const groups: Record<string, CameraCandidate[]> = {};

    for (const candidate of candidates) {
      const mfrName = candidate.device.manufacturer?.name || 'Unknown';
      if (!groups[mfrName]) {
        groups[mfrName] = [];
      }
      groups[mfrName].push(candidate);
    }

    return groups;
  }

  groupByFrequency(candidates: CameraCandidate[]): Record<string, CameraCandidate[]> {
    const groups: Record<string, CameraCandidate[]> = {};

    for (const candidate of candidates) {
      const freqDisplay = candidate.device.frequencyInfo?.frequencyGhz?.toFixed(3) + ' GHz';
      if (freqDisplay) {
        if (!groups[freqDisplay]) {
          groups[freqDisplay] = [];
        }
        groups[freqDisplay].push(candidate);
      }
    }

    return groups;
  }

  groupByInterference(candidates: CameraCandidate[]): Record<string, CameraCandidate[]> {
    const groups: Record<string, CameraCandidate[]> = {
      'HIGH': [],
      'MEDIUM': [],
      'LOW': []
    };

    for (const candidate of candidates) {
      const priority = candidate.device.frequencyInfo?.interferenceInfo?.priority;
      if (priority && groups[priority]) {
        groups[priority].push(candidate);
      } else {
        groups['LOW'].push(candidate);
      }
    }

    return groups;
  }

  // Export methods
  exportToJSON(candidates: CameraCandidate[], includeRawData: boolean = false): string {
    const data = candidates.map(candidate => {
      const exportData: {
        device: {
          key: string;
          mac: string;
          name: string;
          type: string;
          signal: number | null;
          channel: string | null;
          vendor: string | null;
          ipAddresses: string[];
          lastSeen: string | null;
        };
        confidence: number;
        reasons: string[];
        openPorts: number[];
        manufacturer?: ManufacturerInfo;
        frequencyInfo?: FrequencyInfo;
        rawData?: Record<string, unknown>;
      } = {
        device: {
          key: candidate.device.key,
          mac: candidate.device.mac,
          name: candidate.device.name,
          type: candidate.device.type,
          signal: candidate.device.signal || null,
          channel: candidate.device.channel || null,
          vendor: candidate.device.vendor || null,
          ipAddresses: candidate.device.ipAddresses,
          lastSeen: candidate.device.lastSeen || null,
          manufacturer: candidate.device.manufacturer || null,
          frequencyInfo: candidate.device.frequencyInfo || null,
          rawData: includeRawData ? candidate.device.rawData : undefined
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        confidence: candidate.confidence,
        reasons: candidate.reasons,
        openPorts: candidate.openPorts
      };

      return exportData;
    });

    return JSON.stringify(data, null, 2);
  }

  exportToCSV(candidates: CameraCandidate[]): string {
    const headers = [
      'Name', 'MAC Address', 'Type', 'Confidence', 'Manufacturer', 'Category',
      'Frequency (GHz)', 'Channel', 'Band', 'Signal (dBm)', 'IP Addresses', 'Reasons'
    ];

    const rows = candidates.map(candidate => {
      const device = candidate.device;
      return [
        device.name || 'Unknown',
        device.mac,
        device.type,
        (candidate.confidence * 100).toFixed(1) + '%',
        device.manufacturer?.name || 'Unknown',
        device.manufacturer?.category || 'unknown',
        device.frequencyInfo?.frequencyGhz?.toFixed(3) || 'Unknown',
        device.frequencyInfo?.channel || 'Unknown',
        device.frequencyInfo?.band || 'Unknown',
        device.signal?.toString() || 'Unknown',
        device.ipAddresses.join('; ') || 'None',
        candidate.reasons.join('; ')
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private determineInterfaceStatus(info: Record<string, unknown>): 'available' | 'in-use' | 'error' | 'incompatible' {
    // Determine interface status based on Kismet data
    if (info.in_use) {
      return 'in-use';
    }
    if (info.error) {
      return 'error';
    }
    if (info.capable === false) {
      return 'incompatible';
    }
    return 'available';
  }

  private determineInterfaceType(driver: string): 'linuxwifi' | 'linuxbluetooth' | 'other' {
    if (driver.includes('wifi') || driver.includes('mac80211')) {
      return 'linuxwifi';
    }
    if (driver.includes('bluetooth') || driver.includes('hci')) {
      return 'linuxbluetooth';
    }
    return 'other';
  }

  private getInterfaceCapabilities(driverInfo: Record<string, unknown>): string[] {
    const capabilities: string[] = [];

    if (driverInfo['kismet.datasource.driver.hop_capable'] === 1) {
      capabilities.push('channel_hop');
    }
    if (driverInfo['kismet.datasource.driver.tuning_capable'] === 1) {
      capabilities.push('tuning');
    }
    if (driverInfo['kismet.datasource.driver.probe_capable'] === 1) {
      capabilities.push('probe');
    }
    if (driverInfo['kismet.datasource.driver.list_capable'] === 1) {
      capabilities.push('list_interfaces');
    }

    const driverType = driverInfo['kismet.datasource.driver.type'] as string;
    if (driverType === 'linuxwifi') {
      capabilities.push('wifi', 'monitor');
    } else if (driverType === 'linuxbluetooth') {
      capabilities.push('bluetooth', 'ble');
    }

    return capabilities;
  }

  private determineInterfaceStatus2025(kismetInterface: Record<string, unknown>): 'available' | 'in-use' | 'error' | 'incompatible' {
    const inUseUuid = kismetInterface['kismet.datasource.probed.in_use_uuid'] as string;

    if (inUseUuid && inUseUuid !== '00000000-0000-0000-0000-000000000000') {
      return 'in-use';
    }

    return 'available';
  }

  private determineInterfaceType2025(driverType: string): 'linuxwifi' | 'linuxbluetooth' | 'other' {
    if (driverType === 'linuxwifi') {
      return 'linuxwifi';
    }
    if (driverType === 'linuxbluetooth') {
      return 'linuxbluetooth';
    }
    return 'other';
  }

  private getMockInterfaces(): DataSourceInterface[] {
    // Mock interfaces based on typical Linux system interfaces
    // These match what you'd see in Kismet UI: hci0 (bluetooth), wlan0/wlan1 (wifi)
    return [
      {
        name: 'hci0',
        driver: 'linuxbluetooth',
        hardware: 'Bluetooth Controller',
        version: '2025.09.0-b5d5a2d04',
        type: 'bluetooth',
        capabilities: ['bluetooth', 'ble', 'bt_scan'],
        description: 'Bluetooth interface for device discovery',
        status: 'available',
        interface_type: 'linuxbluetooth'
      },
      {
        name: 'wlan0',
        driver: 'nl80211',
        hardware: 'Wireless LAN Controller',
        version: '2025.09.0-b5d5a2d04',
        type: 'wifi',
        capabilities: ['wifi', 'monitor', 'injection'],
        description: 'Primary WiFi interface for network monitoring',
        status: 'available',
        interface_type: 'linuxwifi'
      },
      {
        name: 'wlan1',
        driver: 'rtw_8821cu',
        hardware: 'Realtek RTL8821CU',
        version: '2025.09.0-b5d5a2d04',
        type: 'wifi',
        capabilities: ['wifi', 'monitor', '5ghz', '2ghz'],
        description: 'Secondary WiFi interface with dual-band support',
        status: 'available',
        interface_type: 'linuxwifi'
      }
    ];
  }
}

// Re-export types for convenience
export type { KismetConfig };