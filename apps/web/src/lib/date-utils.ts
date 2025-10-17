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

export type CombinedDateTime = {
	date: Date;
	hour?: number;
	minute?: number;
	second?: number;
};

/**
 * Combine a calendar date (Date object, date part only used) with time parts to an ISO string
 */
export function combineDateAndTime({ date, hour = 0, minute = 0, second = 0 }: CombinedDateTime): string {
	const combined = new Date(date);
	combined.setHours(hour, minute, second, 0);
	return combined.toISOString();
}

/**
 * Parse an ISO or date string to a Date instance safely
 */
export function toDate(value: string | Date | null | undefined): Date | null {
	if (!value) {
		return null;
	}
	return value instanceof Date ? value : new Date(value);
}
