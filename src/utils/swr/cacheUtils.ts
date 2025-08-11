/* src/utils/swr/cacheUtils.ts */
import { mutate } from "swr";

interface CacheOptions {
	revalidate?: boolean;
	populateCache?: boolean;
}

/**
 * Utility functions for SWR cache management
 */

export class SWRCacheManager {
	/**
	 * Store data in SWR cache without triggering revalidation
	 */
	static async storeInCache<T>(
		key: string,
		data: T,
		options: CacheOptions = {}
	): Promise<T | undefined> {
		const { revalidate = false, populateCache = true } = options;

		try {
			return await mutate(key, data, {
				revalidate,
				populateCache,
			});
		} catch (error) {
			console.error(`Failed to store data in cache for key: ${key}`, error);
			throw error;
		}
	}

	/**
	 * Clear specific cache entry
	 */
	static async clearCache(key: string): Promise<void> {
		try {
			console.log(`🗑️ Clearing SWR cache: ${key}`);
			await mutate(key, undefined, { revalidate: false });
		} catch (error) {
			console.error(`Failed to clear cache for key: ${key}`, error);
			throw error;
		}
	}
	/**
	 * Get cahce key for pipeline stats
	 */
	static getPipelineStatsKey(
		locationId: string,
		type: "quick" | "bulk" = "quick",
		pipelineId?: string
	): string {
		const baseKey = `/api/ghl/opportunities/${
			type === "quick" ? "getPipelineStats" : "bulk-stats"
		}`;
		const params = new URLSearchParams({ locationId });

		if (pipelineId && type === "bulk") {
			params.append("pipelineId", pipelineId);
		}

		return `${baseKey}?${params.toString()}`;
	}
	/**
	 * Invalidate all pipeline stats caches for a location
	 */
	static async invalidatePipelineStats(locationId: string): Promise<void> {
		const quickKey = this.getPipelineStatsKey(locationId, "quick");
		const bulkKey = this.getPipelineStatsKey(locationId, "bulk");

		await Promise.all([
			mutate(quickKey, undefined, { revalidate: true }),
			mutate(bulkKey, undefined, { revalidate: false }),
		]);

		console.log(`Invalidated pipeline stats cache for location: ${locationId}`);
	}
}
