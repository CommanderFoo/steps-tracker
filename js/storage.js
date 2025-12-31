/**
 * Storage - localStorage persistence layer
 */

const STORAGE_KEYS = {
	SETTINGS: "steps.settings",
	ENTRIES: "steps.entries",
	AWARDS: "steps.awards",
	RECORDS: "steps.records"
}

const Storage = {
	load_all() {
		// Migration: check for legacy achievements key
		const legacy_awards = this.get("steps.achievements")

		if (legacy_awards) {
			this.set(STORAGE_KEYS.AWARDS, legacy_awards)
			localStorage.removeItem("steps.achievements")
		}

		return {
			settings: this.get(STORAGE_KEYS.SETTINGS),
			entries: this.get(STORAGE_KEYS.ENTRIES) || [],
			awards: this.get(STORAGE_KEYS.AWARDS) || [],
			records: this.get(STORAGE_KEYS.RECORDS)
		}
	},

	save_all(data) {
		this.set(STORAGE_KEYS.SETTINGS, data.settings)
		this.set(STORAGE_KEYS.ENTRIES, data.entries)
		this.set(STORAGE_KEYS.AWARDS, data.awards)
		this.set(STORAGE_KEYS.RECORDS, data.records)
	},

	get(key) {
		try {
			const item = localStorage.getItem(key)

			return item ? JSON.parse(item) : null
		} catch (error) {
			console.error(`Storage.get error for ${key}:`, error)

			return null
		}
	},

	set(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value))

			return true
		} catch (error) {
			// Handle quota exceeded
			if (error.name === "QuotaExceededError") {
				console.error("Storage quota exceeded")
				this.handle_quota_exceeded()
			} else {
				console.error(`Storage.set error for ${key}:`, error)
			}

			return false
		}
	},

	remove(key) {
		try {
			localStorage.removeItem(key)

			return true
		} catch (error) {
			console.error(`Storage.remove error for ${key}:`, error)

			return false
		}
	},

	clear_all() {
		Object.values(STORAGE_KEYS).forEach(key => {
			this.remove(key)
		})
	},

	handle_quota_exceeded() {
		// Try to free up space by removing oldest entries
		const entries = this.get(STORAGE_KEYS.ENTRIES) || []

		if (entries.length > 365) {
			// Keep only last year of entries
			const trimmed = entries.slice(0, 365)
			this.set(STORAGE_KEYS.ENTRIES, trimmed)
		}
	},

	export_json() {
		const data = this.load_all()

		return JSON.stringify(data, null, 2)
	},

	import_json(json_string) {
		try {
			const data = JSON.parse(json_string)

			// Validate structure
			if (!this.validate_import(data)) {
				throw new Error("Invalid data structure")
			}

			this.save_all(data)

			return { success: true, data }
		} catch (error) {
			console.error("Import error:", error)

			return { success: false, error: error.message }
		}
	},

	validate_import(data) {
		// Basic structure validation
		if (typeof data !== "object" || data === null) {
			return false
		}

		// Entries should be an array
		if (data.entries && !Array.isArray(data.entries)) {
			return false
		}

		// Awards should be an array
		if (data.awards && !Array.isArray(data.awards)) {
			return false
		}

		return true
	},

	get_storage_size() {
		let total = 0

		Object.values(STORAGE_KEYS).forEach(key => {
			const item = localStorage.getItem(key)

			if (item) {
				total += item.length * 2 // UTF-16 characters = 2 bytes each
			}
		})

		return total
	}
}

export default Storage
export { STORAGE_KEYS }
