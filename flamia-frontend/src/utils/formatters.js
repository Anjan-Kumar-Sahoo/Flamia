/**
 * Currency formatter for INR
 */
export const formatPrice = (amount) => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Date formatter
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

/**
 * DateTime formatter
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

/**
 * Phone mask for privacy: ******4567
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};
