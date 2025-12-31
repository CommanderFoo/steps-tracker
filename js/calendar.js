/**
 * Calendar_Picker - Custom calendar selection component
 */

import State from "./state.js"
import UI from "./ui.js"
import { get_date_string } from "./utils.js"

class Calendar_Picker {
	constructor(container_id, options = {}) {
		this.container = document.getElementById(container_id)
		this.current_date = options.initial_date ? new Date(options.initial_date + "T00:00:00") : new Date()
		this.selected_date = options.initial_date || null
		this.on_change = options.on_change || (() => { })

		this.today = new Date()
		this.today.setHours(0, 0, 0, 0)

		this.render()
	}

	set_date(date_str) {
		this.selected_date = date_str
		this.current_date = new Date(date_str + "T00:00:00")
		this.render()
	}

	prev_month() {
		this.current_date.setMonth(this.current_date.getMonth() - 1)
		this.render()
	}

	next_month() {
		this.current_date.setMonth(this.current_date.getMonth() + 1)
		this.render()
	}

	render() {
		if (!this.container) {
			return
		}

		const year = this.current_date.getFullYear()
		const month = this.current_date.getMonth()

		const first_day = new Date(year, month, 1)
		const last_day = new Date(year, month + 1, 0)

		// Get entry dates for indicators
		const entries = State.get_entries()
		const entry_dates = new Set(entries.map(e => e.date))

		// Calendar Header
		const month_name = this.current_date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

		this.container.innerHTML = `
			<div class="calendar-picker">
				<div class="calendar-header">
					<div class="calendar-month">${month_name}</div>
					<div class="calendar-nav">
						<button type="button" class="calendar-nav-btn" id="cal-prev" title="Previous Month">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						</button>
						<button type="button" class="calendar-nav-btn" id="cal-next" title="Next Month">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</button>
					</div>
				</div>
				<div class="calendar-grid">
					${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => `
						<div class="calendar-day-label">${d}</div>
					`).join("")}
					${this.generate_days(year, month, entry_dates)}
				</div>
			</div>
		`

		// Nav listeners
		this.container.querySelector("#cal-prev").addEventListener("click", (e) => {
			e.preventDefault()
			this.prev_month()
		})

		this.container.querySelector("#cal-next").addEventListener("click", (e) => {
			e.preventDefault()
			this.next_month()
		})

		// Day clicks
		this.container.querySelectorAll(".calendar-day").forEach(el => {
			el.addEventListener("click", () => {
				const date_str = el.dataset.date

				if (date_str) {
					this.selected_date = date_str
					this.render()
					this.on_change(date_str)
				}
			})
		})
	}

	generate_days(year, month, entry_dates) {
		const days = []
		const first_day = new Date(year, month, 1)

		// Start from Monday of the first week
		let start_offset = first_day.getDay() - 1

		if (start_offset < 0) {
			start_offset = 6
		}

		const current = new Date(first_day)
		current.setDate(current.getDate() - start_offset)

		// Render 6 weeks
		for (let i = 0; i < 42; i++) {
			const date_iso = get_date_string(current)

			const is_today = current.getTime() === this.today.getTime()
			const is_selected = date_iso === this.selected_date
			const is_other_month = current.getMonth() !== month
			const has_entry = entry_dates.has(date_iso)

			days.push(`
				<div class="calendar-day ${is_other_month ? "other-month" : ""} ${is_selected ? "selected" : ""} ${is_today ? "today" : ""} ${has_entry ? "has-entry" : ""}"
					 data-date="${date_iso}">
					${current.getDate()}
				</div>
			`)

			current.setDate(current.getDate() + 1)
		}

		return days.join("")
	}
}

export default Calendar_Picker
