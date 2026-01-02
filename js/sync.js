/**
 * Sync - Submit step data to Cloudflare Worker leaderboard
 */

const Sync = {
	/**
	 * Sync all stats to the leaderboard
	 * @param {string} endpoint - User's sync endpoint URL
	 * @param {string} secret_key - User's secret key
	 * @param {Object} stats - Stats object with total_steps, daily_steps, weekly_steps, daily_calories, weekly_calories
	 * @returns {Promise<boolean>} Success status
	 */
	async sync_to_leaderboard(endpoint, secret_key, stats) {

		// Eligibility checks - skip silently if not valid
		if (!endpoint || typeof endpoint !== "string" || endpoint.trim() === "") {
			return false
		}

		if (!secret_key || typeof secret_key !== "string" || secret_key.trim() === "") {
			return false
		}

		if (!stats || typeof stats !== "object") {
			return false
		}

		try {
			const url = new URL(endpoint.trim())

			url.searchParams.set("key", secret_key.trim())

			// Add all stats as query params
			if (typeof stats.total_steps === "number") {
				url.searchParams.set("total_steps", Math.floor(stats.total_steps).toString())
			}

			if (typeof stats.total_calories === "number") {
				url.searchParams.set("total_calories", Math.floor(stats.total_calories).toString())
			}

			if (typeof stats.daily_steps === "number") {
				url.searchParams.set("daily_steps", Math.floor(stats.daily_steps).toString())
			}

			if (typeof stats.weekly_steps === "number") {
				url.searchParams.set("weekly_steps", Math.floor(stats.weekly_steps).toString())
			}

			if (typeof stats.daily_calories === "number") {
				url.searchParams.set("daily_calories", Math.floor(stats.daily_calories).toString())
			}

			if (typeof stats.weekly_calories === "number") {
				url.searchParams.set("weekly_calories", Math.floor(stats.weekly_calories).toString())
			}

			const response = await fetch(url.toString(), {
				method: "GET",
				mode: "cors"
			})

			return response.ok
		} catch {
			// Network errors or invalid URL - fail silently
			return false
		}
	},

	/**
	 * Fetch leaderboard data from the endpoint
	 * @param {string} endpoint - Base endpoint URL
	 * @param {string} type - Leaderboard type: total_steps, daily_steps, weekly_steps, daily_calories, weekly_calories
	 * @returns {Promise<Object|null>} Object with type and leaderboard array, or null on error
	 */
	async fetch_leaderboard(endpoint, type = "total_steps") {

		if (!endpoint || typeof endpoint !== "string" || endpoint.trim() === "") {
			return null
		}

		try {
			// Build leaderboard URL
			const base_url = new URL(endpoint.trim())

			base_url.pathname = "/leaderboard"
			base_url.searchParams.set("type", type)

			const response = await fetch(base_url.toString(), {
				method: "GET",
				mode: "cors"
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()

			return {
				type: data.type || type,
				leaderboard: data.leaderboard || []
			}
		} catch {
			return null
		}
	}
}

export default Sync
