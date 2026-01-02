/**
 * App - Main application entry point
 */

import Router from "./router.js"
import State from "./state.js"
import Storage from "./storage.js"
import Calculations from "./calculations.js"
import UI from "./ui.js"
import Charts from "./charts.js"
import Awards from "./awards.js"
import Export from "./export.js"
import Calendar_Picker from "./calendar.js"
import Sync from "./sync.js"
import { get_date_string } from "./utils.js"

/**
 * Trigger sync to leaderboard with all stats
 */
function trigger_sync() {

	const settings = State.get_settings()

	if (!settings.secret_key || !settings.sync_endpoint) {
		return
	}

	const entries = State.get_entries()
	const today = new Date()

	// Calculate all-time stats
	const all_stats = Calculations.aggregate_entries(entries)

	// Calculate today's stats
	const today_entry = State.get_today_entry()
	const daily_steps = today_entry?.steps || 0
	const daily_calories = today_entry?.calories || 0

	// Calculate this week's stats
	const week_start = Calculations.get_week_start(today)
	const week_end = Calculations.get_week_end(today)
	const week_entries = Calculations.get_entries_in_range(entries, week_start, week_end)
	const week_stats = Calculations.aggregate_entries(week_entries)

	// Build stats object to sync
	const sync_stats = {
		total_steps: all_stats.total_steps,
		daily_steps: daily_steps,
		weekly_steps: week_stats.total_steps,
		daily_calories: daily_calories,
		weekly_calories: week_stats.total_calories
	}

	Sync.sync_to_leaderboard(settings.sync_endpoint, settings.secret_key, sync_stats)
}

