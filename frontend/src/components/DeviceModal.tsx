'use client';

import { CameraCandidate } from '@/types/kismet';
import { formatDistanceToNow } from 'date-fns';

interface DeviceModalProps {
  device: CameraCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceModal({ device, isOpen, onClose }: DeviceModalProps) {
  if (!isOpen) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (confidence >= 0.4) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'camera': return '📹';
      case 'networking': return '🌐';
      case 'computing': return '💻';
      case 'iot': return '🏠';
      default: return '❓';
    }
  };

  const getSignalStrengthColor = (signal: number | null) => {
    if (!signal) return 'text-gray-400';
    if (signal >= -50) return 'text-green-600';
    if (signal >= -60) return 'text-yellow-600';
    if (signal >= -70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid timestamp';
    }
  };

  const extractPacketData = () => {
    const rawData = device.device.rawData;
    return {
      totalPackets: rawData['kismet.device.base.packets.total'] || 0,
      rxPackets: rawData['kismet.device.base.packets.rx_total'] || 0,
      txPackets: rawData['kismet.device.base.packets.tx_total'] || 0,
      dataPackets: rawData['kismet.device.base.packets.data'] || 0,
      llcPackets: rawData['kismet.device.base.packets.llc'] || 0
    };
  };

  const packetData = extractPacketData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {device.device.name || 'Unknown Device'}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(device.confidence)}`}>
                {Math.round(device.confidence * 100)}% Camera Confidence
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Device Identification */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Identification</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">MAC Address:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{device.device.mac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Device Type:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.device.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Device Key:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{device.device.key}</span>
                  </div>
                  {device.device.lastSeen && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Seen:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatTimestamp(device.device.lastSeen)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Manufacturer Information */}
              {device.device.manufacturer && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Manufacturer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(device.device.manufacturer.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.device.manufacturer.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Category: {device.device.manufacturer.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Source:</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {device.device.manufacturer.source}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Known Camera:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.device.manufacturer.isKnownCamera ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {device.device.manufacturer.aliases.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Also known as:</span>
                        <div className="mt-1">
                          {device.device.manufacturer.aliases.map((alias, index) => (
                            <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 text-xs text-gray-800 dark:text-gray-200 px-2 py-1 rounded mr-2 mb-1">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Network Information */}
              {(device.device.ipAddresses.length > 0 || device.device.channel || device.device.signal) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network Information</h3>
                  <div className="space-y-3">
                    {device.device.ipAddresses.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">IP Addresses:</span>
                        <div className="mt-1">
                          {device.device.ipAddresses.map((ip, index) => (
                            <div key={index} className="text-sm font-mono text-gray-900 dark:text-white">
                              {ip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {device.device.channel && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Channel:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{device.device.channel}</span>
                      </div>
                    )}
                    {device.device.signal && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Signal Strength:</span>
                        <span className={`text-sm font-medium ${getSignalStrengthColor(device.device.signal)}`}>
                          {device.device.signal} dBm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Frequency and Analysis */}
            <div className="space-y-6">
              {/* Frequency Information */}
              {device.device.frequencyInfo && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Frequency Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frequency:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.device.frequencyInfo.frequencyGhz?.toFixed(3)} GHz
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Band:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.device.frequencyInfo.band}
                      </span>
                    </div>
                    {device.device.frequencyInfo.channel && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Channel:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {device.device.frequencyInfo.channel}
                        </span>
                      </div>
                    )}
                    {device.device.frequencyInfo.channelWidth && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Channel Width:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {device.device.frequencyInfo.channelWidth}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Standard WiFi:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.device.frequencyInfo.isStandardWifi ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Packet Analysis */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Packet Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Packets:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{packetData.totalPackets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">RX Packets:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{packetData.rxPackets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TX Packets:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{packetData.txPackets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data Packets:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{packetData.dataPackets.toLocaleString()}</span>
                  </div>
                  {packetData.totalPackets > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">TX Ratio:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {((packetData.txPackets / packetData.totalPackets) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Data Ratio:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {((packetData.dataPackets / packetData.totalPackets) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detection Reasons */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detection Reasons</h3>
                <div className="space-y-2">
                  {device.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Ports */}
              {device.openPorts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Open Camera Ports</h3>
                  <div className="flex flex-wrap gap-2">
                    {device.openPorts.map((port, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}