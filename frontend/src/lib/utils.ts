import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format signal strength with visual indicator
export function formatSignalStrength(signal?: number): { text: string; color: string; bars: string } {
  if (!signal) {
    return { text: 'N/A', color: 'text-gray-500', bars: '📶' };
  }

  if (signal >= -50) {
    return { text: `${signal} dBm`, color: 'text-green-600', bars: '📶📶📶📶📶' };
  } else if (signal >= -60) {
    return { text: `${signal} dBm`, color: 'text-green-500', bars: '📶📶📶📶' };
  } else if (signal >= -70) {
    return { text: `${signal} dBm`, color: 'text-yellow-600', bars: '📶📶📶' };
  } else if (signal >= -85) {
    return { text: `${signal} dBm`, color: 'text-orange-600', bars: '📶📶' };
  } else {
    return { text: `${signal} dBm`, color: 'text-red-600', bars: '📶' };
  }
}

// Format confidence as percentage with color
export function formatConfidence(confidence: number): { text: string; color: string } {
  const percentage = Math.round(confidence * 100);

  if (confidence >= 0.8) {
    return { text: `${percentage}%`, color: 'text-green-600' };
  } else if (confidence >= 0.6) {
    return { text: `${percentage}%`, color: 'text-yellow-600' };
  } else if (confidence >= 0.4) {
    return { text: `${percentage}%`, color: 'text-orange-600' };
  } else {
    return { text: `${percentage}%`, color: 'text-red-600' };
  }
}

// Format frequency with channel info
export function formatFrequency(frequencyInfo?: { frequencyGhz?: number; band?: string; channel?: string }): string {
  if (!frequencyInfo) return 'Unknown';

  if (frequencyInfo.frequencyGhz) {
    const freq = frequencyInfo.frequencyGhz.toFixed(3);
    const channel = frequencyInfo.channel ? ` (Ch ${frequencyInfo.channel})` : '';
    return `${freq} GHz${channel}`;
  }

  return frequencyInfo.band || 'Unknown';
}

// Get category icon and color
export function getCategoryInfo(category: string): { icon: string; color: string; label: string } {
  switch (category) {
    case 'camera':
      return { icon: '📹', color: 'text-red-600', label: 'Camera' };
    case 'networking':
      return { icon: '🌐', color: 'text-blue-600', label: 'Networking' };
    case 'computing':
      return { icon: '💻', color: 'text-purple-600', label: 'Computing' };
    case 'iot':
      return { icon: '🏠', color: 'text-green-600', label: 'IoT' };
    default:
      return { icon: '❓', color: 'text-gray-600', label: 'Unknown' };
  }
}

// Get frequency band icon
export function getFrequencyBandIcon(band: string): string {
  switch (band) {
    case '2.4GHz':
      return '📡';
    case '5GHz':
      return '📶';
    case '6GHz':
      return '📡';
    default:
      return '❓';
  }
}

// Format MAC address
export function formatMacAddress(mac: string): string {
  if (!mac) return 'Unknown';

  // Add colons if missing
  if (mac.length === 12) {
    return mac.match(/.{2}/g)?.join(':') || mac;
  }

  return mac.toUpperCase();
}

// Format date/time
export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
}

// Format relative time
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Unknown';
  }
}

// Calculate signal distance estimation
export function estimateDistance(signal?: number): string {
  if (!signal) return 'Unknown';

  if (signal >= -30) return 'Very close (1-3m)';
  if (signal >= -50) return 'Close (3-10m)';
  if (signal >= -60) return 'Medium (10-20m)';
  if (signal >= -70) return 'Far (20-50m)';
  return 'Very far (50m+)';
}

// Generate device type icon
export function getDeviceTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'wireless':
    case 'wi-fi client':
    case 'wi-fi bridged':
      return '📡';
    case 'wi-fi ap':
      return '📶';
    case 'wired':
      return '🔌';
    default:
      return '📱';
  }
}

// Sort devices by confidence
export function sortByConfidence<T extends { confidence: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.confidence - a.confidence);
}

// Sort devices by signal strength
export function sortBySignalStrength<T extends { signal?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.signal || -100) - (a.signal || -100));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}