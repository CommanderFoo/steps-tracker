/**
 * CORS headers for cross-origin requests
 */
const cors_headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
}

/**
 * Create JSON response with CORS headers
 */
function json_response(data, status = 200) {

	const body = JSON.stringify(data)
	const headers = {
		"Content-Type": "application/json",
		...cors_headers
	}

	return new Response(body, { status, headers })
}

/**
 * Get today's date in user's local timezone as YYYY-MM-DD
 * @param {number} timezone_offset_minutes - Timezone offset in minutes (e.g., -300 for UTC-5)
 */
function get_local_today(timezone_offset_minutes) {

	const now = new Date()
	const utc_ms = now.getTime()

	// Add offset to get local time (offset is in minutes)
	const local_ms = utc_ms + (timezone_offset_minutes * 60 * 1000)
	const local_date = new Date(local_ms)

	const year = local_date.getUTCFullYear()
	const month = String(local_date.getUTCMonth() + 1).padStart(2, "0")
	const day = String(local_date.getUTCDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}

/**
 * Get the Monday of the current week in user's local timezone as YYYY-MM-DD
 * @param {number} timezone_offset_minutes - Timezone offset in minutes
 */
function get_local_week_start(timezone_offset_minutes) {

	const now = new Date()
	const utc_ms = now.getTime()

	// Add offset to get local time
	const local_ms = utc_ms + (timezone_offset_minutes * 60 * 1000)
	const local_date = new Date(local_ms)

	const day_of_week = local_date.getUTCDay()

	// Calculate days to subtract to get to Monday (Sunday = 0, Monday = 1, etc.)
	const days_to_monday = day_of_week === 0 ? 6 : day_of_week - 1

	const monday = new Date(local_ms - (days_to_monday * 24 * 60 * 60 * 1000))
	const year = monday.getUTCFullYear()
	const month = String(monday.getUTCMonth() + 1).padStart(2, "0")
	const day = String(monday.getUTCDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}

export default {
	async fetch(request, env) {

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: cors_headers })
		}

		try {
			if (request.method !== "GET") {
				return json_response({ "error": "method must be GET" }, 405)
			}

			const request_url = new URL(request.url)
			const pathname = request_url.pathname

			// Route: /leaderboard - Get leaderboard data (public)
			if (pathname === "/leaderboard") {
				return await handle_leaderboard(request_url, env)
			}

			// Route: / - Update user stats (requires key)
			return await handle_sync(request_url, env)
		} catch (err) {
			return json_response({ "error": String(err) }, 500)
		}
	}
}

/**
 * Handle leaderboard request - returns users sorted by specified metric
 * Query params:
 *   - type: overall, daily, weekly, longest_session, total_awards
 *   - tz: timezone offset in minutes (required for daily/weekly to calculate "today")
 */
async function handle_leaderboard(request_url, env) {

	const users_db = env.DB

	if (!users_db) {
		return json_response({ "error": "database binding not found (env.DB)" }, 500)
	}

	// Get leaderboard type from query param
	const leaderboard_type = request_url.searchParams.get("type") || "total_steps"

	// Handle different leaderboard types
	if (leaderboard_type === "overall") {
		const query = "SELECT name, total_steps, total_calories, total_time, best_streak FROM users ORDER BY total_steps DESC"
		const result = await users_db.prepare(query).all()
		const rows = result && result.results ? result.results : result

		const leaderboard = (rows || []).map((row, index) => ({
			rank: index + 1,
			name: row.name || "Anonymous",
			steps: row.total_steps || 0,
			calories: row.total_calories || 0,
			total_time: row.total_time || 0,
			best_streak: row.best_streak || 0
		}))

		return json_response({ "ok": true, "type": "overall", "leaderboard": leaderboard }, 200)
	}

	if (leaderboard_type === "daily") {

		// Get all users with their daily stats and timezone
		const query = "SELECT name, total_daily_steps, total_daily_calories, daily_date, timezone_offset FROM users ORDER BY total_daily_steps DESC"
		const result = await users_db.prepare(query).all()
		const rows = result && result.results ? result.results : result

		// Filter to users whose stored daily_date matches their own local "today"
		// This shows everyone's current day stats, regardless of cross-timezone differences
		const leaderboard = (rows || [])
			.filter(row => {
				const user_local_today = get_local_today(row.timezone_offset || 0)

				return row.daily_date === user_local_today
			})
			.map((row, index) => ({
				rank: index + 1,
				name: row.name || "Anonymous",
				steps: row.total_daily_steps || 0,
				calories: row.total_daily_calories || 0
			}))

		return json_response({ "ok": true, "type": "daily", "leaderboard": leaderboard }, 200)
	}

	if (leaderboard_type === "weekly") {

		// Get all users with their weekly stats and timezone
		const query = "SELECT name, total_weekly_steps, total_weekly_calories, weekly_start_date, timezone_offset FROM users ORDER BY total_weekly_steps DESC"
		const result = await users_db.prepare(query).all()
		const rows = result && result.results ? result.results : result

		// Filter to users whose stored weekly_start_date matches their own local week start
		const leaderboard = (rows || [])
			.filter(row => {
				const user_local_week_start = get_local_week_start(row.timezone_offset || 0)

				return row.weekly_start_date === user_local_week_start
			})
			.map((row, index) => ({
				rank: index + 1,
				name: row.name || "Anonymous",
				steps: row.total_weekly_steps || 0,
				calories: row.total_weekly_calories || 0
			}))

		return json_response({ "ok": true, "type": "weekly", "leaderboard": leaderboard }, 200)
	}

	if (leaderboard_type === "longest_session") {
		const query = "SELECT name, longest_session FROM users ORDER BY longest_session DESC"
		const result = await users_db.prepare(query).all()
		const rows = result && result.results ? result.results : result

		const leaderboard = (rows || []).map((row, index) => ({
			rank: index + 1,
			name: row.name || "Anonymous",
			value: row.longest_session || 0
		}))

		return json_response({ "ok": true, "type": "longest_session", "leaderboard": leaderboard }, 200)
	}

	if (leaderboard_type === "total_awards") {
		const query = "SELECT name, total_awards FROM users ORDER BY total_awards DESC"
		const result = await users_db.prepare(query).all()
		const rows = result && result.results ? result.results : result

		const leaderboard = (rows || []).map((row, index) => ({
			rank: index + 1,
			name: row.name || "Anonymous",
			value: row.total_awards || 0
		}))

		return json_response({ "ok": true, "type": "total_awards", "leaderboard": leaderboard }, 200)
	}

	return json_response({ "error": "invalid leaderboard type" }, 400)
}