// Icons (Lucide-style SVG)
const Icons = {
	footprints: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>`,
	clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
	map_pin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
	flame: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
	plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
	x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
	calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
	bar_chart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
	settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
	trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
	download: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
	upload: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
	trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
	chevron_left: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
	chevron_right: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
	sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
	moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
	zap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
	info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
	eye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
	eye_off: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
}

// Store deleted entry for undo
let deleted_entry = null
let calendar_picker = null

/**
 * Initialize the application
 */
function init() {
	// Load stored data
	const stored_data = Storage.load_all()
	State.init(stored_data)

	// Subscribe to state changes to persist data
	State.subscribe((data) => {
		Storage.save_all(data)
	})

	// Retroactively check all entries for any missing awards
	retroactive_check_awards()

	// Initialize router
	Router.register("/", render_today_view)
	Router.register("/history", render_history_view)
	Router.register("/insights", render_insights_view)
	Router.register("/stats", render_stats_view)
	Router.register("/records", render_records_view)
	Router.register("/awards", render_awards_view)
	Router.register("/settings", render_settings_view)
	Router.init()

	// Setup event listeners
	setup_event_listeners()

	// Apply theme preference
	apply_theme()

	// Check for backup reminder
	check_backup_reminder()
}

/**
 * Check if a backup is due (every 7 days) and notify the user
 */
function check_backup_reminder() {
	const settings = State.get_settings()
	const last_backup = settings.last_backup || 0
	const last_remind = settings.last_backup_reminder || 0
	const now = Date.now()
	const days_diff = (now - last_backup) / (1000 * 60 * 60 * 24)
	const days_remind_diff = (now - last_remind) / (1000 * 60 * 60 * 24)

	// Show if backup due AND (never reminded OR reminded > 7 days ago)
	if (days_diff > 7 && (last_remind === 0 || days_remind_diff > 7)) {
		UI.show_toast("Weekly Reminder: Don't forget to export your data!", "warning", {
			text: "Backup",
			callback: () => {
				Router.navigate("/settings")
				setTimeout(() => {
					const el = document.getElementById("export-data-btn")
					if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
				}, 100)
			}
		}, 8000) // Longer duration to make sure they see it

		// Save that we showed the reminder
		State.update_settings({ last_backup_reminder: now })
	}
}

/**
 * Retroactively check all entries for awards that may not have been awarded
 * This ensures new awards added later apply to existing data
 */
function retroactive_check_awards() {
	const entries = State.get_entries()
	const settings = State.get_settings()

	// Check each entry against all awards
	entries.forEach(entry => {
		Awards.check_entry(entry, settings, (id, date) => State.unlock_award(id, date))
	})

	// Check streak awards
	const current_streak = Calculations.calculate_streak(entries, settings.daily_step_goal, settings.include_weekends)
	Awards.check_streak(current_streak, (id, date) => State.unlock_award(id, date))

	// Check cumulative awards
	const stats = Calculations.aggregate_entries(entries)
	Awards.check_cumulative(stats, (id, date) => State.unlock_award(id, date))

	// Update the badge after checking
	update_awards_badge()
}

/**
 * Update the awards badge with new award count
 */
function update_awards_badge() {
	const badge = document.getElementById("awards-badge")

	if (!badge) {
		return
	}

	const new_count = State.get_new_awards().length

	badge.textContent = new_count > 0 ? new_count : ""
}

/**
 * Setup global event listeners
 */
function setup_event_listeners() {
	// Navigation clicks
	document.querySelectorAll(".nav-item").forEach(item => {
		item.addEventListener("click", () => {
			const route = item.dataset.route

			Router.navigate(route)
		})
	})

	// FAB click - open entry modal
	const fab = document.getElementById("fab-add")

	if (fab) {
		fab.addEventListener("click", () => open_entry_modal())
	}

	// Modal close buttons
	document.querySelectorAll(".modal-close").forEach(btn => {
		btn.addEventListener("click", () => {
			const modal = btn.closest(".modal-overlay")

			if (modal) {
				UI.close_modal(modal.id)
			}
		})
	})

	// Close modal on overlay click
	document.querySelectorAll(".modal-overlay").forEach(overlay => {
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				UI.close_modal(overlay.id)
			}
		})
	})

	// Entry form submission
	const entry_form = document.getElementById("entry-form")

	if (entry_form) {
		entry_form.addEventListener("submit", handle_entry_submit)
	}

	// Settings form
	const settings_form = document.getElementById("settings-form")

	if (settings_form) {
		settings_form.addEventListener("submit", handle_settings_submit)
	}
}

/**
 * Open entry modal for adding/editing
 * @param {string|null} date - Date to edit, or null for new entry
 */
function open_entry_modal(date = null) {
	const modal_title = document.getElementById("entry-modal-title")
	const form = document.getElementById("entry-form")
	const delete_btn = document.getElementById("entry-delete-btn")
	const date_input = document.getElementById("entry-date")

	// Reset form
	form.reset()

	let initial_date = date

	if (date) {
		const entry = State.get_entry_by_date(date)

		if (entry) {
			modal_title.textContent = "Edit Entry"
			form.dataset.editDate = date
			date_input.value = entry.date
			document.getElementById("entry-steps").value = entry.steps
			document.getElementById("entry-time").value = entry.time_minutes || ""

			if (delete_btn) {
				delete_btn.classList.remove("hidden")
			}
		}
	} else {
		modal_title.textContent = "Add Entry"
		delete form.dataset.editDate

		const today = new Date()
		const d_year = today.getFullYear()
		const d_month = String(today.getMonth() + 1).padStart(2, "0")
		const d_day = String(today.getDate()).padStart(2, "0")
		initial_date = `${d_year}-${d_month}-${d_day}`

		date_input.value = initial_date

		if (delete_btn) {
			delete_btn.classList.add("hidden")
		}
	}

	// Initialize or update calendar picker
	if (!calendar_picker) {
		calendar_picker = new Calendar_Picker("calendar-picker-container", {
			initial_date: initial_date,
			on_change: (new_date) => {
				date_input.value = new_date
			}
		})
	} else {
		calendar_picker.set_date(initial_date)
	}

	UI.open_modal("entry-modal")
}

/**
 * Handle entry form submission
 * @param {Event} e - Submit event
 */
function handle_entry_submit(e) {
	e.preventDefault()

	const form = e.target
	const settings = State.get_settings()

	const date = document.getElementById("entry-date").value
	const steps = parseInt(document.getElementById("entry-steps").value) || 0
	const time_minutes = parseInt(document.getElementById("entry-time").value) || 0

	// Calculate derived values
	const distance_km = Calculations.calculate_distance(steps, settings.stride_length_cm)
	const calories = Calculations.calculate_calories(
		steps,
		settings.weight_kg,
		time_minutes,
		settings.calorie_method,
		settings.calories_per_step_override
	)

	const entry = {
		id: form.dataset.editDate ? State.get_entry_by_date(form.dataset.editDate)?.id : UI.generate_id(),
		date,
		steps,
		time_minutes,
		distance_km,
		calories,
	}

	// Check for new awards before adding
	const pre_count = State.get("awards").length

	State.add_entry(entry)

	// Check awards
	const newly_unlocked = Awards.check_entry(entry, settings, (id, date) => State.unlock_award(id, date))

	// Check streak
	const streak = Calculations.calculate_streak(State.get_entries(), settings.daily_step_goal, settings.include_weekends)
	Awards.check_streak(streak, (id, date) => State.unlock_award(id, date))

	// Check cumulative totals
	const stats = Calculations.aggregate_entries(State.get_entries())
	Awards.check_cumulative(stats, (id, date) => State.unlock_award(id, date))

	// Update the awards badge
	update_awards_badge()

	// Show award toast if new
	if (newly_unlocked.length > 0) {
		const award = Awards.get_by_id(newly_unlocked[0])

		if (award) {
			UI.show_toast(`🎉 Award Unlocked: ${award.title}!`, "success")
		}
	}

	UI.close_modal("entry-modal")
	UI.show_toast("Entry saved!", "success")

	// Sync to leaderboard
	trigger_sync()

	// Refresh current view
	Router.handle_route()
}

/**
 * Handle entry deletion
 */
function handle_entry_delete() {
	const form = document.getElementById("entry-form")
	const date = form.dataset.editDate

	if (!date) {
		return
	}

	deleted_entry = State.delete_entry(date)

	UI.close_modal("entry-modal")
	UI.show_toast("Entry deleted", "warning", {
		text: "Undo",
		callback: () => {
			if (deleted_entry) {
				State.add_entry(deleted_entry)
				deleted_entry = null
				trigger_sync()
				Router.handle_route()
				UI.show_toast("Entry restored!", "success")
			}
		}
	})

	// Sync to leaderboard after delete
	trigger_sync()

	Router.handle_route()
}

/**
 * Render Today view
 */
function render_today_view() {
	const container = document.getElementById("today-content")

	if (!container) {
		return
	}

	const settings = State.get_settings()
	const today_entry = State.get_today_entry()

	const steps = today_entry?.steps || 0
	const goal = settings.daily_step_goal
	const percentage = Calculations.goal_percentage(steps, goal)

	container.innerHTML = `
        <div class="section">
            <div id="progress-ring-container"></div>
            <p class="text-center text-secondary mt-md">
                ${percentage >= 100 ? "🎉 Goal achieved!" : `${UI.escapeHTML((goal - steps).toLocaleString())} steps to go`}
            </p>
        </div>

        <div class="stats-row section">
            <div class="stat-card" style="animation-delay: 0.1s;">
                <div class="stat-card-icon">${Icons.map_pin}</div>
                <div class="stat-card-value">${UI.format_distance(today_entry?.distance_km || 0, settings.units)}</div>
                <div class="stat-card-label">Distance</div>
            </div>
            <div class="stat-card" style="animation-delay: 0.2s;">
                <div class="stat-card-icon">${Icons.clock}</div>
                <div class="stat-card-value">${UI.format_duration(today_entry?.time_minutes || 0)}</div>
                <div class="stat-card-label">Active Time</div>
            </div>
            <div class="stat-card" style="animation-delay: 0.3s;">
                <div class="stat-card-icon">${Icons.flame}</div>
                <div class="stat-card-value">${today_entry?.calories || 0}</div>
                <div class="stat-card-label">Calories</div>
            </div>
            <div class="stat-card" style="animation-delay: 0.4s;">
                <div class="stat-card-icon">${Icons.zap}</div>
                <div class="stat-card-value">${UI.escapeHTML(String(Calculations.calculate_streak(State.get_entries(), goal, settings.include_weekends)))}</div>
                <div class="stat-card-label">Day Streak</div>
            </div>
        </div>

        ${today_entry ? `
            <div class="section">
                <button class="btn btn-secondary btn-block" onclick="window.App.open_entry_modal('${UI.escapeHTML(today_entry.date)}')">
                    Edit Today's Entry
                </button>
            </div>
        ` : ""}
    `

	// Render progress ring
	const ring_container = document.getElementById("progress-ring-container")

	if (ring_container) {
		const ring = UI.render_progress_ring(percentage, UI.format_number(steps), `of ${UI.format_number(goal)} steps`)
		ring_container.appendChild(ring)
	}
}

/**
 * Render History view
 */
function render_history_view(active_filter = "30d") {
	const container = document.getElementById("history-content")

	if (!container) {
		return
	}

	const entries = State.get_entries()
	const settings = State.get_settings()

	if (entries.length === 0) {
		container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${Icons.calendar}</div>
                <div class="empty-state-title">No entries yet</div>
                <div class="empty-state-desc">Tap the + button to add your first entry</div>
            </div>
        `

		return
	}

	// Filter entries
	let filtered_entries = [...entries]

	if (active_filter === "7d") {
		filtered_entries = entries.slice(0, 7)
	} else if (active_filter === "30d") {
		filtered_entries = entries.slice(0, 30)
	}

	// Render filter bar
	const filters = [
		{ id: "7d", label: "7 Days", icon: Icons.clock },
		{ id: "30d", label: "30 Days", icon: Icons.calendar },
		{ id: "all", label: "All Time", icon: Icons.bar_chart }
	]

	const filter_html = `
		<div class="filter-bar-container">
			<div class="filter-bar">
				<div class="filter-indicator"></div>
				${filters.map(f => `
					<button class="filter-btn ${active_filter === f.id ? "active" : ""}" data-filter="${f.id}">
						<span class="filter-btn-icon">${f.icon}</span>
						<span class="filter-btn-label">${f.label}</span>
					</button>
				`).join("")}
			</div>
		</div>
	`

	// Helper to render entry item
	const render_entry = (entry) => `
        <div class="list-item" onclick="window.App.open_entry_modal('${UI.escapeHTML(entry.date)}')">
            <div class="list-item-icon">${Icons.footprints}</div>
            <div class="list-item-content">
                <div class="list-item-title">${UI.escapeHTML(UI.format_date(entry.date, "relative"))}</div>
                <div class="list-item-subtitle">
                    ${UI.escapeHTML(UI.format_distance(entry.distance_km, settings.units))} • ${UI.escapeHTML(UI.format_duration(entry.time_minutes))}
                </div>
            </div>
            <div class="list-item-value">
                ${UI.escapeHTML(UI.format_number(entry.steps))}
                ${entry.steps >= settings.daily_step_goal ? "✓" : ""}
            </div>
        </div>
    `

	let content_html = ""

	if (active_filter === "all") {
		// Group by month
		const groups = {}

		filtered_entries.forEach(entry => {
			const date = new Date(entry.date + "T00:00:00")
			const month_year = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

			if (!groups[month_year]) {
				groups[month_year] = []
			}

			groups[month_year].push(entry)
		})

		Object.keys(groups).forEach(month_year => {
			content_html += `
				<div class="history-group">
					<div class="history-group-header">${UI.escapeHTML(month_year)}</div>
					${groups[month_year].map(render_entry).join("")}
				</div>
			`
		})
	} else {
		content_html = `
            <div class="section">
                ${filtered_entries.map(render_entry).join("")}
            </div>
        `
	}

	container.innerHTML = `
		${filter_html}
		<div class="history-list">
			${content_html}
		</div>
	`

	// Add filter listeners
	container.querySelectorAll(".filter-btn").forEach(btn => {
		btn.addEventListener("click", () => {
			const filter = btn.getAttribute("data-filter")
			render_history_view(filter)
		})
	})
}

