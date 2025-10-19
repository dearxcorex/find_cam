'use client';

import { useState } from 'react';
import { DataSourceInterface, DataSourceConfig } from '@/types/kismet';

interface InterfaceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  interface: DataSourceInterface | null;
  currentConfig?: DataSourceConfig | null;
  onSave: (config: {
    channel?: string;
    hop: boolean;
    hopRate?: number;
    name?: string;
  }) => Promise<void>;
}

export function InterfaceConfigModal({
  isOpen,
  onClose,
  interface: iface,
  currentConfig,
  onSave
}: InterfaceConfigModalProps) {
  const [config, setConfig] = useState({
    name: currentConfig?.name || `Monitoring on ${iface?.name}`,
    channel: currentConfig?.channel || '',
    hop: currentConfig?.hop ?? true,
    hopRate: currentConfig?.hop_rate || 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !iface) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await onSave({
        name: config.name,
        channel: config.channel || undefined,
        hop: config.hop,
        hopRate: config.hop ? config.hopRate : undefined
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const getWifiChannels = () => {
    // Common WiFi channels
    const channels2_4GHz = Array.from({ length: 13 }, (_, i) => (i + 1).toString());
    const channels5GHz = [
      '36', '40', '44', '48', '52', '56', '60', '64',
      '100', '104', '108', '112', '116', '120', '124', '128', '132', '136', '140',
      '149', '153', '157', '161', '165'
    ];

    if (iface.interface_type === 'linuxwifi') {
      return [...channels2_4GHz, ...channels5GHz];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black /50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configure Interface
            </h2>
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
        <div className="p-6 space-y-6">
          {/* Interface Info */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {iface.interface_type === 'linuxwifi' ? '📡' :
                 iface.interface_type === 'linuxbluetooth' ? '🔵' : '🔌'}
              </span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {iface.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {iface.driver} • {iface.hardware}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter a descriptive name"
              />
            </div>

            {/* Channel Selection (WiFi only) */}
            {iface.interface_type === 'linuxwifi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Channel
                </label>
                <select
                  value={config.channel}
                  onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Auto (Channel Hopping)</option>
                  {getWifiChannels().map(channel => (
                    <option key={channel} value={channel}>
                      Channel {channel}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for automatic channel hopping
                </p>
              </div>
            )}

            {/* Channel Hopping */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.hop}
                  onChange={(e) => setConfig({ ...config, hop: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Channel Hopping
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Automatically switch between channels to monitor more traffic
              </p>
            </div>

            {/* Hop Rate */}
            {config.hop && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hop Rate (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.hopRate}
                  onChange={(e) => setConfig({ ...config, hopRate: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  How many seconds to stay on each channel
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}