/**
 * Handle sync request - update user's stats
 * Query params:
 *   - key: secret key (required)
 *   - tz: timezone offset in minutes (required, e.g., 0 for UK, -300 for EST, 780 for NZ)
 *   - total_steps: lifetime total steps
 *   - daily_steps: today's steps (maps to total_daily_steps)
 *   - weekly_steps: this week's steps (maps to total_weekly_steps)
 *   - daily_calories: today's calories (maps to total_daily_calories)
 *   - weekly_calories: this week's calories (maps to total_weekly_calories)
 *   - longest_session: longest session in minutes
 *   - total_awards: total awards count
 */
async function handle_sync(request_url, env) {

	const api_key = request_url.searchParams.get("key")

	if (!api_key) {
		return json_response({ "error": "missing key parameter" }, 400)
	}

	const users_db = env.DB

	if (!users_db) {
		return json_response({ "error": "database binding not found (env.DB)" }, 500)
	}

	// Get timezone offset from request (in minutes)
	const tz_param = request_url.searchParams.get("tz")

	if (tz_param === null) {
		return json_response({ "error": "missing tz (timezone offset) parameter" }, 400)
	}

	const timezone_offset = parseInt(tz_param, 10)

	if (isNaN(timezone_offset) || timezone_offset < -720 || timezone_offset > 840) {
		return json_response({ "error": "invalid tz value (must be between -720 and 840 minutes)" }, 400)
	}

	// Look up user by key
	const select_result = await users_db.prepare("SELECT id, daily_date, weekly_start_date FROM users WHERE key = ?").bind(api_key).all()
	const select_rows = select_result && select_result.results ? select_result.results : select_result

	if (!select_rows || select_rows.length === 0) {
		return json_response({ "error": "key not found" }, 404)
	}

	const user = select_rows[0]
	const user_id = user.id
	const stored_daily_date = user.daily_date || null
	const stored_weekly_start = user.weekly_start_date || null

	// Calculate user's local "today" and "week start" based on their timezone
	const user_local_today = get_local_today(timezone_offset)
	const user_local_week_start = get_local_week_start(timezone_offset)

	// Determine if daily/weekly need reset (new day/week for the user)
	const is_new_day = stored_daily_date !== user_local_today
	const is_new_week = stored_weekly_start !== user_local_week_start

	// Map API params to database columns
	const param_to_column = {
		"total_steps": "total_steps",
		"total_calories": "total_calories",
		"daily_steps": "total_daily_steps",
		"weekly_steps": "total_weekly_steps",
		"daily_calories": "total_daily_calories",
		"weekly_calories": "total_weekly_calories",
		"longest_session": "longest_session",
		"total_awards": "total_awards",
		"total_time": "total_time",
		"best_streak": "best_streak"
	}

	// Build dynamic update based on provided params
	const updates = []
	const values = []

	for (const [param, column] of Object.entries(param_to_column)) {
		const value = request_url.searchParams.get(param)

		if (value !== null) {
			const num_value = Number(value)

			if (!Number.isInteger(num_value) || num_value < 0 || num_value > 100000000) {
				return json_response({ "error": `invalid ${param} value` }, 400)
			}

			updates.push(`${column} = ?`)
			values.push(num_value)
		}
	}

	if (updates.length === 0) {
		return json_response({ "error": "no valid parameters provided" }, 400)
	}

	// Always update timezone_offset
	updates.push("timezone_offset = ?")
	values.push(timezone_offset)

	// Update daily_date if it's a new day
	if (is_new_day) {
		updates.push("daily_date = ?")
		values.push(user_local_today)
	}

	// Update weekly_start_date if it's a new week
	if (is_new_week) {
		updates.push("weekly_start_date = ?")
		values.push(user_local_week_start)
	}

	// Add user_id to values for WHERE clause
	values.push(user_id)

	const update_query = `UPDATE users SET ${updates.join(", ")}, last_synced_at = CURRENT_TIMESTAMP WHERE id = ?`
	await users_db.prepare(update_query).bind(...values).run()

	return json_response({
		"ok": true,
		"updated_fields": updates.length,
		"daily_date": user_local_today,
		"weekly_start_date": user_local_week_start,
		"new_day": is_new_day,
		"new_week": is_new_week
	}, 200)
}