/**
 * Render Stats view
 */
function render_stats_view() {
	const container = document.getElementById("stats-content")

	if (!container) {
		return
	}

	const entries = State.get_entries()
	const settings = State.get_settings()

	// Get this week's entries
	const today = new Date()
	const week_start = Calculations.get_week_start(today)
	const week_end = Calculations.get_week_end(today)
	const week_entries = Calculations.get_entries_in_range(entries, week_start, week_end)
	const week_stats = Calculations.aggregate_entries(week_entries)


	container.innerHTML = `
        <div class="section">
            <h3 class="section-title">This Week</h3>
            <div class="stats-row">
                <div class="stat-card primary">
                    <div class="stat-card-value">${UI.escapeHTML(UI.format_number(week_stats.total_steps))}</div>
                    <div class="stat-card-label">Total Steps</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-card-value">${UI.escapeHTML(week_stats.average_steps.toLocaleString())}</div>
                    <div class="stat-card-label">Daily Average</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3 class="section-title">Weekly Chart</h3>
            <div class="chart-container">
                <canvas id="weekly-chart" class="chart-canvas"></canvas>
            </div>
        </div>

        <div class="section">
            <button class="btn btn-secondary btn-block" id="export-week-btn">
                ${Icons.download} Export Week Summary
            </button>
        </div>
    `

	// Render weekly chart
	Charts.render_weekly_chart("weekly-chart", week_entries, settings.daily_step_goal)

	// Export button
	document.getElementById("export-week-btn")?.addEventListener("click", () => {
		const week_label = `${UI.format_date(get_date_string(week_start))} - ${UI.format_date(get_date_string(week_end))}`
		Export.export_weekly_summary(week_stats, week_label, settings.units)
	})
}

// Track current insights range
let insights_range = "30"

/**
 * Render Insights view
 */
