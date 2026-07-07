/**
 * Formats a number to USD currency.
 * @param {number} value
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

/**
 * Formats a percentage change.
 * @param {number} value
 */
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Generates mock relative dates.
 * @param {string} dateString
 */
export const getRelativeTime = (timeAgo) => {
  return timeAgo || 'Just now';
};
