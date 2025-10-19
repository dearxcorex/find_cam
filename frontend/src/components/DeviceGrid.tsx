'use client';

import { CameraCandidate } from '@/types/kismet';

interface DeviceGridProps {
  candidates: CameraCandidate[];
  onDeviceClick: (candidate: CameraCandidate) => void;
}

export function DeviceGrid({ candidates, onDeviceClick }: DeviceGridProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (confidence >= 0.4) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'camera':
        return '📹';
      case 'networking':
        return '🌐';
      case 'computing':
        return '💻';
      case 'iot':
        return '🏠';
      default:
        return '❓';
    }
  };

  const getSignalStrengthColor = (signal: number | null) => {
    if (!signal) return 'text-gray-400';
    if (signal >= -50) return 'text-green-600';
    if (signal >= -60) return 'text-yellow-600';
    if (signal >= -70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatFrequency = (frequencyGhz: number | null | undefined) => {
    if (!frequencyGhz) return 'Unknown';
    return `${frequencyGhz.toFixed(3)} GHz`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {candidates.map((candidate) => (
        <div
          key={candidate.device.key}
          onClick={() => onDeviceClick(candidate)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
        >
          {/* Header with device name and confidence */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {candidate.device.name || 'Unknown Device'}
              </h3>
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

          {/* Manufacturer and category */}
          <div className="flex items-center mb-3">
            {candidate.device.manufacturer ? (
              <>
                <span className="text-lg mr-2">{getCategoryIcon(candidate.device.manufacturer.category)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {candidate.device.manufacturer.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {candidate.device.manufacturer.category} • {getConfidenceLabel(candidate.confidence)} confidence
                  </p>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Unknown manufacturer
              </div>
            )}
          </div>

          {/* Device details */}
          <div className="space-y-2 mb-3">
            {/* Device type */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
              <span className="text-xs text-gray-900 dark:text-white font-medium">
                {candidate.device.type}
              </span>
            </div>

            {/* Frequency */}
            {candidate.device.frequencyInfo && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Frequency:</span>
                <span className="text-xs text-gray-900 dark:text-white font-medium">
                  {formatFrequency(candidate.device.frequencyInfo.frequencyGhz)}
                  {candidate.device.frequencyInfo.channel && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      (Ch {candidate.device.frequencyInfo.channel})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Signal strength */}
            {candidate.device.signal && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Signal:</span>
                <span className={`text-xs font-medium ${getSignalStrengthColor(candidate.device.signal)}`}>
                  {candidate.device.signal} dBm
                </span>
              </div>
            )}

            {/* IP addresses */}
            {candidate.device.ipAddresses.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">IP:</span>
                <div className="text-right">
                  {candidate.device.ipAddresses.slice(0, 2).map((ip, index) => (
                    <div key={index} className="text-xs text-gray-900 dark:text-white font-medium">
                      {ip}
                    </div>
                  ))}
                  {candidate.device.ipAddresses.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{candidate.device.ipAddresses.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Key detection reasons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Key indicators:</span>
              <ul className="mt-1 space-y-1">
                {candidate.reasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="truncate">
                    • {reason}
                  </li>
                ))}
                {candidate.reasons.length > 2 && (
                  <li className="text-gray-500 dark:text-gray-400">
                    +{candidate.reasons.length - 2} more reasons
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="mt-3 text-center">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Click for details →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}