function render_insights_view() {
	const container = document.getElementById("insights-content")

	if (!container) {
		return
	}

	const entries = State.get_entries()
	const settings = State.get_settings()
	const today = new Date()

	// Get date range based on selection
	const days_map = { "7": 7, "30": 30, "90": 90 }
	const days = days_map[insights_range] || 30
	const start_date = new Date(today)
	start_date.setDate(start_date.getDate() - days)

	// Get previous period for comparison
	const prev_start = new Date(start_date)
	prev_start.setDate(prev_start.getDate() - days)

	const current_entries = Calculations.get_entries_in_range(entries, start_date, today)
	const prev_entries = Calculations.get_entries_in_range(entries, prev_start, start_date)

	const current_stats = Calculations.aggregate_entries(current_entries)
	const prev_stats = Calculations.aggregate_entries(prev_entries)

	// Calculate metrics
	const goal = settings.daily_step_goal
	const days_tracked = current_entries.length
	const days_goal_met = current_entries.filter(e => e.steps >= goal).length
	const goal_rate = days_tracked > 0 ? Math.round((days_goal_met / days_tracked) * 100) : 0
	const current_streak = Calculations.calculate_streak(entries, goal, settings.include_weekends)

	// Calculate % change
	const calc_change = (current, prev) => {
		if (prev === 0) {
			return current > 0 ? 100 : 0
		}

		return Math.round(((current - prev) / prev) * 100)
	}

	const steps_change = calc_change(current_stats.average_steps, prev_stats.average_steps)
	const distance_change = calc_change(current_stats.total_distance_km, prev_stats.total_distance_km)
	const calories_change = calc_change(current_stats.total_calories, prev_stats.total_calories)

	// Find best/worst weekday
	const weekday_totals = [0, 0, 0, 0, 0, 0, 0]
	const weekday_counts = [0, 0, 0, 0, 0, 0, 0]

	current_entries.forEach(entry => {
		const date = new Date(entry.date + "T00:00:00")
		const day = date.getDay()
		weekday_totals[day] += entry.steps
		weekday_counts[day]++
	})

	const weekday_averages = weekday_totals.map((total, i) =>
		weekday_counts[i] > 0 ? Math.round(total / weekday_counts[i]) : 0
	)

	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	const non_zero_averages = weekday_averages.filter(a => a > 0)
	const best_day_idx = weekday_averages.indexOf(Math.max(...weekday_averages))
	const worst_day_idx = non_zero_averages.length > 0
		? weekday_averages.indexOf(Math.min(...non_zero_averages))
		: -1
	const best_weekday = best_day_idx >= 0 && weekday_counts[best_day_idx] > 0 ? weekdays[best_day_idx] : "N/A"
	const worst_weekday = worst_day_idx >= 0 && weekday_counts[worst_day_idx] > 0 ? weekdays[worst_day_idx] : "N/A"

	// Change indicator helper
	const change_indicator = (val) => {
		if (val > 0) return `<span style="color: var(--color-accent);">↑ ${val}%</span>`
		if (val < 0) return `<span style="color: var(--color-danger);">↓ ${Math.abs(val)}%</span>`
		return `<span style="color: var(--color-text-muted);">—</span>`
	}

	container.innerHTML = `
		<div class="section">
			<div class="card" style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
				<button class="btn ${insights_range === '7' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-range="7">7 days</button>
				<button class="btn ${insights_range === '30' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-range="30">30 days</button>
				<button class="btn ${insights_range === '90' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-range="90">90 days</button>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Key Metrics</h3>
			<div class="stats-row">
				<div class="stat-card">
					<div class="stat-card-value">${UI.escapeHTML(UI.format_number(current_stats.average_steps))}</div>
					<div class="stat-card-label">Avg Steps/Day</div>
					<div style="font-size: var(--font-size-sm); margin-top: var(--space-xs);">${change_indicator(steps_change)}</div>
				</div>
				<div class="stat-card">
					<div class="stat-card-value">${UI.escapeHTML(String(goal_rate))}%</div>
					<div class="stat-card-label">Goal Hit Rate</div>
					<div style="font-size: var(--font-size-sm); margin-top: var(--space-xs);">${UI.escapeHTML(String(days_goal_met))}/${UI.escapeHTML(String(days_tracked))} days</div>
				</div>
			</div>
			<div class="stats-row mt-md">
				<div class="stat-card">
					<div class="stat-card-value">${UI.escapeHTML(UI.format_distance(current_stats.total_distance_km, settings.units).split(" ")[0])}</div>
					<div class="stat-card-label">Total ${settings.units === "imperial" ? "mi" : "km"}</div>
					<div style="font-size: var(--font-size-sm); margin-top: var(--space-xs);">${change_indicator(distance_change)}</div>
				</div>
				<div class="stat-card">
					<div class="stat-card-value">${UI.escapeHTML(String(current_streak))}</div>
					<div class="stat-card-label">Current Streak</div>
					<div style="font-size: var(--font-size-sm); margin-top: var(--space-xs);">days</div>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Steps Trend</h3>
			<div class="chart-container">
				<canvas id="insights-chart" class="chart-canvas"></canvas>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Behavioral Insights</h3>
			<div class="card">
				<div class="list-item" style="margin-bottom: var(--space-sm);">
					<div class="list-item-icon">${Icons.sun}</div>
					<div class="list-item-content">
						<div class="list-item-title">Best Day</div>
						<div class="list-item-subtitle">Highest average steps</div>
					</div>
					<div class="list-item-value">${UI.escapeHTML(best_weekday)}</div>
				</div>
				<div class="list-item" style="margin-bottom: var(--space-sm);">
					<div class="list-item-icon">${Icons.moon}</div>
					<div class="list-item-content">
						<div class="list-item-title">Slowest Day</div>
						<div class="list-item-subtitle">Lowest average steps</div>
					</div>
					<div class="list-item-value">${UI.escapeHTML(worst_weekday)}</div>
				</div>
				<div class="list-item">
					<div class="list-item-icon">${Icons.clock}</div>
					<div class="list-item-content">
						<div class="list-item-title">Avg Active Time</div>
						<div class="list-item-subtitle">Per day</div>
					</div>
					<div class="list-item-value">${UI.escapeHTML(UI.format_duration(days_tracked > 0 ? Math.round(current_stats.total_time_minutes / days_tracked) : 0))}</div>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Period Comparison</h3>
			<div class="card">
				<p style="color: var(--color-text-secondary); margin-bottom: var(--space-md);">
					Comparing last ${days} days vs previous ${days} days
				</p>
				<div class="list-item" style="margin-bottom: var(--space-sm);">
					<div class="list-item-content">
						<div class="list-item-title">Total Steps</div>
					</div>
					<div class="list-item-value">
						${UI.format_number(current_stats.total_steps)} vs ${UI.format_number(prev_stats.total_steps)}
					</div>
				</div>
				<div class="list-item" style="margin-bottom: var(--space-sm);">
					<div class="list-item-content">
						<div class="list-item-title">Total Distance</div>
					</div>
					<div class="list-item-value">
					${UI.escapeHTML(UI.format_distance(current_stats.total_distance_km, settings.units))} vs ${UI.escapeHTML(UI.format_distance(prev_stats.total_distance_km, settings.units))}
					</div>
				</div>
				<div class="list-item">
					<div class="list-item-content">
						<div class="list-item-title">Total Calories</div>
					</div>
					<div class="list-item-value">
						${UI.format_number(current_stats.total_calories)} vs ${UI.format_number(prev_stats.total_calories)}
					</div>
				</div>
			</div>
		</div>
	`

	// Range button listeners
	container.querySelectorAll("[data-range]").forEach(btn => {
		btn.addEventListener("click", () => {
			insights_range = btn.dataset.range
			render_insights_view()
		})
	})

	// Render trend chart (reversed for chronological order)
	const chart_labels = current_entries.map(e => UI.format_date(e.date, "short")).reverse()
	const chart_data = current_entries.map(e => e.steps).reverse()

	Charts.render_line_chart("insights-chart", chart_labels, chart_data)
}

