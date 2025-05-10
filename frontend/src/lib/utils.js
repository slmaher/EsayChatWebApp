export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formats a date to display day, month, and year
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.showYear - Whether to show the year (default: true)
 * @param {boolean} options.showMonth - Whether to show the month (default: true)
 * @param {boolean} options.showDay - Whether to show the day (default: true)
 * @param {string} options.format - Custom format string (default: 'short')
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const {
    showYear = true,
    showMonth = true,
    showDay = true,
    format = 'short'
  } = options;
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString('en-US', { month: format });
  const day = dateObj.getDate();
  
  let result = '';
  
  if (showDay) {
    result += day;
  }
  
  if (showMonth) {
    result += (result ? ' ' : '') + month;
  }
  
  if (showYear) {
    result += (result ? ' ' : '') + year;
  }
  
  return result;
}
  