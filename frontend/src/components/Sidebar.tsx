'use client';

import { ViewMode, FilterOptions } from '@/types/kismet';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  manufacturers: string[];
  channels: string[];
}

export function Sidebar({
  filters,
  onFilterChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  manufacturers,
  channels
}: SidebarProps) {
  const hasActiveFilters = Object.values(filters).some(v =>
    v !== '' && v !== null && v !== 0.3 && v !== false && v !== undefined
  );

  const viewModes: ViewMode[] = [
    { type: 'default', label: 'Default View' },
    { type: 'group-by-manufacturer', label: 'Group by Manufacturer' },
    { type: 'group-by-frequency', label: 'Group by Frequency' },
    { type: 'interference-analysis', label: 'Interference Analysis' }
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* View Mode Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">View Mode</h3>
        <div className="space-y-2">
          {viewModes.map((mode) => (
            <button
              key={mode.type}
              onClick={() => onViewModeChange(mode)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                viewMode.type === mode.type
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Manufacturer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={filters.manufacturerFilter}
              onChange={(e) => onFilterChange({ manufacturerFilter: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search manufacturer..."
            />
            {manufacturers.length > 0 && (
              <select
                value={filters.manufacturerFilter}
                onChange={(e) => onFilterChange({ manufacturerFilter: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={filters.categoryFilter}
              onChange={(e) => onFilterChange({
              categoryFilter: e.target.value ? e.target.value as 'camera' | 'networking' | 'computing' | 'iot' : undefined
            })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency Band
            </label>
            <select
              value={filters.frequencyBand}
              onChange={(e) => onFilterChange({
              frequencyBand: e.target.value ? e.target.value as '2.4GHz' | '5GHz' | '6GHz' : undefined
            })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All bands</option>
              <option value="2.4GHz">2.4 GHz</option>
              <option value="5GHz">5 GHz</option>
              <option value="6GHz">6 GHz</option>
            </select>
          </div>

          {/* Exact Frequency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exact Frequency (GHz)
            </label>
            <input
              type="number"
              step="0.001"
              value={filters.exactFrequency || ''}
              onChange={(e) => onFilterChange({ exactFrequency: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 2.437"
            />
          </div>

          {/* Frequency Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency Range (GHz)
            </label>
            <input
              type="text"
              value={filters.frequencyRange}
              onChange={(e) => onFilterChange({ frequencyRange: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 2.430-2.450"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: start-end (e.g., 2.430-2.450)
            </p>
          </div>

          {/* Channel Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Channel
            </label>
            <input
              type="text"
              value={filters.channelFilter}
              onChange={(e) => onFilterChange({ channelFilter: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 6, 36, 149"
            />
            {channels.length > 0 && (
              <select
                value={filters.channelFilter}
                onChange={(e) => onFilterChange({ channelFilter: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Confidence
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.minConfidence}
                onChange={(e) => onFilterChange({ minConfidence: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                {Math.round((filters.minConfidence || 0.3) * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Interference Analysis Filters - Only show in interference mode */}
          {viewMode.type === 'interference-analysis' && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Interference Analysis
                </h4>

                {/* Interference Priority Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={filters.interferencePriority || ''}
                    onChange={(e) => onFilterChange({
                      interferencePriority: e.target.value ? e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' : undefined
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All priorities</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                {/* Regulatory Compliance Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Regulatory Compliance
                  </label>
                  <select
                    value={filters.regulatoryCompliance || ''}
                    onChange={(e) => onFilterChange({
                      regulatoryCompliance: e.target.value ? e.target.value as 'COMPLIANT' | 'QUESTIONABLE' | 'NON_COMPLIANT' : undefined
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All compliance levels</option>
                    <option value="NON_COMPLIANT">Non-Compliant (Channels above 13)</option>
                    <option value="QUESTIONABLE">Questionable</option>
                    <option value="COMPLIANT">Compliant</option>
                  </select>
                </div>

                {/* Extended Channels Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.extendedChannelsOnly || false}
                      onChange={(e) => onFilterChange({ extendedChannelsOnly: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Extended Channels Only (above 13)
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Show devices using non-standard WiFi channels
                  </p>
                </div>

                {/* DFS Channels Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.showDFSChannels || false}
                      onChange={(e) => onFilterChange({ showDFSChannels: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show DFS Channels
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Include Dynamic Frequency Selection channels
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="font-medium mb-1">Active Filters:</div>
            <ul className="space-y-1">
              {filters.manufacturerFilter && (
                <li>• Manufacturer: {filters.manufacturerFilter}</li>
              )}
              {filters.categoryFilter && (
                <li>• Category: {filters.categoryFilter}</li>
              )}
              {filters.frequencyBand && (
                <li>• Band: {filters.frequencyBand}</li>
              )}
              {filters.exactFrequency && (
                <li>• Frequency: {filters.exactFrequency} GHz</li>
              )}
              {filters.frequencyRange && (
                <li>• Range: {filters.frequencyRange} GHz</li>
              )}
              {filters.channelFilter && (
                <li>• Channel: {filters.channelFilter}</li>
              )}
              {(filters.minConfidence || 0.3) > 0.3 && (
                <li>• Confidence: ≥{Math.round((filters.minConfidence || 0.3) * 100)}%</li>
              )}
              {filters.interferencePriority && (
                <li>• Priority: {filters.interferencePriority}</li>
              )}
              {filters.regulatoryCompliance && (
                <li>• Compliance: {filters.regulatoryCompliance}</li>
              )}
              {filters.extendedChannelsOnly && (
                <li>• Extended channels only</li>
              )}
              {filters.showDFSChannels && (
                <li>• Include DFS channels</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}