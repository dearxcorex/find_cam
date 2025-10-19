'use client';

import { CameraCandidate, ViewMode, KismetService } from '@/types/kismet';

interface GroupedViewProps {
  candidates: CameraCandidate[];
  viewMode: ViewMode;
  onDeviceClick: (candidate: CameraCandidate) => void;
  kismetService: KismetService;
}

export function GroupedView({ candidates, viewMode, onDeviceClick, kismetService }: GroupedViewProps) {
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

  const getFrequencyBandIcon = (band: string) => {
    switch (band) {
      case '2.4GHz': return '📡';
      case '5GHz': return '📶';
      case '6GHz': return '📡';
      default: return '❓';
    }
  };

  const formatFrequency = (frequencyGhz: number | null | undefined) => {
    if (!frequencyGhz) return 'Unknown';
    return `${frequencyGhz.toFixed(3)} GHz`;
  };

  const groupCandidates = () => {
    if (viewMode.type === 'group-by-manufacturer') {
      return kismetService.groupByManufacturer(candidates);
    } else if (viewMode.type === 'group-by-frequency') {
      return kismetService.groupByFrequency(candidates);
    } else if (viewMode.type === 'interference-analysis') {
      return kismetService.groupByInterference(candidates);
    }
    return {};
  };

  const groupedCandidates = groupCandidates();
  const groups = Object.entries(groupedCandidates);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No grouped devices found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters to see grouped results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([groupName, groupCandidates]) => {
        const avgConfidence = groupCandidates.reduce((sum, c) => sum + c.confidence, 0) / groupCandidates.length;

        // Get group-specific information
        let groupInfo: any = {};
        if (viewMode.type === 'group-by-manufacturer' && groupCandidates[0]) {
          const manufacturer = groupCandidates[0].device.manufacturer;
          if (manufacturer) {
            groupInfo = {
              category: manufacturer.category,
              icon: getCategoryIcon(manufacturer.category)
            };
          }
        } else if (viewMode.type === 'group-by-frequency' && groupCandidates[0]) {
          const freqInfo = groupCandidates[0].device.frequencyInfo;
          if (freqInfo) {
            groupInfo = {
              band: freqInfo.band,
              channel: freqInfo.channel,
              icon: getFrequencyBandIcon(freqInfo.band)
            };
          }
        } else if (viewMode.type === 'interference-analysis' && groupCandidates[0]) {
          const freqInfo = groupCandidates[0].device.frequencyInfo;
          if (freqInfo?.interferenceInfo) {
            const interference = freqInfo.interferenceInfo;
            let icon = '⚠️';
            if (interference.priority === 'HIGH') icon = '🚨';
            else if (interference.priority === 'MEDIUM') icon = '⚡';
            else if (interference.priority === 'LOW') icon = '📡';

            groupInfo = {
              priority: interference.priority,
              risk: interference.interferenceRisk,
              compliance: interference.regulatoryCompliance,
              isExtended: interference.isExtendedChannel,
              icon: icon
            };
          }
        }

        return (
          <div key={groupName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Group Header */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{groupInfo.icon || '📁'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {groupName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {groupCandidates.length} device{groupCandidates.length !== 1 ? 's' : ''}
                      </span>
                      {groupInfo.category && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {groupInfo.category}
                        </span>
                      )}
                      {groupInfo.band && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Band: {groupInfo.band}
                        </span>
                      )}
                      {groupInfo.channel && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Channel: {groupInfo.channel}
                        </span>
                      )}
                      {groupInfo.priority && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Priority: {groupInfo.priority}
                        </span>
                      )}
                      {groupInfo.risk !== undefined && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Risk: {groupInfo.risk}%
                        </span>
                      )}
                      {groupInfo.compliance && (
                        <span className={`text-sm ${
                          groupInfo.compliance === 'NON_COMPLIANT'
                            ? 'text-red-600 dark:text-red-400'
                            : groupInfo.compliance === 'QUESTIONABLE'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {groupInfo.compliance}
                        </span>
                      )}
                      {groupInfo.isExtended && (
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          Extended Channel
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(avgConfidence)}`}>
                    Avg: {Math.round(avgConfidence * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Group Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupCandidates.map((candidate) => (
                  <div
                    key={candidate.device.key}
                    onClick={() => onDeviceClick(candidate)}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
                  >
                    {/* Device Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {candidate.device.name || 'Unknown Device'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {candidate.device.mac}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(candidate.confidence)}`}>
                          {Math.round(candidate.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Device Details */}
                    <div className="space-y-2">
                      {candidate.device.manufacturer && (
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getCategoryIcon(candidate.device.manufacturer.category)}</span>
                          <span className="text-xs text-gray-900 dark:text-white truncate">
                            {candidate.device.manufacturer.name}
                          </span>
                        </div>
                      )}

                      {candidate.device.frequencyInfo && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {formatFrequency(candidate.device.frequencyInfo.frequencyGhz)}
                          {candidate.device.frequencyInfo.channel && (
                            <span className="ml-1">
                              (Ch {candidate.device.frequencyInfo.channel})
                            </span>
                          )}
                        </div>
                      )}

                      {candidate.device.signal && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Signal: {candidate.device.signal} dBm
                        </div>
                      )}

                      {candidate.device.ipAddresses.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          IP: {candidate.device.ipAddresses.slice(0, 2).join(', ')}
                          {candidate.device.ipAddresses.length > 2 && ` +${candidate.device.ipAddresses.length - 2}`}
                        </div>
                      )}
                    </div>

                    {/* Key Detection Reason */}
                    {candidate.reasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Key indicator:</span>
                          <div className="truncate mt-1">
                            {candidate.reasons[0]}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-center">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Click for details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}