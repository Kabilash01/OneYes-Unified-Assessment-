/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Include time in output
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date and time separately
 * @param {Date|string} date - Date to format
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateStr} at ${timeStr}`;
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

/**
 * Calculate time remaining
 * @param {Date|string} endTime - End time
 */
export const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) {
    return { expired: true, display: 'Expired' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let display = '';
  if (days > 0) display += `${days}d `;
  if (hours > 0 || days > 0) display += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) display += `${minutes}m `;
  display += `${seconds}s`;

  return { expired: false, display: display.trim(), days, hours, minutes, seconds };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Get status badge color
 * @param {string} status - Status string
 */
export const getStatusColor = (status) => {
  const statusColors = {
    draft: 'secondary',
    published: 'success',
    archived: 'warning',
    'in-progress': 'primary',
    submitted: 'warning',
    evaluated: 'success',
  };

  return statusColors[status?.toLowerCase()] || 'secondary';
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get initials from name
 * @param {string} name - Full name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 */
export const isValidEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

/**
 * Generate random color for avatar
 * @param {string} seed - Seed for consistent color
 */
export const generateAvatarColor = (seed) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  if (!seed) return colors[0];
  
  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Download file
 * @param {string} data - File data
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export const debounce = (func, wait = 300) => {
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
 * Validate if assessment is currently active
 * @param {Object} assessment - Assessment object
 */
export const isAssessmentActive = (assessment) => {
  if (assessment.status !== 'published') return false;
  
  const now = new Date();
  const start = assessment.startDate ? new Date(assessment.startDate) : null;
  const end = assessment.endDate ? new Date(assessment.endDate) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
};