/**
 * Render Records view
 */
function render_records_view() {
	const container = document.getElementById("records-content")

	if (!container) {
		return
	}

	const entries = State.get_entries()
	const settings = State.get_settings()
	const records = State.get("records")
	const awards = State.get("awards")
	const award_count = Awards.get_count(awards)

	// Calculate lifetime totals
	const lifetime_stats = Calculations.aggregate_entries(entries)

	// Calculate streaks
	const current_streak = Calculations.calculate_streak(entries, settings.daily_step_goal, settings.include_weekends)
	const best_streak = Calculations.calculate_best_streak(entries, settings.daily_step_goal, settings.include_weekends)

	// Calculate days with goal met
	const days_goal_met = entries.filter(e => e.steps >= settings.daily_step_goal).length
	const total_days = entries.length
	const goal_rate = total_days > 0 ? Math.round((days_goal_met / total_days) * 100) : 0

	// Find best weekday
	const weekday_totals = [0, 0, 0, 0, 0, 0, 0]
	const weekday_counts = [0, 0, 0, 0, 0, 0, 0]

	entries.forEach(entry => {
		const date = new Date(entry.date + "T00:00:00")
		const day = date.getDay()
		weekday_totals[day] += entry.steps
		weekday_counts[day]++
	})

	const weekday_averages = weekday_totals.map((total, i) =>
		weekday_counts[i] > 0 ? Math.round(total / weekday_counts[i]) : 0
	)
	const best_weekday_index = weekday_averages.indexOf(Math.max(...weekday_averages))
	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	const best_weekday = weekdays[best_weekday_index]

	container.innerHTML = `
        <div class="section">
            <h3 class="section-title">Personal Bests</h3>
            <div class="card">
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.trophy}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Most Steps (Day)</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(UI.format_number(records.most_steps_day))}</div>
                </div>
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.clock}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Longest Session</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(UI.format_duration(records.longest_session_minutes))}</div>
                </div>
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.map_pin}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Longest Distance</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(UI.format_distance(records.longest_distance_km, settings.units))}</div>
                </div>
                <div class="list-item">
                    <div class="list-item-icon">${Icons.zap}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Best Streak</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(String(best_streak))} days</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3 class="section-title">Lifetime Stats</h3>
            <div class="stats-row">
                <div class="stat-card primary">
                    <div class="stat-card-value">${UI.escapeHTML(UI.format_number(lifetime_stats.total_steps))}</div>
                    <div class="stat-card-label">Total Steps</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-card-value">${UI.escapeHTML(UI.format_distance(lifetime_stats.total_distance_km, settings.units).split(" ")[0])}</div>
                    <div class="stat-card-label">Total ${settings.units === "imperial" ? "mi" : "km"}</div>
                </div>
            </div>
            <div class="stats-row mt-md">
                <div class="stat-card">
                    <div class="stat-card-value">${UI.escapeHTML(UI.format_number(lifetime_stats.total_calories))}</div>
                    <div class="stat-card-label">Calories Burned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${UI.escapeHTML(UI.format_duration(lifetime_stats.total_time_minutes))}</div>
                    <div class="stat-card-label">Active Time</div>
                </div>
            </div>
            <div class="mt-md">
                <button class="btn btn-secondary btn-block" id="share-banner-btn">
                    ${Icons.download} Share Stats Banner (PNG)
                </button>
            </div>
        </div>

        <div class="section">
            <h3 class="section-title">Insights</h3>
            <div class="card">
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.calendar}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Days Tracked</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(String(total_days))}</div>
                </div>
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.footprints}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Goal Completion Rate</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(String(goal_rate))}%</div>
                </div>
                <div class="list-item" style="margin-bottom: var(--space-sm);">
                    <div class="list-item-icon">${Icons.bar_chart}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Daily Average</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(UI.format_number(lifetime_stats.average_steps))}</div>
                </div>
                <div class="list-item">
                    <div class="list-item-icon">${Icons.sun}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Best Weekday</div>
                    </div>
                    <div class="list-item-value">${UI.escapeHTML(best_weekday)}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3 class="section-title">Awards</h3>
            <div class="list-item" onclick="window.location.hash='/awards'" style="cursor: pointer;">
                <div class="list-item-icon">${Icons.trophy}</div>
                <div class="list-item-content">
                    <div class="list-item-title">View All Awards</div>
                    <div class="list-item-subtitle">${award_count.unlocked} of ${award_count.total} unlocked</div>
                </div>
                <div class="list-item-value">${Icons.chevron_right}</div>
            </div>
        </div>
    `

	// Handle share banner button
	document.getElementById("share-banner-btn")?.addEventListener("click", () => {
		const award_count = Awards.get_count(awards)
		Export.export_share_banner(lifetime_stats, settings.units, award_count)
	})
}

/**
 * Load and render leaderboard data
 * @param {string} endpoint - Sync endpoint URL
 * @param {string} type - Leaderboard type (default: total_steps)
 */
