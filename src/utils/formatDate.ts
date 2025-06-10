/**
 * Formats a date string or Date object into a user-friendly format
 * @param date The date to format (string or Date object)
 * @param options Optional formatting options
 * @returns A formatted date string
 */
export function formatDate(
	date: string | Date | null | undefined,
	options?: {
		includeTime?: boolean;
		format?: "short" | "medium" | "long";
	}
): string {
	if (!date) return "";

	const d = typeof date === "string" ? new Date(date) : date;
	const { includeTime = true, format = "medium" } = options || {};

	let dateOptions: Intl.DateTimeFormatOptions = {};

	switch (format) {
		case "short":
			dateOptions = {
				month: "numeric",
				day: "numeric",
				year: "2-digit",
			};
			break;
		case "long":
			dateOptions = {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			};
			break;
		case "medium":
		default:
			dateOptions = {
				month: "short",
				day: "numeric",
				year: "numeric",
			};
	}

	if (includeTime) {
		dateOptions = {
			...dateOptions,
			hour: "2-digit",
			minute: "2-digit",
		};
	}

	return d.toLocaleDateString("en-US", dateOptions);
}

/**
 * Formats a time period between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted time period string
 */
export function formatTimePeriod(
	startDate: string | Date | null | undefined,
	endDate: string | Date | null | undefined
): string {
	if (!startDate || !endDate) return "";

	const start = typeof startDate === "string" ? new Date(startDate) : startDate;
	const end = typeof endDate === "string" ? new Date(endDate) : endDate;

	const dateStr = start.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const startTimeStr = start.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const endTimeStr = end.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
}
