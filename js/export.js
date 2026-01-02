/**
 * Export - PNG generation with html2canvas
 */

import UI from "./ui.js"

const Export = {
	/**
	 * Capture element as PNG and trigger download
	 * @param {string} element_id - Element ID to capture
	 * @param {string} filename - Download filename
	 */
	async capture_png(element_id, filename = "steps-summary.png") {
		const element = document.getElementById(element_id)

		if (!element) {
			console.error("Export: Element not found:", element_id)

			return
		}

		try {
			// Ensure html2canvas is loaded
			if (typeof html2canvas === "undefined") {
				console.error("Export: html2canvas not loaded")

				return
			}

			const canvas = await html2canvas(element, {
				backgroundColor: null,
				scale: 2, // Higher resolution
				logging: false,
				useCORS: true
			})

			// Convert to blob and trigger download
			canvas.toBlob((blob) => {
				const url = URL.createObjectURL(blob)
				const link = document.createElement("a")

				link.href = url
				link.download = filename

				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)

				URL.revokeObjectURL(url)
			}, "image/png")
		} catch (error) {
			console.error("Export: Capture failed:", error)
		}
	},

	/**
	 * Generate shareable summary card HTML
	 * @param {Object} stats - Stats object
	 * @param {string} date_range - Date range string
	 * @param {string} units - Unit preference ("metric" or "imperial")
	 * @returns {HTMLElement}
	 */
	create_summary_card(stats, date_range, units = "metric") {
		const card = document.createElement("div")

		card.id = "export-summary-card"
		card.style.cssText = `
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 32px;
            border-radius: 24px;
            width: 400px;
            font-family: "Inter", sans-serif;
        `

		card.innerHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">
                    ${UI.escapeHTML(date_range)}
                </div>
                <div style="font-size: 24px; font-weight: 600;">
                    Steps Summary
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700;">
                        ${stats.total_steps.toLocaleString()}
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">Steps</div>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700;">
                        ${UI.format_distance(stats.total_distance_km, units).split(" ")[0]}
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">${units === "imperial" ? "Miles" : "Kilometers"}</div>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700;">
                        ${stats.total_calories.toLocaleString()}
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">Calories</div>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700;">
                        ${Math.floor(stats.total_time_minutes / 60)}h ${stats.total_time_minutes % 60}m
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">Active Time</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 24px; font-size: 12px; opacity: 0.7;">
                Steps Tracker
            </div>
        `

		return card
	},

	/**
	 * Export weekly summary as PNG
	 * @param {Object} stats - Weekly stats
	 * @param {string} week_label - Week date range label
	 */
	async export_weekly_summary(stats, week_label, units = "metric") {
		const card = this.create_summary_card(stats, week_label, units)
		/* slide */
		// Temporarily append to body (off-screen)
		card.style.position = "fixed"
		card.style.left = "-9999px"
		document.body.appendChild(card)

		await this.capture_png("export-summary-card", `steps-${week_label.replace(/\s/g, "-")}.png`)

		document.body.removeChild(card)
	},

	/**
	 * Generate shareable banner HTML (horizontal 800x300)
	 * @param {Object} stats - Lifetime stats
	 * @param {string} units - Unit preference
	 * @returns {HTMLElement}
	 */
	/**
	 * Generate shareable banner HTML (horizontal 800x300)
	 * @param {Object} stats - Lifetime stats
	 * @param {string} units - Unit preference
	 * @param {Object} award_stats - Award count {unlocked, total}
	 * @returns {HTMLElement}
	 */
	create_share_banner(stats, units = "metric", award_stats = null) {
		const banner = document.createElement("div")

		banner.id = "export-share-banner"
		banner.style.cssText = `
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
            color: white;
            padding: 40px;
            border-radius: 32px;
            width: 800px;
            height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-family: "Inter", sans-serif;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        `

		// Add some decorative circles
		const circle1 = `<div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.1); filter: blur(40px);"></div>`
		const circle2 = `<div style="position: absolute; bottom: -80px; left: -30px; width: 250px; height: 250px; border-radius: 50%; background: rgba(255,255,255,0.05); filter: blur(50px);"></div>`

		// Calculate award completion
		let award_pill = ""
		if (award_stats && award_stats.total > 0) {
			const percent = Math.round((award_stats.unlocked / award_stats.total) * 100)
			award_pill = `
				<div style="background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(4px); margin-top: 10px;">
					<span style="Position: relative; top: -6px"><span style="position: relative; top: 2px">🏆</span> ${percent}% Awards Unlocked</span>
				</div>
			`
		}

		banner.innerHTML = `
            ${circle1}
            ${circle2}
            <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 1;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                        <div style="font-size: 14px; font-weight: 500; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.1em;">
                            My Steps Journey
                        </div>
                        ${award_pill}
                    </div>
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: -0.02em;">
                        Lifetime Stats
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700;">Steps Tracker</div>
                    <div style="font-size: 12px; opacity: 0.7;">Walking for a healthier life</div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; z-index: 1; margin-bottom: 20px;">
                <div style="display: flex; gap: 40px; text-align: center;">
                    <div>
                        <div style="font-size: 26px; font-weight: 700;">${stats.total_steps.toLocaleString()}</div>
                        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">Steps</div>
                    </div>
                    <div>
                        <div style="font-size: 26px; font-weight: 700;">${UI.format_distance(stats.total_distance_km, units).split(" ")[0]}</div>
                        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">${units === "imperial" ? "Miles" : "Kilometers"}</div>
                    </div>
                    <div>
                        <div style="font-size: 26px; font-weight: 700;">${stats.total_calories.toLocaleString()}</div>
                        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">Calories</div>
                    </div>
                    <div>
                        <div style="font-size: 26px; font-weight: 700;">${Math.floor(stats.total_time_minutes / 60)}h ${stats.total_time_minutes % 60}m</div>
                        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">Time</div>
                    </div>
                    <div>
                        <div style="font-size: 26px; font-weight: 700;">${stats.average_steps.toLocaleString()}</div>
                        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">Daily Avg</div>
                    </div>
                </div>
            </div>
        `

		return banner
	},

	/**
	 * Export share banner as PNG
	 * @param {Object} stats - Lifetime stats
	 * @param {string} units - Unit preference
	 * @param {Object} award_stats - Award count for badge
	 */
	async export_share_banner(stats, units = "metric", award_stats = null) {
		const banner = this.create_share_banner(stats, units, award_stats)

		banner.style.position = "fixed"
		banner.style.left = "-9999px"
		document.body.appendChild(banner)

		await this.capture_png("export-share-banner", "steps-tracker-banner.png")

		document.body.removeChild(banner)
	},

	/**
	 * Export data as JSON file
	 * @param {Object} data - Data to export
	 * @param {string} filename - Download filename
	 */
	export_json(data, filename = "steps-data.json") {
		const json_str = JSON.stringify(data, null, 2)
		const blob = new Blob([json_str], { type: "application/json" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")

		link.href = url
		link.download = filename

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		URL.revokeObjectURL(url)
	},

	/**
	 * Import JSON file
	 * @returns {Promise<Object>} Parsed data
	 */
	import_json() {
		return new Promise((resolve, reject) => {
			const input = document.createElement("input")

			input.type = "file"
			input.accept = ".json"

			input.onchange = (e) => {
				const file = e.target.files[0]

				if (!file) {
					reject(new Error("No file selected"))

					return
				}

				const reader = new FileReader()

				reader.onload = (event) => {
					try {
						const data = JSON.parse(event.target.result)
						resolve(data)
					} catch (error) {
						reject(new Error("Invalid JSON file"))
					}
				}

				reader.onerror = () => reject(new Error("Failed to read file"))
				reader.readAsText(file)
			}

			input.click()
		})
	}
}

export default Export
