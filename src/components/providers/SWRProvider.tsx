"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

interface SWRProviderProps {
	children: ReactNode;
}

export const SWRProvider = ({ children }: SWRProviderProps) => {
	return (
		<SWRConfig
			value={{
				// Global error handling
				onError: (error, key) => {
					console.error("SWR Error:", error, "Key:", key);

					// You can add your error tracking service here
					// analytics.track('swr_error', { key, error: error.message });
				},

				// Global success handling
				onSuccess: (data, key) => {
					console.log("SWR Success:", key);

					// You can add analytics here
					// analytics.track('swr_success', { key });
				},

				// Retry configuration
				errorRetryCount: 3,
				errorRetryInterval: 1000,

				// Background revalidation
				focusThrottleInterval: 5000,

				// Performance optimizations
				provider: () => new Map(),

				// Deduplication
				dedupingInterval: 2000,
			}}>
			{children}
		</SWRConfig>
	);
};
