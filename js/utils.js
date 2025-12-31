/**
 * Utils - General purpose utility functions
 */

/**
 * Get local date string YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Date string
 */
export function get_date_string(date = new Date()) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}
