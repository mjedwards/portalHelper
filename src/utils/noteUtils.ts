/**
 * Processes note body text to clean up WAVV call references
 * Replaces WAVV UUID patterns with "WAVV Call"
 */
export function processNoteBody(body: string): string {
	if (!body) return body;

	// Replace WAVV: [UUID] pattern with "WAVV Call"
	// This regex matches: [ WAVV: any-uuid-pattern ]
	const wavvPattern = /\[\s*WAVV:\s*[a-f0-9-]+\s*\]/gi;

	// Replace the pattern with "WAVV Call"
	let processedBody = body.replace(wavvPattern, "WAVV Call");

	// Also handle cases where WAVV appears without brackets
	// Replace any line that starts with WAVV: followed by UUID
	const wavvLinePattern = /^WAVV:\s*[a-f0-9-]+$/gm;
	processedBody = processedBody.replace(wavvLinePattern, "WAVV Call");

	// Clean up any extra whitespace or newlines that might be left
	processedBody = processedBody.replace(/\n\s*\n/g, "\n").trim();

	return processedBody;
}

/**
 * Determines if a note is a WAVV call based on its content
 */
export function isWavvCall(body: string): boolean {
	return /WAVV/i.test(body);
}

/**
 * Extracts call duration from WAVV note if present
 */
export function extractCallDuration(body: string): string | null {
	const durationMatch = body.match(
		/Duration:\s*(\d+\s*(?:seconds?|minutes?|hours?))/i
	);
	return durationMatch ? durationMatch[1] : null;
}

/**
 * Extracts phone numbers from WAVV note
 */
export function extractPhoneNumbers(body: string): {
	to?: string;
	from?: string;
} {
	const toMatch = body.match(/To:\s*(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/i);
	const fromMatch = body.match(/From:\s*(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/i);

	return {
		to: toMatch ? toMatch[1] : undefined,
		from: fromMatch ? fromMatch[1] : undefined,
	};
}
