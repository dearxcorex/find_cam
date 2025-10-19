'use client';

import { useState } from 'react';
import { KismetConfig } from '@/lib/kismet-api';

interface ConnectionFormProps {
  onConnect: (config: KismetConfig) => void;
  initialConfig: KismetConfig;
  connectionError: string | null;
}

export function ConnectionForm({ onConnect, initialConfig, connectionError }: ConnectionFormProps) {
  const [config, setConfig] = useState<KismetConfig>(initialConfig);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    await onConnect(config);
    setIsConnecting(false);
  };

  const handleInputChange = (field: keyof KismetConfig, value: string | boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kismet Camera Detector</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect to your Kismet server to detect camera devices</p>
        </div>
      </div>

      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300 text-sm">{connectionError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kismet Server URL
          </label>
          <input
            type="url"
            id="host"
            value={config.host}
            onChange={(e) => handleInputChange('host', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="http://192.168.0.128:2501"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter your Kismet server URL including port number
          </p>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your Kismet API key"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Get your API key from Kismet settings or environment variables
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useMacApi"
              checked={config.useMacApi}
              onChange={(e) => handleInputChange('useMacApi', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="useMacApi" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Use MAC Vendor API (may be rate limited)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={config.autoRefresh}
              onChange={(e) => handleInputChange('autoRefresh', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Auto-refresh device list
            </label>
          </div>
        </div>

        {config.autoRefresh && (
          <div>
            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              id="refreshInterval"
              value={config.refreshInterval / 1000}
              onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value) * 1000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="5"
              max="300"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How often to refresh the device list (5-300 seconds)
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isConnecting || !config.apiKey}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            'Connect to Kismet'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Need help?</h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Make sure Kismet server is running and accessible</li>
          <li>• Get your API key from Kismet settings or run <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">kismet -s</code></li>
          <li>• Default Kismet web interface: http://localhost:2501</li>
          <li>• Set API key as environment variable: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">KISMET_API_KEY</code></li>
        </ul>
      </div>
    </div>
  );
}