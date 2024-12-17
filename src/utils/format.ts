/**
 * Formats a number as currency with thousands separators
 * @param amount The number to format
 * @returns Formatted string with thousands separators
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formats a date string into a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 