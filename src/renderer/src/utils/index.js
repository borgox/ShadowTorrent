/**
 * Utility functions for ShadowTorrent
 */

/**
 * Format bytes to human readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format speed with /s suffix
 * @param {number} bytesPerSecond 
 * @returns {string}
 */
export const formatSpeed = (bytesPerSecond) => {
  if (bytesPerSecond === 0) return '0 B/s';
  return `${formatBytes(bytesPerSecond)}/s`;
};

/**
 * Format time remaining
 * @param {number} seconds 
 * @returns {string}
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds === Infinity || seconds < 0) return '∞';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '<1m';
  }
};

/**
 * Format ratio
 * @param {number} ratio 
 * @returns {string}
 */
export const formatRatio = (ratio) => {
  if (!ratio || ratio === Infinity) return '∞';
  if (ratio < 0.01) return '0.00';
  return ratio.toFixed(2);
};

/**
 * Get torrent status
 * @param {Object} torrent 
 * @returns {string}
 */
export const getTorrentStatus = (torrent) => {
  if (torrent.done) return 'completed';
  if (torrent.paused) return 'paused';
  if (torrent.downloadSpeed > 0) return 'downloading';
  if (torrent.uploadSpeed > 0) return 'seeding';
  return 'idle';
};

/**
 * Get status color
 * @param {string} status 
 * @returns {string}
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'downloading': return '#74b9ff';
    case 'seeding': return '#00d4aa';
    case 'completed': return '#00b894';
    case 'paused': return '#fdcb6e';
    case 'error': return '#e17055';
    default: return '#b2b2b2';
  }
};

/**
 * Validate magnet link
 * @param {string} magnetLink 
 * @returns {boolean}
 */
export const isValidMagnetLink = (magnetLink) => {
  const magnetRegex = /^magnet:\?xt=urn:btih:[a-zA-Z0-9]{32,40}/;
  return magnetRegex.test(magnetLink);
};

/**
 * Extract info hash from magnet link
 * @param {string} magnetLink 
 * @returns {string|null}
 */
export const extractInfoHash = (magnetLink) => {
  const match = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]{32,40})/);
  return match ? match[1] : null;
};

/**
 * Generate random peer ID
 * @returns {string}
 */
export const generatePeerId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '-ST0100-'; // ShadowTorrent v1.0.0
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get file extension from filename
 * @param {string} filename 
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is a video
 * @param {string} filename 
 * @returns {boolean}
 */
export const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'];
  return videoExtensions.includes(getFileExtension(filename));
};

/**
 * Check if file is an audio file
 * @param {string} filename 
 * @returns {boolean}
 */
export const isAudioFile = (filename) => {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
  return audioExtensions.includes(getFileExtension(filename));
};

/**
 * Check if file is an image
 * @param {string} filename 
 * @returns {boolean}
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 * @param {Object} obj 
 * @returns {Object}
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};
