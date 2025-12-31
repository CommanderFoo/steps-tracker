/**
 * Calculations - Distance, calories, and aggregation formulas
 */

import State from "./state.js"
import { get_date_string } from "./utils.js"

const Calculations = {
	/**
	 * Calculate distance in kilometers from steps
	 * @param {number} steps - Number of steps
	 * @param {number} stride_length_cm - Stride length in centimeters
	 * @returns {number} Distance in kilometers
	 */
	calculate_distance(steps, stride_length_cm) {
		if (!steps || !stride_length_cm) {
			return 0
		}

		return (steps * stride_length_cm) / 100000
	},

	/**
	 * Calculate distance in miles
	 * @param {number} distance_km - Distance in kilometers
	 * @returns {number} Distance in miles
	 */
	km_to_miles(distance_km) {
		return distance_km * 0.621371
	},

	/**
	 * Calculate calories burned
	 * @param {number} steps - Number of steps
	 * @param {number} weight_kg - Weight in kilograms
	 * @param {number} time_minutes - Duration in minutes
	 * @param {string} method - Calculation method: "simple" or "met"
	 * @param {number|null} override - Optional calories per step override
	 * @returns {number} Calories burned
	 */
	calculate_calories(steps, weight_kg, time_minutes, method = "simple", override = null) {
		if (!steps) {
			return 0
		}

		// Use override if provided
		if (override !== null && override > 0) {
			return Math.round(steps * override)
		}

		if (method === "met") {
			// MET-based calculation
			// Walking MET is approximately 3.5 for moderate pace
			const met = 3.5
			const time_hours = time_minutes / 60

			return Math.round(met * weight_kg * time_hours)
		}

		// Simple calculation: 0.04 calories per step
		return Math.round(steps * 0.04)
	},

	/**
	 * Estimate stride length from height
	 * @param {number} height_cm - Height in centimeters
	 * @returns {number} Estimated stride length in centimeters
	 */
	estimate_stride_length(height_cm) {
		// Average stride is about 42% of height
		return Math.round(height_cm * 0.42)
	},

	/**
	 * Calculate pace in minutes per kilometer
	 * @param {number} time_minutes - Duration in minutes
	 * @param {number} distance_km - Distance in kilometers
	 * @returns {number} Pace in minutes per kilometer
	 */
	calculate_pace(time_minutes, distance_km) {
		if (!distance_km || distance_km === 0) {
			return 0
		}

		return time_minutes / distance_km
	},

	/**
	 * Format pace as MM:SS
	 * @param {number} pace - Pace in minutes per kilometer
	 * @returns {string} Formatted pace
	 */
	format_pace(pace) {
		if (!pace || pace === 0) {
			return "--:--"
		}

		const minutes = Math.floor(pace)
		const seconds = Math.round((pace - minutes) * 60)

		return `${minutes}:${seconds.toString().padStart(2, "0")}`
	},

	/**
	 * Get entries for a date range
	 * @param {Array} entries - All entries
	 * @param {Date} start_date - Start date
	 * @param {Date} end_date - End date
	 * @returns {Array} Filtered entries
	 */
	get_entries_in_range(entries, start_date, end_date) {
		const start_str = get_date_string(start_date)
		const end_str = get_date_string(end_date)

		return entries.filter(e => e.date >= start_str && e.date <= end_str)
	},

	/**
	 * Calculate aggregate stats for a list of entries
	 * @param {Array} entries - List of entries
	 * @returns {Object} Aggregated statistics
	 */
	aggregate_entries(entries) {
		if (!entries || entries.length === 0) {
			return {
				total_steps: 0,
				total_distance_km: 0,
				total_calories: 0,
				total_time_minutes: 0,
				average_steps: 0,
				days_count: 0,
				best_day: null
			}
		}

		const total_steps = entries.reduce((sum, e) => sum + (e.steps || 0), 0)
		const total_distance_km = entries.reduce((sum, e) => sum + (e.distance_km || 0), 0)
		const total_calories = entries.reduce((sum, e) => sum + (e.calories || 0), 0)
		const total_time_minutes = entries.reduce((sum, e) => sum + (e.time_minutes || 0), 0)
		const best_day = entries.reduce((best, e) => (!best || e.steps > best.steps) ? e : best, null)

		return {
			total_steps,
			total_distance_km,
			total_calories,
			total_time_minutes,
			average_steps: Math.round(total_steps / entries.length),
			days_count: entries.length,
			best_day
		}
	},

	/**
	 * Get week start date (Monday) for a given date
	 * @param {Date} date - Input date
	 * @returns {Date} Monday of that week
	 */
	get_week_start(date) {
		const d = new Date(date)
		const day = d.getDay()
		const diff = d.getDate() - day + (day === 0 ? -6 : 1)

		d.setDate(diff)
		d.setHours(0, 0, 0, 0)

		return d
	},

	/**
	 * Get week end date (Sunday) for a given date
	 * @param {Date} date - Input date
	 * @returns {Date} Sunday of that week
	 */
	get_week_end(date) {
		const week_start = this.get_week_start(date)
		const week_end = new Date(week_start)

		week_end.setDate(week_start.getDate() + 6)

		return week_end
	},

	/**
	 * Calculate goal completion percentage
	 * @param {number} current - Current value
	 * @param {number} goal - Goal value
	 * @returns {number} Percentage (0-100)
	 */
	goal_percentage(current, goal) {
		if (!goal || goal === 0) {
			return 0
		}

		return Math.min(100, Math.round((current / goal) * 100))
	},

	/**
	 * Calculate current streak of goal completions
	 * @param {Array} entries - All entries sorted by date descending
	 * @param {number} goal - Daily step goal
	 * @returns {number} Current streak count
	 */
	calculate_streak(entries, goal, include_weekends = true) {
		if (!entries || entries.length === 0) {
			return 0
		}

		// Ensure goal is a number
		const target_goal = Number(goal) || 10000

		// Create a map for quick lookup with numeric values
		const entry_map = {}
		entries.forEach(e => {
			if (e.date) {
				entry_map[e.date] = Number(e.steps) || 0
			}
		})

		let streak = 0
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const today_str = get_date_string(today)
		let current_date = new Date(today)

		// Determine starting point:
		// If today's goal is met, we start counting from today.
		// If not, we check if yesterday's goal was met to keep a streak "alive" (grace period).
		const today_steps = entry_map[today_str] || 0

		if (today_steps < target_goal) {
			// Today not reached yet, so the active streak is what was achieved up to yesterday
			current_date.setDate(current_date.getDate() - 1)
		}

		// Backward loop to count consecutive completions
		for (let i = 0; i < 3650; i++) { // Max 10 years
			const date_str = get_date_string(current_date)
			const steps = entry_map[date_str] || 0
			const day_of_week = current_date.getDay()
			const is_weekend = day_of_week === 0 || day_of_week === 6

			if (steps >= target_goal) {
				streak++
			} else if (!include_weekends && is_weekend) {
				// Weekend ignore: it doesn't break the streak, but also doesn't add to it
				// We just keep the current streak count and move to the previous day
			} else {
				// Streak broken by a failed day or gap
				break
			}

			current_date.setDate(current_date.getDate() - 1)
		}

		return streak
	},

	/**
	 * Calculate best streak of goal completions
	 * @param {Array} entries - All entries
	 * @param {number} goal - Daily step goal
	 * @param {boolean} include_weekends - Whether to count weekends
	 * @returns {number} Best streak count
	 */
	calculate_best_streak(entries, goal, include_weekends = true) {
		if (!entries || entries.length === 0) {
			return 0
		}

		const target_goal = Number(goal) || 10000

		// Sort entries oldest to newest to find streaks
		const sorted_entries = [...entries].sort((a, b) => a.date.localeCompare(b.date))
		const entry_map = {}
		sorted_entries.forEach(e => {
			entry_map[e.date] = Number(e.steps) || 0
		})

		let max_streak = 0
		let current_streak = 0

		// Use a set of all dates recorded to find gaps
		const all_dates = sorted_entries.map(e => e.date)
		if (all_dates.length === 0) {
			return 0
		}

		const first_date = new Date(all_dates[0] + "T00:00:00")
		const last_date = new Date(all_dates[all_dates.length - 1] + "T00:00:00")

		const current = new Date(first_date)

		while (current <= last_date) {
			const date_str = get_date_string(current)
			const steps = entry_map[date_str] || 0
			const day_of_week = current.getDay()
			const is_weekend = day_of_week === 0 || day_of_week === 6

			if (steps >= target_goal) {
				current_streak++
				if (current_streak > max_streak) {
					max_streak = current_streak
				}
			} else if (!include_weekends && is_weekend) {
				// Don't reset streak on weekends if excluded
			} else {
				current_streak = 0
			}

			current.setDate(current.getDate() + 1)
		}

		return max_streak
	}
}

export default Calculations
