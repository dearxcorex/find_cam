'use client';

import { useState, useEffect } from 'react';
import { CameraDetectorDashboard } from '@/components/CameraDetectorDashboard';
import { ConnectionForm } from '@/components/ConnectionForm';
import { KismetConfig, KismetService } from '@/lib/kismet-api';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [kismetConfig, setKismetConfig] = useState<KismetConfig | null>(null);
  const [kismetService, setKismetService] = useState<KismetService | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<string | undefined>();
  
  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('kismet-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);

        // Validate API key - clear old config if using old API key
        if (config.apiKey === 'EBE296C5407BC8C834F8F85FDE63711F') {
          console.log('Clearing old configuration with outdated API key');
          localStorage.removeItem('kismet-config');
          // Set default configuration
          const defaultConfig: KismetConfig = {
            host: 'http://192.168.0.128:2501',
            apiKey: '611D867A37D3155BF28FC36A790E412C',
            useMacApi: false,
            autoRefresh: true,
            refreshInterval: 30000
          };
          setKismetConfig(defaultConfig);
          const service = new KismetService(defaultConfig.host, defaultConfig.apiKey);
          setKismetService(service);
        } else {
          setKismetConfig(config);
          const service = new KismetService(config.host, config.apiKey);
          setKismetService(service);

          // Auto-connect if we have saved config
          testConnection(service, config);
        }
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
        // Clear corrupted config
        localStorage.removeItem('kismet-config');
      }
    } else {
      // Set default configuration
      const defaultConfig: KismetConfig = {
        host: 'http://192.168.0.128:2501',
        apiKey: '611D867A37D3155BF28FC36A790E412C',
        useMacApi: false,
        autoRefresh: true,
        refreshInterval: 30000
      };
      setKismetConfig(defaultConfig);
      const service = new KismetService(defaultConfig.host, defaultConfig.apiKey);
      setKismetService(service);
    }
  }, []);

  const testConnection = async (service: KismetService, config: KismetConfig) => {
    if (!config.apiKey) {
      setConnectionError('API key is required for connection');
      return;
    }

    try {
      const connected = await service.testConnection();
      if (connected) {
        // For the initial connection step, we only validate the server connection
        // Interface selection will handle setting isConnected to true
        setConnectionError(null);
        localStorage.setItem('kismet-config', JSON.stringify(config));
      } else {
        setIsConnected(false);
        setConnectionError('Failed to connect to Kismet server. Please check the host and API key.');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConnect = async (config: KismetConfig) => {
    setKismetConfig(config);
    const service = new KismetService(config.host, config.apiKey);
    setKismetService(service);

    await testConnection(service, config);
  };

  const handleInterfaceSelected = (interfaceName: string, uuid: string) => {
    setSelectedInterface(interfaceName);
    // After interface selection, we consider the connection fully established
    setIsConnected(true);
    setConnectionError(null);

    // Save the complete configuration including interface selection
    if (kismetConfig) {
      const completeConfig = {
        ...kismetConfig,
        selectedInterface: interfaceName,
        selectedInterfaceUuid: uuid
      };
      localStorage.setItem('kismet-config', JSON.stringify(completeConfig));
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedInterface(undefined);
    localStorage.removeItem('kismet-config');
  };

  // Show connection form if not connected or if interface selection is needed
  if (!isConnected || !kismetService || !kismetConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ConnectionForm
            onConnect={handleConnect}
            initialConfig={kismetConfig || {
              host: 'http://192.168.0.128:2501',
              apiKey: '611D867A37D3155BF28FC36A790E412C',
              useMacApi: false,
              autoRefresh: true,
              refreshInterval: 30000
            }}
            connectionError={connectionError}
            selectedInterface={selectedInterface}
            onInterfaceSelected={handleInterfaceSelected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CameraDetectorDashboard
        kismetService={kismetService}
        config={kismetConfig}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}