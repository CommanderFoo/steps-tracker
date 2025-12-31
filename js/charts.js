/**
 * Charts - Chart.js integration for data visualization
 */

import { get_date_string } from "./utils.js"

const Charts = {
	instances: {},

	/**
	 * Common chart options
	 */
	base_options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				backgroundColor: "rgba(30, 41, 59, 0.9)",
				titleColor: "#f1f5f9",
				bodyColor: "#f1f5f9",
				padding: 12,
				cornerRadius: 8,
				displayColors: false
			}
		},
		scales: {
			x: {
				grid: {
					display: false
				},
				ticks: {
					color: "rgba(148, 163, 184, 0.8)"
				}
			},
			y: {
				grid: {
					color: "rgba(148, 163, 184, 0.1)"
				},
				ticks: {
					color: "rgba(148, 163, 184, 0.8)"
				},
				beginAtZero: true
			}
		}
	},

	/**
	 * Create or update a line chart
	 * @param {string} canvas_id - Canvas element ID
	 * @param {Array} labels - X-axis labels
	 * @param {Array} data - Data points
	 * @param {Object} options - Additional options
	 */
	render_line_chart(canvas_id, labels, data, options = {}) {
		const ctx = document.getElementById(canvas_id)

		if (!ctx) {
			return
		}

		// Destroy existing instance
		if (this.instances[canvas_id]) {
			this.instances[canvas_id].destroy()
		}

		const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 200)
		gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)")
		gradient.addColorStop(1, "rgba(99, 102, 241, 0)")

		this.instances[canvas_id] = new Chart(ctx, {
			type: "line",
			data: {
				labels,
				datasets: [{
					data,
					borderColor: "#6366f1",
					backgroundColor: gradient,
					borderWidth: 2,
					fill: true,
					tension: 0.4,
					pointRadius: 4,
					pointBackgroundColor: "#6366f1",
					pointBorderColor: "#ffffff",
					pointBorderWidth: 2,
					pointHoverRadius: 6
				}]
			},
			options: {
				...this.base_options,
				...options
			}
		})
	},

	/**
	 * Create or update a bar chart
	 * @param {string} canvas_id - Canvas element ID
	 * @param {Array} labels - X-axis labels
	 * @param {Array} data - Data points
	 * @param {Object} options - Additional options
	 */
	render_bar_chart(canvas_id, labels, data, options = {}) {
		const ctx = document.getElementById(canvas_id)

		if (!ctx) {
			return
		}

		// Destroy existing instance
		if (this.instances[canvas_id]) {
			this.instances[canvas_id].destroy()
		}

		// Create gradient for each bar
		const chart_ctx = ctx.getContext("2d")
		const gradient = chart_ctx.createLinearGradient(0, 0, 0, 200)
		gradient.addColorStop(0, "#6366f1")
		gradient.addColorStop(1, "#8b5cf6")

		this.instances[canvas_id] = new Chart(ctx, {
			type: "bar",
			data: {
				labels,
				datasets: [{
					data,
					backgroundColor: gradient,
					borderRadius: 6,
					borderSkipped: false,
					barThickness: "flex",
					maxBarThickness: 40
				}]
			},
			options: {
				...this.base_options,
				...options
			}
		})
	},

	/**
	 * Render weekly steps bar chart
	 * @param {string} canvas_id - Canvas element ID
	 * @param {Array} entries - Week entries data
	 * @param {number} goal - Daily step goal
	 */
	render_weekly_chart(canvas_id, entries, goal) {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
		const data = new Array(7).fill(0)

		// Map entries to days
		entries.forEach(entry => {
			const date = new Date(entry.date + "T00:00:00")
			let day_index = date.getDay() - 1

			if (day_index < 0) {
				day_index = 6
			}

			data[day_index] = entry.steps
		})

		const ctx = document.getElementById(canvas_id)

		if (!ctx) {
			return
		}

		if (this.instances[canvas_id]) {
			this.instances[canvas_id].destroy()
		}

		// Color bars based on goal award
		const colors = data.map(steps =>
			steps >= goal ? "#10b981" : "#6366f1"
		)

		this.instances[canvas_id] = new Chart(ctx, {
			type: "bar",
			data: {
				labels: days,
				datasets: [{
					data,
					backgroundColor: colors,
					borderRadius: 6,
					borderSkipped: false
				}]
			},
			options: {
				...this.base_options,
				plugins: {
					...this.base_options.plugins,
					annotation: goal ? {
						annotations: {
							goal_line: {
								type: "line",
								yMin: goal,
								yMax: goal,
								borderColor: "rgba(239, 68, 68, 0.5)",
								borderWidth: 2,
								borderDash: [5, 5]
							}
						}
					} : undefined
				}
			}
		})
	},

	/**
	 * Render monthly cumulative chart
	 * @param {string} canvas_id - Canvas element ID
	 * @param {Array} entries - Month entries sorted by date ascending
	 */
	render_monthly_chart(canvas_id, entries) {
		if (!entries || entries.length === 0) {
			return
		}

		// Sort entries by date ascending
		const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

		const labels = []
		const data = []
		let cumulative = 0

		sorted.forEach(entry => {
			const date = new Date(entry.date + "T00:00:00")
			labels.push(date.getDate().toString())
			cumulative += entry.steps
			data.push(cumulative)
		})

		this.render_line_chart(canvas_id, labels, data)
	},

	/**
	 * Render heatmap calendar for yearly view
	 * @param {string} container_id - Container element ID
	 * @param {Array} entries - Year entries
	 * @param {number} year - Year to display
	 */
	render_heatmap(container_id, entries, year) {
		const container = document.getElementById(container_id)

		if (!container) {
			return
		}

		container.innerHTML = ""

		// Create a map of date -> steps
		const steps_map = {}
		entries.forEach(entry => {
			steps_map[entry.date] = entry.steps
		})

		// Calculate max steps for color scaling
		const max_steps = Math.max(...entries.map(e => e.steps), 1)

		// Create calendar grid
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

		const calendar = document.createElement("div")
		calendar.className = "heatmap-calendar"
		calendar.style.cssText = `
            display: grid;
            grid-template-columns: repeat(53, 1fr);
            gap: 2px;
            padding: var(--space-md);
        `

		// Add month labels
		const labels_row = document.createElement("div")
		labels_row.style.cssText = `
            display: flex;
            gap: 2px;
            margin-bottom: 4px;
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
        `

		// Generate all days of the year
		const start_date = new Date(year, 0, 1)
		const end_date = new Date(year, 11, 31)

		for (let d = new Date(start_date); d <= end_date; d.setDate(d.getDate() + 1)) {
			const date_str = get_date_string(d)
			const steps = steps_map[date_str] || 0
			const intensity = steps / max_steps

			const day_el = document.createElement("div")
			day_el.title = `${date_str}: ${steps.toLocaleString()} steps`
			day_el.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 2px;
                background-color: ${this.get_heatmap_color(intensity)};
            `

			calendar.appendChild(day_el)
		}

		container.appendChild(calendar)
	},

	/**
	 * Get heatmap color based on intensity
	 * @param {number} intensity - Value between 0 and 1
	 * @returns {string} CSS color
	 */
	get_heatmap_color(intensity) {
		if (intensity === 0) {
			return "var(--color-border)"
		}

		if (intensity < 0.25) {
			return "rgba(99, 102, 241, 0.3)"
		}

		if (intensity < 0.5) {
			return "rgba(99, 102, 241, 0.5)"
		}

		if (intensity < 0.75) {
			return "rgba(99, 102, 241, 0.7)"
		}

		return "#6366f1"
	},

	/**
	 * Destroy a chart instance
	 * @param {string} canvas_id - Canvas element ID
	 */
	destroy(canvas_id) {
		if (this.instances[canvas_id]) {
			this.instances[canvas_id].destroy()
			delete this.instances[canvas_id]
		}
	},

	/**
	 * Destroy all chart instances
	 */
	destroy_all() {
		Object.keys(this.instances).forEach(key => {
			this.instances[key].destroy()
		})
		this.instances = {}
	}
}

export default Charts