async function load_leaderboard(endpoint, type = "total_steps") {

	const container = document.getElementById("leaderboard-container")

	if (!container) {
		return
	}

	if (!endpoint) {
		container.innerHTML = `
			<div style="text-align: center; padding: var(--space-md); color: var(--color-text-muted);">
				Configure sync endpoint in Settings to view leaderboard
			</div>
		`
		return
	}

	// Show loading state
	container.innerHTML = `
		<div style="text-align: center; padding: var(--space-lg); color: var(--color-text-muted);">
			Loading...
		</div>
	`

	const result = await Sync.fetch_leaderboard(endpoint, type)

	if (!result || !result.leaderboard || result.leaderboard.length === 0) {
		container.innerHTML = `
			<div style="text-align: center; padding: var(--space-md); color: var(--color-text-muted);">
				No leaderboard data available
			</div>
		`
		return
	}

	// Determine unit suffix based on type
	const is_calories = type.includes("calories")
	const unit_suffix = is_calories ? " cal" : ""

	// Render leaderboard rows
	const rows_html = result.leaderboard.map(entry => {

		const rank_style = entry.rank === 1 ? "color: #fbbf24;" :
			entry.rank === 2 ? "color: #9ca3af;" :
				entry.rank === 3 ? "color: #cd7f32;" : ""

		const rank_emoji = entry.rank === 1 ? "🥇" :
			entry.rank === 2 ? "🥈" :
				entry.rank === 3 ? "🥉" : `#${entry.rank}`

		return `
			<div class="list-item" style="margin-bottom: var(--space-sm);">
				<div class="list-item-icon" style="font-weight: 700; font-size: 1.1em; min-width: 40px; ${rank_style}">
					${rank_emoji}
				</div>
				<div class="list-item-content">
					<div class="list-item-title">${UI.escapeHTML(entry.name)}</div>
				</div>
				<div class="list-item-value">${UI.format_number(entry.value)}${unit_suffix}</div>
			</div>
		`
	}).join("")

	container.innerHTML = rows_html
}

/**
 * Render Awards view
 */
function render_awards_view() {
	const container = document.getElementById("awards-content")

	if (!container) {
		return
	}

	const awards = State.get("awards")
	const settings = State.get_settings()
	const entries = State.get_entries()
	const stats = Calculations.aggregate_entries(entries)
	const award_count = Awards.get_count(awards)
	const all_awards = Awards.get_all_with_status(awards, stats)

	// Group by difficulty
	const difficulties = ["beginner", "easy", "medium", "hard", "expert"]
	const difficulty_labels = {
		beginner: { name: "Beginner", emoji: "🌱", color: "var(--color-accent)" },
		easy: { name: "Easy", emoji: "⭐", color: "#22c55e" },
		medium: { name: "Medium", emoji: "🔥", color: "#f59e0b" },
		hard: { name: "Hard", emoji: "💪", color: "#ef4444" },
		expert: { name: "Expert", emoji: "👑", color: "#8b5cf6" }
	}

	const grouped = {}

	difficulties.forEach(d => {
		grouped[d] = all_awards.filter(a => a.difficulty === d)
	})

	// Format text with proper units
	const format_units = (text) => {
		if (settings.units === "imperial") {
			// Convert km mentions to miles
			return text
				.replace(/([\d,]+\.?\d*)\s*Kilometers?/g, (match, num) => {
					const clean_num = parseFloat(num.replace(/,/g, ""))
					const miles = (clean_num * 0.621371).toFixed(1)

					return `${UI.format_number(miles)} Miles`
				})
				.replace(/([\d,]+\.?\d*)\s*kilometers?/g, (match, num) => {
					const clean_num = parseFloat(num.replace(/,/g, ""))
					const miles = (clean_num * 0.621371).toFixed(1)

					return `${UI.format_number(miles)} miles`
				})
				.replace(/(\d+\.?\d*)\s*km\/h/gi, (match, num) => {
					const mph = (parseFloat(num) * 0.621371).toFixed(1)

					return `${mph} mph`
				})
				.replace(/(\d+\.?\d*)\s*km/gi, (match, num) => {
					const miles = (parseFloat(num) * 0.621371).toFixed(1)

					return `${UI.format_number(miles)} mi`
				})
				// Title specific replacements
				.replace("First Kilometer", "First Mile")
				.replace("5K Cumulative", "3.1 Mile Cumulative")
				.replace("10K Club", "6.2 Mile Club")
				.replace("50K Trekker", "31 Mile Trekker")
				.replace("Cross-Country Casual", "Cross-Country (155 mi)")
				.replace("Road Warrior", "Road Warrior (310 mi)")
				.replace("Grand Tour", "Grand Tour (621 mi)")
				.replace("Half Marathon", "Half Marathon (13.1 mi)")
				.replace("Marathon", "Marathon (26.2 mi)")
		}

		return text
	}

	// Get new awards to highlight
	const new_award_ids = State.get_new_awards()

	// Render badge helper
	const render_badge = (a) => {
		const is_new = new_award_ids.includes(a.id)

		return `
		<div class="award-badge ${a.achieved ? "" : "locked"} ${is_new ? "new" : ""}" data-tooltip="${UI.escapeHTML(format_units(a.description))}" tabindex="0">
			<div class="award-icon-container" ${!a.achieved && a.progress !== null ? `style="--progress: ${Math.round(a.progress * 100)}"` : ""}>
				${!a.achieved && a.progress !== null ? `<div class="award-radial-progress"></div>` : ""}
				<div class="award-badge-icon">${a.icon}</div>
				${!a.achieved && a.progress !== null ? `<div class="award-progress-text">${Math.round(a.progress * 100)}%</div>` : ""}
			</div>
			<div class="award-badge-title">${UI.escapeHTML(format_units(a.title))}</div>
			${a.achieved ? `<div class="award-badge-date">${is_new ? "NEW!" : "✓"}</div>` : ""}
		</div>
	`
	}

	const render_section = (diff) => {
		const items = grouped[diff]
		const unlocked = items.filter(a => a.achieved).length
		const total = items.length
		const percent = Math.round((unlocked / total) * 100) || 0
		const label = difficulty_labels[diff]

		return `
			<div class="section">
				<div class="section-title" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: 8px;">
					<span>${UI.escapeHTML(label.emoji)}</span>
					<span style="color: ${UI.escapeHTML(label.color)};">${UI.escapeHTML(label.name)}</span>
					<span style="margin-left: auto; font-size: var(--font-size-sm); color: var(--color-text-muted);">
						${UI.escapeHTML(String(unlocked))}/${UI.escapeHTML(String(total))}
					</span>
				</div>
				<div style="background: var(--color-bg-tertiary); height: 6px; border-radius: 3px; margin-bottom: var(--space-md); overflow: hidden;">
					<div style="background: ${UI.escapeHTML(label.color)}; width: ${percent}%; height: 100%; border-radius: 3px; transition: width 0.5s ease;"></div>
				</div>
				<div class="card award-grid">
					${items.map(render_badge).join("")}
				</div>
			</div>
		`
	}

	const global_percent = Math.round((award_count.unlocked / award_count.total) * 100) || 0

	// Initial render with loading state for leaderboard
	container.innerHTML = `
		<div class="section" id="leaderboard-section">
			<div class="section-title" style="display: flex; align-items: center; gap: var(--space-sm);">
				<span>🏅</span> Leaderboard
			</div>
			<div class="card" style="display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-bottom: var(--space-sm);" id="leaderboard-tabs">
				<button class="btn btn-primary btn-sm" data-type="total_steps">Total Steps</button>
				<button class="btn btn-secondary btn-sm" data-type="daily_steps">Daily Steps</button>
				<button class="btn btn-secondary btn-sm" data-type="weekly_steps">Weekly Steps</button>
				<button class="btn btn-secondary btn-sm" data-type="daily_calories">Daily Cal</button>
				<button class="btn btn-secondary btn-sm" data-type="weekly_calories">Weekly Cal</button>
			</div>
			<div class="card" id="leaderboard-container">
				<div style="text-align: center; padding: var(--space-lg); color: var(--color-text-muted);">
					Loading leaderboard...
				</div>
			</div>
		</div>

		<div class="section">
			<div class="card" style="margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%); color: white; padding: 20px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
					<div style="font-weight: 700; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
						<span>🏆</span> Global Progress
					</div>
					<div style="font-weight: 800; font-size: 1.5em; letter-spacing: -0.02em;">${global_percent}%</div>
				</div>
				<div style="background: rgba(0,0,0,0.2); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
					<div style="background: white; width: ${global_percent}%; height: 100%; border-radius: 5px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(255,255,255,0.5);"></div>
				</div>
				<div style="font-size: 13px; opacity: 0.9; font-weight: 500; display: flex; justify-content: space-between;">
					<span>${award_count.unlocked} of ${award_count.total} awards unlocked</span>
					<span>${award_count.total - award_count.unlocked} to go!</span>
				</div>
			</div>
		</div>

		${difficulties.map(render_section).join("")}

		<p class="text-center text-muted" style="font-size: var(--font-size-xs); margin-top: var(--space-lg); opacity: 0.7;">
			Tap or hover on an award to see its description and requirements.
		</p>
	`

	// Fetch and render leaderboard if endpoint is configured
	load_leaderboard(settings.sync_endpoint, "total_steps")

	// Add tab click handlers
	const tabs_container = document.getElementById("leaderboard-tabs")

	tabs_container?.addEventListener("click", (e) => {

		const btn = e.target.closest("button[data-type]")

		if (!btn) {
			return
		}

		const type = btn.dataset.type

		// Update active tab styling
		tabs_container.querySelectorAll("button").forEach(b => {
			b.className = b === btn ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"
		})

		// Load the selected leaderboard
		load_leaderboard(settings.sync_endpoint, type)
	})

	// Auto-clear new awards after viewing the page
	if (new_award_ids.length > 0) {
		// Small delay so user can see the "NEW" labels before they clear
		setTimeout(() => {
			State.clear_new_awards()
			update_awards_badge()
		}, 500)
	}
}

