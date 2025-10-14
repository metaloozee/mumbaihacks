/**
 * Format a date with both date and time
 * @param date - Date string or Date object
 * @returns Formatted date-time string (e.g., "Jan 15, 2024, 2:30 PM")
 */
export function formatDateTime(date: string | Date): string {
	return new Date(date).toLocaleString("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

/**
 * Format a date without time
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "1/15/2024")
 */
export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString("en-US");
}
