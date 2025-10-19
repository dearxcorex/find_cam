'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataSourceInterface, DataSourceConfig } from '@/types/kismet';

interface KismetService {
  getAvailableInterfaces(): Promise<DataSourceInterface[]>;
  getActiveDataSources(): Promise<DataSourceConfig[]>;
  selectInterface(interfaceName: string, options?: {
    channel?: string;
    hop?: boolean;
    hopRate?: number;
  }): Promise<string>;
  removeDataSource(uuid: string): Promise<boolean>;
}

interface InterfaceSelectorProps {
  kismetService: KismetService;
  onInterfaceSelected?: (interfaceName: string, uuid: string) => void;
  selectedInterface?: string;
  disabled?: boolean;
}

export function InterfaceSelector({
  kismetService,
  onInterfaceSelected,
  selectedInterface,
  disabled = false
}: InterfaceSelectorProps) {
  const [interfaces, setInterfaces] = useState<DataSourceInterface[]>([]);
  const [activeSources, setActiveSources] = useState<DataSourceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);

  const loadInterfaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [availableInterfaces, activeDataSources] = await Promise.all([
        kismetService.getAvailableInterfaces(),
        kismetService.getActiveDataSources()
      ]);

      setInterfaces(availableInterfaces);
      setActiveSources(activeDataSources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interfaces');
    } finally {
      setLoading(false);
    }
  }, [kismetService]);

  useEffect(() => {
    loadInterfaces();
    const interval = setInterval(loadInterfaces, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [loadInterfaces]);

  const handleInterfaceSelect = async (interfaceName: string) => {
    if (disabled || configuring) return;

    try {
      setConfiguring(true);
      const uuid = await kismetService.selectInterface(interfaceName, {
        hop: true, // Enable channel hopping by default
        hopRate: 1 // 1 second hop rate
      });

      if (onInterfaceSelected) {
        onInterfaceSelected(interfaceName, uuid);
      }

      // Reload interfaces to show updated status
      await loadInterfaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select interface');
    } finally {
      setConfiguring(false);
    }
  };

  const handleRemoveSource = async (uuid: string) => {
    if (disabled || configuring) return;

    try {
      setConfiguring(true);
      await kismetService.removeDataSource(uuid);
      await loadInterfaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove source');
    } finally {
      setConfiguring(false);
    }
  };

  const getInterfaceIcon = (interfaceType: string) => {
    switch (interfaceType) {
      case 'linuxwifi':
        return '📡';
      case 'linuxbluetooth':
        return '🔵';
      default:
        return '🔌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-use':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'incompatible':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getInterfaceTypeLabel = (interfaceType: string) => {
    switch (interfaceType) {
      case 'linuxwifi':
        return 'WiFi';
      case 'linuxbluetooth':
        return 'Bluetooth';
      default:
        return 'Other';
    }
  };

  if (loading) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Scanning for interfaces...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="text-red-800 dark:text-red-200 text-sm">
          <strong>Error:</strong> {error}
          <button
            onClick={loadInterfaces}
            className="ml-2 text-red-600 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Interfaces */}
      <div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4 mobile-text-base">
          Available Interfaces
        </h3>

        {interfaces.length === 0 ? (
          <div className="mobile-card text-center text-gray-500 dark:text-gray-400 mobile-text-base">
            No interfaces found. Make sure Kismet has access to network interfaces.
          </div>
        ) : (
          <div className="mobile-grid-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
            {interfaces.map((iface) => {
              const isActive = activeSources.some(source => source.interface === iface.name);
              const isSelected = selectedInterface === iface.name;

              return (
                <div
                  key={iface.name}
                  className={`mobile-card cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{getInterfaceIcon(iface.interface_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white mobile-text-base truncate">
                          {iface.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mobile-text-base">
                          {getInterfaceTypeLabel(iface.interface_type)} • {iface.driver}
                        </div>
                        {iface.hardware && iface.hardware !== 'unknown' && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Hardware: {iface.hardware}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(iface.status)}`}>
                        {iface.status}
                      </span>

                      {isActive ? (
                        <button
                          onClick={() => {
                            const activeSource = activeSources.find(source => source.interface === iface.name);
                            if (activeSource) {
                              handleRemoveSource(activeSource.uuid);
                            }
                          }}
                          disabled={disabled || configuring}
                          className="mobile-button px-4 py-2 text-xs sm:text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInterfaceSelect(iface.name)}
                          disabled={disabled || configuring || iface.status !== 'available'}
                          className="mobile-button px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {configuring ? 'Starting...' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Capabilities */}
                  {iface.capabilities && iface.capabilities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {iface.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Sources Summary */}
      {activeSources.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Active Data Sources
          </h3>
          <div className="space-y-2">
            {activeSources.map((source) => (
              <div
                key={source.uuid}
                className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {source.name}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      on {source.interface}
                    </span>
                  </div>

                  <div className="text-sm text-green-600 dark:text-green-400">
                    {source.channel && `Channel ${source.channel}`}
                    {source.hop && ' (hopping)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}