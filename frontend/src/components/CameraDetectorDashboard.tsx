'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { KismetService, KismetConfig } from '@/lib/kismet-api';
import { Device, CameraCandidate, ViewMode } from '@/types/kismet';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DeviceGrid } from './DeviceGrid';
import { GroupedView } from './GroupedView';
import { DeviceModal } from './DeviceModal';
import { ExportModal } from './ExportModal';
import { SummaryStats } from './SummaryStats';

interface CameraDetectorDashboardProps {
  kismetService: KismetService;
  config: KismetConfig;
  onDisconnect: () => void;
}

export function CameraDetectorDashboard({ kismetService, config, onDisconnect }: CameraDetectorDashboardProps) {
  const [selectedDevice, setSelectedDevice] = useState<CameraCandidate | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'default', label: 'Default View' });
  const [filters, setFilters] = useState({
    manufacturerFilter: '',
    categoryFilter: '',
    exactFrequency: null as number | null,
    frequencyRange: '',
    frequencyBand: '',
    channelFilter: '',
    minConfidence: 0.3,
    interferencePriority: undefined as 'HIGH' | 'MEDIUM' | 'LOW' | undefined,
    regulatoryCompliance: undefined as 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT' | undefined,
    extendedChannelsOnly: false,
    showDFSChannels: false
  });

  // Fetch devices using SWR for real-time updates
  const { data: devices = [], error, isLoading, mutate } = useSWR(
    ['devices', config.host, config.apiKey],
    async () => {
      const result = await kismetService.getDevices();
      return result;
    },
    {
      refreshInterval: config.autoRefresh ? config.refreshInterval : 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  // Identify camera candidates from devices
  const cameraCandidates = devices ? kismetService.identifyCameraDevices(devices) : [];

  // Apply filters to camera candidates
  const filteredCandidates = useCallback(() => {
    let filtered = [...cameraCandidates];

    if (filters.manufacturerFilter) {
      filtered = kismetService.filterByManufacturer(filtered, filters.manufacturerFilter);
    }

    if (filters.categoryFilter) {
      filtered = kismetService.filterByCategory(filtered, filters.categoryFilter);
    }

    if (filters.exactFrequency) {
      filtered = kismetService.filterByExactFrequency(filtered, filters.exactFrequency);
    }

    if (filters.frequencyRange) {
      filtered = kismetService.filterByFrequencyRange(filtered, filters.frequencyRange);
    }

    if (filters.frequencyBand) {
      filtered = kismetService.filterByFrequencyBand(filtered, filters.frequencyBand);
    }

    if (filters.channelFilter) {
      filtered = kismetService.filterByChannel(filtered, filters.channelFilter);
    }

    if (filters.minConfidence > 0) {
      filtered = kismetService.filterByConfidence(filtered, filters.minConfidence);
    }

    return filtered;
  }, [cameraCandidates, filters, kismetService]);

  const filteredDevices = filteredCandidates();

  // Auto-refresh control
  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Handle device selection
  const handleDeviceClick = (candidate: CameraCandidate) => {
    setSelectedDevice(candidate);
    setShowDeviceModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      manufacturerFilter: '',
      categoryFilter: '',
      exactFrequency: null,
      frequencyRange: '',
      frequencyBand: '',
      channelFilter: '',
      minConfidence: 0.3,
      interferencePriority: undefined,
      regulatoryCompliance: undefined,
      extendedChannelsOnly: false,
      showDFSChannels: false
    });
  };

  // Get unique values for filter dropdowns
  const manufacturers = Array.from(new Set(
    cameraCandidates.map(c => c.device.manufacturer?.name).filter(Boolean)
  )).sort();

  const categories = Array.from(new Set(
    cameraCandidates.map(c => c.device.manufacturer?.category).filter(Boolean)
  )).sort();

  const frequencyBands = Array.from(new Set(
    cameraCandidates.map(c => c.device.frequencyInfo?.band).filter(Boolean)
  )).sort();

  const channels = Array.from(new Set(
    cameraCandidates.map(c => c.device.frequencyInfo?.channel).filter(Boolean)
  )).sort();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        config={config}
        onDisconnect={onDisconnect}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastUpdated={new Date()}
        totalDevices={devices.length}
        cameraCandidates={cameraCandidates.length}
        filteredDevices={filteredDevices.length}
        onExport={() => setShowExportModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with filters */}
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          manufacturers={manufacturers}
          categories={categories}
          frequencyBands={frequencyBands}
          channels={channels}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Summary Stats */}
            <SummaryStats
              totalDevices={devices.length}
              cameraCandidates={cameraCandidates.length}
              filteredDevices={filteredDevices.length}
              manufacturers={manufacturers.length}
              frequencyBands={frequencyBands.length}
            />

            {/* Device display based on view mode */}
            {error ? (
              <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 dark:text-red-300">
                    Error loading devices: {error instanceof Error ? error.message : 'Unknown error'}
                  </span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="mt-6 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading devices...</span>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="mt-6 text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {cameraCandidates.length === 0 ? 'No camera devices found' : 'No devices match current filters'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {cameraCandidates.length === 0
                    ? 'No camera devices were detected. Try adjusting your filters or check if Kismet is detecting devices.'
                    : 'Try adjusting your filters to see more devices.'
                  }
                </p>
                {Object.values(filters).some(v => v !== '' && v !== null && v !== 0.3) && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : viewMode.type === 'default' ? (
              <DeviceGrid
                candidates={filteredDevices}
                onDeviceClick={handleDeviceClick}
              />
            ) : (
              <GroupedView
                candidates={filteredDevices}
                viewMode={viewMode}
                onDeviceClick={handleDeviceClick}
                kismetService={kismetService}
              />
            )}
          </div>
        </main>
      </div>

      {/* Device Modal */}
      {showDeviceModal && selectedDevice && (
        <DeviceModal
          device={selectedDevice}
          isOpen={showDeviceModal}
          onClose={() => setShowDeviceModal(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          candidates={filteredDevices}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          kismetService={kismetService}
        />
      )}
    </div>
  );
}