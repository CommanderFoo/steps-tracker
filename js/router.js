/**
 * Router - Hash-based view navigation
 */

const Router = {
	routes: {},
	current_route: null,

	init() {
		window.addEventListener("hashchange", () => this.handle_route())
		this.handle_route()
	},

	register(path, handler) {
		this.routes[path] = handler
	},

	navigate(path) {
		window.location.hash = path
	},

	handle_route() {
		const hash = window.location.hash || "#/"
		const path = hash.slice(1) || "/"

		// Hide all views
		document.querySelectorAll(".view").forEach(view => {
			view.classList.remove("active")
		})

		// Update nav items
		document.querySelectorAll(".nav-item").forEach(item => {
			item.classList.remove("active")

			if (item.dataset.route === path) {
				item.classList.add("active")
			}
		})

		// Show target view
		const view_id = this.get_view_id(path)
		const view_element = document.getElementById(view_id)

		if (view_element) {
			view_element.classList.add("active")
		}

		// Call route handler if exists
		if (this.routes[path]) {
			this.routes[path]()
		}

		this.current_route = path
	},

	get_view_id(path) {
		const route_map = {
			"/": "view-today",
			"/history": "view-history",
			"/insights": "view-insights",
			"/stats": "view-stats",
			"/records": "view-records",
			"/awards": "view-awards",
			"/settings": "view-settings"
		}

		return route_map[path] || "view-today"
	}
}

export default Router
