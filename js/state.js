/**
 * State - Centralized app state management
 */

import { get_date_string } from "./utils.js"

const State = {
	data: {
		settings: null,
		entries: [],
		awards: [],
		records: {}
	},

	// Track newly unlocked awards (not persisted, session only)
	new_awards: [],

	listeners: [],

	// Default settings
	default_settings: {
		height_cm: 175,
		weight_kg: 70,
		stride_length_cm: 75,
		daily_step_goal: 5000,
		calories_per_step_override: null,
		units: "imperial",
		calorie_method: "met",
		include_weekends: false,
		hide_completed_awards: false,
		dark_mode: "dark",
		secret_key: "",
		sync_endpoint: "",
		last_backup: Date.now(),
		last_backup_reminder: 0
	},

	// Default records
	default_records: {
		most_steps_day: 0,
		longest_session_minutes: 0,
		longest_distance_km: 0
	},

	init(stored_data) {

		// Merge stored settings with defaults to ensure new fields have values
		this.data.settings = { ...this.default_settings, ...(stored_data.settings || {}) }
		this.data.entries = stored_data.entries || []
		this.data.awards = stored_data.awards || []
		this.data.records = stored_data.records || { ...this.default_records }

		this.notify_listeners()
	},

	get(key) {
		return this.data[key]
	},

	get_settings() {
		return this.data.settings
	},

	get_entries() {
		return this.data.entries
	},

	get_entry_by_date(date_string) {
		return this.data.entries.find(e => e.date === date_string) || null
	},

	get_today_entry() {
		const today = get_date_string()

		return this.get_entry_by_date(today)
	},

	update_settings(new_settings) {
		this.data.settings = { ...this.data.settings, ...new_settings }
		this.notify_listeners()
	},

	add_entry(entry) {
		// Check if entry for this date exists
		const existing_index = this.data.entries.findIndex(e => e.date === entry.date)

		if (existing_index >= 0) {
			this.data.entries[existing_index] = entry
		} else {
			this.data.entries.push(entry)
		}

		// Sort entries by date descending
		this.data.entries.sort((a, b) => b.date.localeCompare(a.date))
		this.check_records(entry)
		this.notify_listeners()
	},

	update_entry(date, updates) {
		const entry = this.get_entry_by_date(date)

		if (entry) {
			Object.assign(entry, updates)
			this.check_records(entry)
			this.notify_listeners()
		}
	},

	delete_entry(date) {
		const index = this.data.entries.findIndex(e => e.date === date)

		if (index >= 0) {
			const deleted = this.data.entries.splice(index, 1)[0]
			this.notify_listeners()

			return deleted
		}

		return null
	},

	check_records(entry) {
		let updated = false

		if (entry.steps > this.data.records.most_steps_day) {
			this.data.records.most_steps_day = entry.steps
			updated = true
		}

		if (entry.time_minutes > this.data.records.longest_session_minutes) {
			this.data.records.longest_session_minutes = entry.time_minutes
			updated = true
		}

		if (entry.distance_km > this.data.records.longest_distance_km) {
			this.data.records.longest_distance_km = entry.distance_km
			updated = true
		}

		return updated
	},

	unlock_award(award_id, date) {
		const existing = this.data.awards.find(a => a.id === award_id)

		if (!existing) {
			this.data.awards.push({
				id: award_id,
				achieved: true,
				date: date,
				viewed: false
			})

			// Track as newly unlocked
			if (!this.new_awards.includes(award_id)) {
				this.new_awards.push(award_id)
			}

			this.notify_listeners()

			return true
		}

		return false
	},

	get_new_awards() {
		return this.new_awards
	},

	clear_new_awards() {
		this.new_awards = []
		this.notify_listeners()
	},

	mark_all_awards_viewed() {
		let updated = false

		this.data.awards.forEach(a => {
			if (a.achieved && !a.viewed) {
				a.viewed = true
				updated = true
			}
		})

		if (updated) {
			this.notify_listeners()
		}

		return updated
	},

	is_award_unlocked(award_id) {
		return this.data.awards.some(a => a.id === award_id && a.achieved)
	},

	subscribe(listener) {
		this.listeners.push(listener)

		return () => {
			this.listeners = this.listeners.filter(l => l !== listener)
		}
	},

	notify_listeners() {
		this.listeners.forEach(listener => listener(this.data))
	},

	get_all_data() {
		return { ...this.data }
	},

	reset() {
		this.data = {
			settings: { ...this.default_settings },
			entries: [],
			awards: [],
			records: { ...this.default_records }
		}
		this.notify_listeners()
	}
}

export default State
