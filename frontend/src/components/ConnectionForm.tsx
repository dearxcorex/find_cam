'use client';

import { useState } from 'react';
import { KismetConfig } from '@/lib/kismet-api';
import { KismetService } from '@/lib/kismet-api';
import { InterfaceSelector } from './InterfaceSelector';

interface ConnectionFormProps {
  onConnect: (config: KismetConfig) => void;
  initialConfig: KismetConfig;
  connectionError: string | null;
  selectedInterface?: string;
  onInterfaceSelected?: (interfaceName: string, uuid: string) => void;
}

export function ConnectionForm({
  onConnect,
  initialConfig,
  connectionError,
  selectedInterface,
  onInterfaceSelected
}: ConnectionFormProps) {
  const [config, setConfig] = useState<KismetConfig>(initialConfig);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'connection' | 'interface'>('connection');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 'connection') {
      setIsConnecting(true);
      await onConnect(config);
      setIsConnecting(false);
      // Only advance to interface step if connection was successful
      // (no connection error means we can proceed to interface selection)
      if (!connectionError) {
        setCurrentStep('interface');
      }
    }
  };

  const handleInputChange = (field: keyof KismetConfig, value: string | boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    setCurrentStep('connection');
  };

  const kismetService = new KismetService(config.host, config.apiKey);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center sm:mr-4 mx-auto sm:mx-0">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Kismet Camera Detector</h1>
          <p className="text-gray-600 dark:text-gray-400 mobile-text-base mt-1">
            {currentStep === 'connection'
              ? 'Connect to your Kismet server to detect camera devices'
              : 'Select monitoring interface for camera detection'
            }
          </p>
        </div>
      </div>

      {/* Mobile-friendly Step Indicators */}
      <div className="mb-6">
        <div className="mobile-step-indicator">
          <div className="flex items-center mobile-flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-0">
            <div className="flex items-center">
              <div className={`step w-8 h-8 rounded-full text-sm font-medium ${
                currentStep === 'connection'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}>
                {currentStep === 'connection' ? '1' : '✓'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'connection' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
              }`}>
                Connection
              </span>
            </div>
            <div className="line bg-gray-200 dark:bg-gray-700 w-8 sm:w-12 sm:flex-1 sm:mx-4 h-1">
              <div className={`h-full ${
                currentStep === 'interface' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`step w-8 h-8 rounded-full text-sm font-medium ${
                currentStep === 'interface'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'interface' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                Interface Selection
              </span>
            </div>
          </div>
        </div>
      </div>

      {connectionError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300 text-sm mobile-text-base">{connectionError}</span>
          </div>
        </div>
      )}

      {/* Connection Step */}
      {currentStep === 'connection' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-base">
              Kismet Server URL
            </label>
            <input
              type="url"
              id="host"
              value={config.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              className="mobile-input"
              placeholder="http://192.168.0.128:2501"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 mobile-text-base">
              Enter your Kismet server URL including port number
            </p>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-base">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              className="mobile-input"
              placeholder="Enter your Kismet API key"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 mobile-text-base">
              Get your API key from Kismet settings or environment variables
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                id="useMacApi"
                checked={config.useMacApi}
                onChange={(e) => handleInputChange('useMacApi', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white mobile-text-base">
                  Use MAC Vendor API
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  May be rate limited by external services
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={config.autoRefresh}
                onChange={(e) => handleInputChange('autoRefresh', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white mobile-text-base">
                  Auto-refresh device list
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Keep devices updated automatically
                </p>
              </div>
            </label>
          </div>

          {config.autoRefresh && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-900 dark:text-white mb-2 mobile-text-base">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                id="refreshInterval"
                value={config.refreshInterval / 1000}
                onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value) * 1000)}
                className="mobile-input"
                min="5"
                max="300"
              />
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300 mobile-text-base">
                How often to refresh the device list (5-300 seconds)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting || !config.apiKey}
            className="mobile-button w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
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
      )}

      {/* Interface Selection Step */}
      {currentStep === 'interface' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Monitoring Interface</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the network interface to use for camera detection scanning
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Back to Connection
            </button>
          </div>

          <InterfaceSelector
            kismetService={kismetService}
            onInterfaceSelected={onInterfaceSelected}
            selectedInterface={selectedInterface}
          />
        </div>
      )}

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