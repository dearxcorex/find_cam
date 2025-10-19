'use client';

import { useState } from 'react';
import { ViewMode, FilterOptions } from '@/types/kismet';

interface MobileNavigationProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  manufacturers: string[];
  channels: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({
  filters,
  onFilterChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  manufacturers,
  channels,
  isOpen,
  onClose
}: MobileNavigationProps) {
  const [activeSection, setActiveSection] = useState<'view' | 'filters'>('view');

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean | undefined) => {
    onFilterChange({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(v =>
    v !== '' && v !== null && v !== 0.3 && v !== false && v !== undefined
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="mobile-nav-overlay"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="mobile-nav-drawer open">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Camera Detector
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex mt-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection('view')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'view'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              View Mode
            </button>
            <button
              onClick={() => setActiveSection('filters')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'filters'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                  •
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'view' ? (
            <ViewModeSection
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          ) : (
            <FiltersSection
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={onClearFilters}
              manufacturers={manufacturers}
              channels={channels}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
    </>
  );
}

function ViewModeSection({ viewMode, onViewModeChange }: {
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
}) {
  const viewModes: ViewMode[] = [
    { type: 'default', label: 'Default View' },
    { type: 'group-by-manufacturer', label: 'Group by Manufacturer' },
    { type: 'group-by-frequency', label: 'Group by Frequency' },
    { type: 'interference-analysis', label: 'Interference Analysis' }
  ];

  return (
    <div className="p-4 space-y-3">
      {viewModes.map((mode) => (
        <button
          key={mode.type}
          onClick={() => onViewModeChange(mode)}
          className={`w-full text-left p-4 rounded-lg border transition-colors ${
            viewMode.type === mode.type
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="font-medium text-gray-900 dark:text-white">
            {mode.label}
          </div>
        </button>
      ))}
    </div>
  );
}

function FiltersSection({
  filters,
  onFilterChange,
  onClearFilters,
  manufacturers,
  channels,
  viewMode
}: {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string | number | boolean | undefined) => void;
  onClearFilters: () => void;
  manufacturers: string[];
  channels: string[];
  viewMode: ViewMode;
}) {
  const hasActiveFilters = Object.values(filters).some(v =>
    v !== '' && v !== null && v !== 0.3 && v !== false && v !== undefined
  );

  return (
    <div className="p-4 space-y-6">
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Manufacturer Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Manufacturer
        </label>
        <input
          type="text"
          value={filters.manufacturerFilter || ''}
          onChange={(e) => onFilterChange('manufacturerFilter', e.target.value)}
          className="mobile-input"
          placeholder="Search manufacturer..."
        />
        {manufacturers.length > 0 && (
          <select
            value={filters.manufacturerFilter || ''}
            onChange={(e) => onFilterChange('manufacturerFilter', e.target.value)}
            className="mobile-input mt-2"
          >
            <option value="">All manufacturers</option>
            {manufacturers.map((mfr) => (
              <option key={mfr} value={mfr}>{mfr}</option>
            ))}
          </select>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={filters.categoryFilter || ''}
          onChange={(e) => onFilterChange('categoryFilter', e.target.value ? e.target.value : undefined)}
          className="mobile-input"
        >
          <option value="">All categories</option>
          <option value="camera">Camera</option>
          <option value="iot">IoT</option>
          <option value="networking">Networking</option>
          <option value="computing">Computing</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Frequency Band Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency Band
        </label>
        <select
          value={filters.frequencyBand || ''}
          onChange={(e) => onFilterChange('frequencyBand', e.target.value ? e.target.value : undefined)}
          className="mobile-input"
        >
          <option value="">All bands</option>
          <option value="2.4GHz">2.4 GHz</option>
          <option value="5GHz">5 GHz</option>
          <option value="6GHz">6 GHz</option>
        </select>
      </div>

      {/* Channel Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Channel
        </label>
        <input
          type="text"
          value={filters.channelFilter || ''}
          onChange={(e) => onFilterChange('channelFilter', e.target.value)}
          className="mobile-input"
          placeholder="e.g., 6, 36, 149"
        />
        {channels.length > 0 && (
          <select
            value={filters.channelFilter || ''}
            onChange={(e) => onFilterChange('channelFilter', e.target.value)}
            className="mobile-input mt-2"
          >
            <option value="">All channels</option>
            {channels.map((channel) => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        )}
      </div>

      {/* Confidence Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Minimum Confidence
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters.minConfidence || 0.3}
            onChange={(e) => onFilterChange('minConfidence', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
            {Math.round((filters.minConfidence || 0.3) * 100)}%
          </span>
        </div>
      </div>

      {/* Interference Analysis Filters */}
      {viewMode.type === 'interference-analysis' && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Interference Analysis
          </h4>

          {/* Priority Level */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Level
            </label>
            <select
              value={filters.interferencePriority || ''}
              onChange={(e) => onFilterChange('interferencePriority', e.target.value ? e.target.value : undefined)}
              className="mobile-input"
            >
              <option value="">All priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regulatory Compliance
            </label>
            <select
              value={filters.regulatoryCompliance || ''}
              onChange={(e) => onFilterChange('regulatoryCompliance', e.target.value ? e.target.value : undefined)}
              className="mobile-input"
            >
              <option value="">All compliance levels</option>
              <option value="NON_COMPLIANT">Non-Compliant (Channels &gt; 13)</option>
              <option value="QUESTIONABLE">Questionable</option>
              <option value="COMPLIANT">Compliant</option>
            </select>
          </div>

          {/* Extended Channels Toggle */}
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.extendedChannelsOnly || false}
                onChange={(e) => onFilterChange('extendedChannelsOnly', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Extended Channels Only (&gt; 13)
              </span>
            </label>
          </div>

          {/* DFS Channels Toggle */}
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.showDFSChannels || false}
                onChange={(e) => onFilterChange('showDFSChannels', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show DFS Channels
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}