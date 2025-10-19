// Kismet API and Camera Detector Types

export interface FrequencyInfo {
  rawFrequency?: number | null;
  frequencyGhz?: number | null;
  frequencyMhz?: number | null;
  channel?: string | null;
  channelWidth?: string | null;
  band: '2.4GHz' | '5GHz' | '6GHz' | 'unknown';
  isStandardWifi: boolean;
  interferenceInfo?: InterferenceInfo;
}

export interface InterferenceInfo {
  channelNumber: number | null;
  isExtendedChannel: boolean; // Channel > 13
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  interferenceRisk: number; // 0-100
  regulatoryCompliance: 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT';
  overlapsWith: number[]; // Channels this interferes with
  recommendations: string[];
  isDFSChannel: boolean; // Dynamic Frequency Selection
}

export interface ManufacturerInfo {
  name: string;
  confidence: number;
  source: 'mac_api' | 'hardcoded' | 'inferred' | 'kismet';
  category: 'camera' | 'networking' | 'computing' | 'iot' | 'unknown';
  isKnownCamera: boolean;
  aliases: string[];
  rawName?: string | null;
}

export interface Device {
  key: string;
  mac: string;
  name: string;
  type: string;
  signal?: number | null;
  channel?: string | null;
  vendor?: string | null;
  manufacturer?: ManufacturerInfo | null;
  frequencyInfo?: FrequencyInfo | null;
  ipAddresses: string[];
  lastSeen?: string | null;
  rawData: Record<string, unknown>;
}

export interface PacketData {
  totalPackets: number;
  rxPackets: number;
  txPackets: number;
  dataPackets: number;
  llcPackets: number;
}

export interface CameraCandidate {
  device: Device;
  confidence: number;
  reasons: string[];
  openPorts: number[];
}

export interface KismetDeviceResponse {
  [key: string]: unknown;
  'kismet.device.base.key'?: string;
  'kismet.device.base.macaddr'?: string;
  'kismet.device.base.commonname'?: string;
  'kismet.device.base.name'?: string;
  'kismet.device.base.type'?: string;
  'kismet.device.base.manuf'?: string;
  'kismet.device.base.signal'?: {
    'kismet.common.signal.last_signal'?: number;
  };
  'kismet.device.base.channel'?: string;
  'kismet.device.base.last_time'?: string;
  'kismet.device.base.frequency'?: number;
  'kismet.device.base.ip'?: Array<{
    address: string;
  }>;
  'kismet.device.base.basic_type_set'?: string[];
  'kismet.device.base.packets.total'?: number;
  'kismet.device.base.packets.rx_total'?: number;
  'kismet.device.base.packets.tx_total'?: number;
  'kismet.device.base.packets.data'?: number;
  'kismet.device.base.packets.llc'?: number;
}

export interface KismetStatusResponse {
  kismet_system_version: string;
  kismet_system_time: {
    sec: number;
    usec: number;
  };
  kismet_system_uuid: string;
  kismet_system_hostname: string;
  error?: string;
}

export interface FilterOptions {
  manufacturerFilter?: string;
  categoryFilter?: 'camera' | 'networking' | 'computing' | 'iot';
  exactFrequency?: number;
  frequencyRange?: string;
  frequencyBand?: '2.4GHz' | '5GHz' | '6GHz';
  channelFilter?: string;
  minConfidence?: number;
  interferencePriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  regulatoryCompliance?: 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT';
  extendedChannelsOnly?: boolean; // Only show channels > 13
  showDFSChannels?: boolean;
}

export interface ViewMode {
  type: 'default' | 'group-by-manufacturer' | 'group-by-frequency' | 'interference-analysis';
  label: string;
}

export interface SortOption {
  field: 'confidence' | 'name' | 'signal' | 'frequency' | 'manufacturer';
  direction: 'asc' | 'desc';
  label: string;
}

export interface ExportOptions {
  format: 'json' | 'csv';
  includeRawData?: boolean;
  includeReasons?: boolean;
}

export interface ManufacturerSummary {
  name: string;
  count: number;
  category: string;
  avgConfidence: number;
}

export interface FrequencySummary {
  frequency: string;
  count: number;
  band: string;
  channel?: string;
}

export interface KismetConfig {
  host: string;
  apiKey: string;
  useMacApi: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface ManufacturerDatabaseEntry {
  name: string;
  category: 'camera' | 'networking' | 'computing' | 'iot' | 'unknown';
  confidence: number;
  aliases?: string[];
  source?: 'hardcoded' | 'mac_api' | 'kismet';
}

// Data Source Interface Types
export interface DataSourceInterface {
  name: string;
  driver: string;
  hardware: string;
  version: string;
  type: string;
  capabilities: string[];
  description?: string;
  status: 'available' | 'in-use' | 'error' | 'incompatible';
  interface_type: 'linuxwifi' | 'linuxbluetooth' | 'other';
}

export interface DataSourceConfig {
  uuid: string;
  name: string;
  interface: string;
  driver: string;
  hardware?: string;
  channel?: string;
  hop?: boolean;
  hop_rate?: number;
  channels?: string[];
  active: boolean;
  capture_options?: Record<string, unknown>;
}

export interface DataSourceListResponse {
  kismet_version: string;
  timestamp: number;
  interfaces: DataSourceInterface[];
  sources: DataSourceConfig[];
}

export interface AddSourceRequest {
  source: string;
  name?: string;
  options?: Record<string, unknown>;
}

export interface ConfigureSourceRequest {
  uuid: string;
  config: Partial<DataSourceConfig>;
}