/**
 * Render Settings view
 */
function render_settings_view() {
	const container = document.getElementById("settings-content")

	if (!container) {
		return
	}

	const settings = State.get_settings()

	container.innerHTML = `
		<form id="settings-form">
            <div class="section">
                <h3 class="section-title">Personal</h3>
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">Height (cm)</label>
                        <input type="number" class="form-input" id="setting-height" value="${UI.escapeHTML(String(settings.height_cm))}" min="100" max="250">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Weight (kg)</label>
                        <input type="number" class="form-input" id="setting-weight" value="${UI.escapeHTML(String(settings.weight_kg))}" min="30" max="300">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stride Length (cm)</label>
                        <div style="display: flex; gap: var(--space-sm);">
                            <input type="number" class="form-input" id="setting-stride" value="${UI.escapeHTML(String(settings.stride_length_cm))}" min="30" max="150" style="flex: 1;">
                            <button type="button" class="btn btn-secondary" id="calc-stride-btn" title="Calculate from height">Calculate</button>
                        </div>
                        <p class="form-hint">Typically about 42% of your height. Click Calculate to estimate from your height.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Goals</h3>
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">Daily Step Goal</label>
                        <input type="number" class="form-input" id="setting-goal" value="${UI.escapeHTML(String(settings.daily_step_goal))}" min="1000" max="100000" step="1000">
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Preferences</h3>
                <div class="card">
                    <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin: 0;">Units</label>
                        <select class="form-input" style="width: auto;" id="setting-units">
                            <option value="metric" ${settings.units === "metric" ? "selected" : ""}>Metric (km)</option>
                            <option value="imperial" ${settings.units === "imperial" ? "selected" : ""}>Imperial (mi)</option>
                        </select>
                    </div>
                    <div class="divider"></div>
                    <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin: 0;">Theme</label>
                        <select class="form-input" style="width: auto;" id="setting-theme">
                            <option value="system" ${settings.dark_mode === "system" ? "selected" : ""}>System</option>
                            <option value="light" ${settings.dark_mode === "light" ? "selected" : ""}>Light</option>
                            <option value="dark" ${settings.dark_mode === "dark" ? "selected" : ""}>Dark</option>
                        </select>
                    </div>
                    <div class="divider"></div>
                    <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin: 0;">Calorie Calculation</label>
                        <select class="form-input" style="width: auto;" id="setting-calorie-method">
                            <option value="simple" ${settings.calorie_method === "simple" ? "selected" : ""}>Simple (0.04/step)</option>
                            <option value="met" ${settings.calorie_method === "met" ? "selected" : ""}>MET-based</option>
                        </select>
                    </div>
                    <div class="divider"></div>
                    <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin: 0; display: flex; align-items: center;">
                            Include Weekends in Streaks
                            <span class="info-icon" data-tooltip="When disabled, Saturday and Sunday will not break your streak if goals are missed. Useful for desk-walking routines!">
                                ${Icons.info}
                            </span>
                        </label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="setting-include-weekends" ${settings.include_weekends ? "checked" : ""}>
                            <span class="slider"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">
                    Sync
                    <span class="info-icon" data-tooltip="Configure sync to send your step totals to a leaderboard server.">
                        ${Icons.info}
                    </span>
                </h3>
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">Sync Endpoint URL</label>
                        <input type="url" class="form-input" id="setting-sync-endpoint"
                            value="${UI.escapeHTML(settings.sync_endpoint || '')}"
                            placeholder="https://example.com/api"
                            autocomplete="off">
                        <p class="form-hint">The URL to send your step data to.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Personal Secret Key</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input" id="setting-secret-key"
                                value="${UI.escapeHTML(settings.secret_key || '')}"
                                placeholder="Enter your secret key"
                                autocomplete="off">
                            <button type="button" class="password-toggle-btn" id="toggle-secret-key" aria-label="Toggle visibility">
                                ${Icons.eye}
                            </button>
                        </div>
                        <p class="form-hint">This key uniquely identifies you. Keep it private.</p>
                    </div>

                    <button type="button" class="btn btn-ghost btn-sm" id="clear-sync-settings" style="margin-top: calc(-1 * var(--space-sm));">
                        ${Icons.trash} Clear Sync Settings
                    </button>
                </div>
            </div>

            <div class="section">
                <button type="submit" class="btn btn-primary btn-block">Save Settings</button>
            </div>
        </form>

		<div class="section">
			<h3 class="section-title">Data</h3>
			<div class="stack">
				<button class="btn btn-secondary btn-block" id="export-data-btn">
					${Icons.download} Export Data (JSON)
				</button>
				<button class="btn btn-secondary btn-block" id="import-data-btn">
					${Icons.upload} Import Data
				</button>
				<button class="btn btn-danger btn-block" id="reset-data-btn">
					${Icons.trash} Reset All Data
				</button>
			</div>
			</div>
		</div>

		<div style="text-align: center; margin-top: var(--space-xl); opacity: 0.6;">
			<a href="https://github.com/CommanderFoo/steps-tracker" target="_blank" style="color: var(--color-text); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
				<svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
					<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
				</svg>
				View on GitHub
			</a>
		</div>
	`

	// Re-attach form listener
	document.getElementById("settings-form").addEventListener("submit", handle_settings_submit)

	// Calculate stride from height
	document.getElementById("calc-stride-btn").addEventListener("click", () => {
		const height = parseInt(document.getElementById("setting-height").value) || 175
		const estimated_stride = Calculations.estimate_stride_length(height)

		document.getElementById("setting-stride").value = estimated_stride
		UI.show_toast(`Stride length set to ${estimated_stride}cm based on your height`, "success")
	})

	// Theme change listener
	document.getElementById("setting-theme").addEventListener("change", (e) => {
		State.update_settings({ dark_mode: e.target.value })
		apply_theme()
	})

	// Export data
	document.getElementById("export-data-btn").addEventListener("click", () => {
		// Update last backup time
		State.update_settings({ last_backup: Date.now() })

		const data = State.get_all_data()
		Export.export_json(data, `steps-backup-${get_date_string(new Date())}.json`)
		UI.show_toast("Data exported! Backup timer reset.", "success")
	})

	// Import data
	document.getElementById("import-data-btn").addEventListener("click", async () => {
		try {
			const data = await Export.import_json()
			const result = Storage.import_json(JSON.stringify(data))

			if (result.success) {
				State.init(result.data)
				UI.show_toast("Data imported successfully!", "success")
				Router.handle_route()
			} else {
				UI.show_toast("Import failed: " + result.error, "error")
			}
		} catch (error) {
			UI.show_toast("Import cancelled or failed", "error")
		}
	})

	// Reset data
	document.getElementById("reset-data-btn").addEventListener("click", () => {
		if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
			// Get secret key before reset (so we can sync 0 steps)
			const settings = State.get_settings()
			const secret_key = settings?.secret_key

			Storage.clear_all()
			State.reset()
			UI.show_toast("All data reset", "warning")

			// Sync 0 steps to leaderboard
			if (secret_key) {
				Sync.sync_to_leaderboard(secret_key, 0)
			}

			Router.handle_route()
		}
	})

	// Toggle secret key visibility
	const toggle_btn = document.getElementById("toggle-secret-key")
	const secret_input = document.getElementById("setting-secret-key")
	let key_visible = false

	toggle_btn?.addEventListener("click", () => {
		key_visible = !key_visible
		secret_input.type = key_visible ? "text" : "password"
		toggle_btn.innerHTML = key_visible ? Icons.eye_off : Icons.eye
	})

	// Clear sync settings
	document.getElementById("clear-sync-settings")?.addEventListener("click", () => {
		document.getElementById("setting-sync-endpoint").value = ""
		document.getElementById("setting-secret-key").value = ""
		UI.show_toast("Sync settings cleared. Click Save to apply.", "warning")
	})
}

