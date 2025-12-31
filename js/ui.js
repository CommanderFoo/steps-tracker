/**
 * UI - DOM rendering helpers and utilities
 */

const UI = {
	/**
	 * Escape HTML to prevent XSS
	 * @param {string} str - String to escape
	 * @returns {string}
	 */
	escapeHTML(str) {
		if (typeof str !== "string") {
			return str
		}

		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
	},

	/**
	 * Create an element with attributes and children
	 * @param {string} tag - HTML tag name
	 * @param {Object} attrs - Attributes object
	 * @param {Array|string} children - Child elements or text
	 * @returns {HTMLElement}
	 */
	create_element(tag, attrs = {}, children = []) {
		const el = document.createElement(tag)

		Object.entries(attrs).forEach(([key, value]) => {
			if (key === "className") {
				el.className = value
			} else if (key === "dataset") {
				Object.entries(value).forEach(([k, v]) => {
					el.dataset[k] = v
				})
			} else if (key.startsWith("on")) {
				el.addEventListener(key.slice(2).toLowerCase(), value)
			} else {
				el.setAttribute(key, value)
			}
		})

		if (typeof children === "string") {
			el.textContent = children
		} else {
			children.forEach(child => {
				if (typeof child === "string") {
					el.appendChild(document.createTextNode(child))
				} else if (child) {
					el.appendChild(child)
				}
			})
		}

		return el
	},

	/**
	 * Render a stat card
	 * @param {Object} options - Card options
	 * @returns {HTMLElement}
	 */
	render_stat_card({ icon, value, label, variant = "" }) {
		const card = this.create_element("div", { className: `stat-card ${variant}` })

		if (icon) {
			const icon_el = this.create_element("div", { className: "stat-card-icon" })
			icon_el.innerHTML = icon

			card.appendChild(icon_el)
		}

		card.appendChild(this.create_element("div", { className: "stat-card-value" }, String(value)))
		card.appendChild(this.create_element("div", { className: "stat-card-label" }, label))

		return card
	},

	/**
	 * Render circular progress ring
	 * @param {number} percentage - Progress percentage (0-100)
	 * @param {string} value_text - Text to show in center
	 * @param {string} label_text - Label below value
	 * @returns {HTMLElement}
	 */
	render_progress_ring(percentage, value_text, label_text) {
		const container = this.create_element("div", { className: "progress-ring-container" })

		const radius = 85
		const circumference = 2 * Math.PI * radius
		const offset = circumference - (percentage / 100) * circumference

		container.innerHTML = `
            <svg class="progress-ring" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="var(--color-primary)" />
                        <stop offset="100%" stop-color="var(--color-primary-light)" />
                    </linearGradient>
                </defs>
                <circle class="progress-ring-bg" cx="100" cy="100" r="${radius}" />
                <circle
                    class="progress-ring-fill"
                    cx="100"
                    cy="100"
                    r="${radius}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                />
            </svg>
            <div class="progress-ring-text">
                <span class="progress-ring-value">${this.escapeHTML(value_text)}</span>
                <span class="progress-ring-label">${this.escapeHTML(label_text)}</span>
            </div>
        `

		return container
	},

	/**
	 * Update progress ring
	 * @param {HTMLElement} container - Ring container element
	 * @param {number} percentage - New percentage
	 * @param {string} value_text - New value text
	 */
	update_progress_ring(container, percentage, value_text) {
		const circle = container.querySelector(".progress-ring-fill")
		const value_el = container.querySelector(".progress-ring-value")

		if (circle) {
			const radius = 85
			const circumference = 2 * Math.PI * radius
			const offset = circumference - (percentage / 100) * circumference

			circle.style.strokeDashoffset = offset
		}

		if (value_el) {
			value_el.textContent = value_text
		}
	},

	/**
	 * Animate count up
	 * @param {HTMLElement} element - Target element
	 * @param {number} end_value - Final value
	 * @param {number} duration - Animation duration in ms
	 * @param {string} suffix - Optional suffix (e.g., "km")
	 */
	animate_count(element, end_value, duration = 1000, suffix = "") {
		const start_value = parseInt(element.textContent) || 0
		const start_time = performance.now()
		const diff = end_value - start_value

		const animate = (current_time) => {
			const elapsed = current_time - start_time
			const progress = Math.min(elapsed / duration, 1)

			// Easing function (ease-out)
			const eased_progress = 1 - Math.pow(1 - progress, 3)
			const current_value = Math.round(start_value + diff * eased_progress)

			element.textContent = current_value.toLocaleString() + suffix

			if (progress < 1) {
				requestAnimationFrame(animate)
			}
		}

		requestAnimationFrame(animate)
	},

	/**
	 * Show toast notification
	 * @param {string} message - Toast message
	 * @param {string} type - Toast type: "success", "error", "warning"
	 * @param {Object} action - Optional action { text, callback }
	 * @param {number} duration - Duration in ms
	 */
	show_toast(message, type = "success", action = null, duration = 4000) {
		let container = document.querySelector(".toast-container")

		if (!container) {
			container = this.create_element("div", { className: "toast-container" })
			document.body.appendChild(container)
		}

		const toast = this.create_element("div", { className: `toast ${type}` })

		const message_span = this.create_element("span")
		message_span.textContent = message
		toast.appendChild(message_span)

		if (action) {
			const action_btn = this.create_element("span", {
				className: "toast-action",
				onClick: () => {
					action.callback()
					toast.remove()
				}
			}, action.text)

			toast.appendChild(action_btn)
		}

		container.appendChild(toast)

		// Auto remove
		setTimeout(() => {
			toast.style.opacity = "0"
			toast.style.transform = "translateY(20px)"

			setTimeout(() => toast.remove(), 300)
		}, duration)
	},

	/**
	 * Open modal
	 * @param {string} modal_id - Modal overlay element ID
	 */
	open_modal(modal_id) {
		const modal = document.getElementById(modal_id)

		if (modal) {
			modal.classList.add("active")
			document.body.style.overflow = "hidden"
		}
	},

	/**
	 * Close modal
	 * @param {string} modal_id - Modal overlay element ID
	 */
	close_modal(modal_id) {
		const modal = document.getElementById(modal_id)

		if (modal) {
			modal.classList.remove("active")
			document.body.style.overflow = ""
		}
	},

	/**
	 * Format number with commas
	 * @param {number} num - Number to format
	 * @returns {string}
	 */
	format_number(num) {
		return (num || 0).toLocaleString()
	},

	/**
	 * Format distance with unit
	 * @param {number} km - Distance in km
	 * @param {string} units - "metric" or "imperial"
	 * @returns {string}
	 */
	format_distance(km, units = "metric") {
		if (units === "imperial") {
			const miles = km * 0.621371

			return `${miles.toFixed(2)} mi`
		}

		return `${km.toFixed(2)} km`
	},

	/**
	 * Format time duration
	 * @param {number} minutes - Duration in minutes
	 * @returns {string}
	 */
	format_duration(minutes) {
		if (!minutes) {
			return "0m"
		}

		const hours = Math.floor(minutes / 60)
		const mins = minutes % 60

		if (hours > 0) {
			return `${hours}h ${mins}m`
		}

		return `${mins}m`
	},

	/**
	 * Format date as readable string
	 * @param {string} date_string - ISO date string
	 * @param {string} format - "short", "long", "relative"
	 * @returns {string}
	 */
	format_date(date_string, format = "short") {
		const date = new Date(date_string + "T00:00:00")
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		if (format === "relative") {
			if (date.getTime() === today.getTime()) {
				return "Today"
			}

			if (date.getTime() === yesterday.getTime()) {
				return "Yesterday"
			}
		}

		const options = format === "long"
			? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
			: { month: "short", day: "numeric" }

		return date.toLocaleDateString("en-US", options)
	},

	/**
	 * Render empty state
	 * @param {string} icon - SVG icon HTML
	 * @param {string} title - Title text
	 * @param {string} description - Description text
	 * @returns {HTMLElement}
	 */
	render_empty_state(icon, title, description) {
		const container = this.create_element("div", { className: "empty-state" })

		container.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${this.escapeHTML(title)}</div>
            <div class="empty-state-desc">${this.escapeHTML(description)}</div>
        `

		return container
	},

	/**
	 * Render list item
	 * @param {Object} options - Item options
	 * @returns {HTMLElement}
	 */
	render_list_item({ icon, title, subtitle, value, onClick }) {
		const item = this.create_element("div", {
			className: "list-item",
			onClick: onClick || null
		})

		if (icon) {
			const icon_el = this.create_element("div", { className: "list-item-icon" })
			icon_el.innerHTML = icon

			item.appendChild(icon_el)
		}

		const content = this.create_element("div", { className: "list-item-content" })
		content.appendChild(this.create_element("div", { className: "list-item-title" }, title))

		if (subtitle) {
			content.appendChild(this.create_element("div", { className: "list-item-subtitle" }, subtitle))
		}

		item.appendChild(content)

		if (value !== undefined) {
			item.appendChild(this.create_element("div", { className: "list-item-value" }, value))
		}

		return item
	},

	/**
	 * Generate UUID
	 * @returns {string}
	 */
	generate_id() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0
			const v = c === "x" ? r : (r & 0x3 | 0x8)

			return v.toString(16)
		})
	}
}

export default UI