/**
 * Handle settings form submission
 * @param {Event} e - Submit event
 */
function handle_settings_submit(e) {
	e.preventDefault()

	const secret_key_raw = document.getElementById("setting-secret-key").value
	const secret_key = secret_key_raw ? secret_key_raw.trim() : ""
	const sync_endpoint_raw = document.getElementById("setting-sync-endpoint").value
	const sync_endpoint = sync_endpoint_raw ? sync_endpoint_raw.trim() : ""

	const new_settings = {
		height_cm: parseInt(document.getElementById("setting-height").value) || 175,
		weight_kg: parseInt(document.getElementById("setting-weight").value) || 70,
		stride_length_cm: parseInt(document.getElementById("setting-stride").value) || 75,
		daily_step_goal: parseInt(document.getElementById("setting-goal").value) || 10000,
		units: document.getElementById("setting-units").value,
		include_weekends: document.getElementById("setting-include-weekends").checked,
		dark_mode: document.getElementById("setting-theme").value,
		calorie_method: document.getElementById("setting-calorie-method").value,
		secret_key: secret_key,
		sync_endpoint: sync_endpoint
	}

	State.update_settings(new_settings)
	UI.show_toast("Settings saved!", "success")
}

/**
 * Apply theme based on settings
 */
function apply_theme() {
	const settings = State.get_settings()
	const html = document.documentElement

	html.classList.remove("dark-mode", "light-mode")

	if (settings.dark_mode === "dark") {
		html.classList.add("dark-mode")
	} else if (settings.dark_mode === "light") {
		html.classList.add("light-mode")
	}
	// "system" uses CSS media query
}

// Expose functions to window for onclick handlers
window.App = {
	open_entry_modal,
	handle_entry_delete
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init)
