import HomeView from "./views/home-view.js";
import LoginView from "./views/login-view.js";
import RegisterView from "./views/register-view.js";
import StoriesView from "./views/stories-view.js";
import AddStoryView from "./views/add-story-view.js";
import DetailStoryView from "./views/detail-story-view.js";
import FavoritesView from "./views/favorites-view.js";
import NotFoundView from "./views/not-found-view.js";
import AuthModel from "./models/auth-model.js";

class Router {
	constructor() {
		this.routes = {
			"#/": HomeView,
			"#/login": LoginView,
			"#/register": RegisterView,
			"#/stories": StoriesView,
			"#/add": AddStoryView,
			"#/detail/:id": DetailStoryView,
			"#/favorites": FavoritesView,
			"#/not-found": NotFoundView,
		};

		this.authModel = new AuthModel();
		this.mainContent = document.getElementById("mainContent");
		this.currentPage = null;
	}

	init() {
		if (!window.location.hash) {
			window.location.hash = "#/";
		}

		window.addEventListener("hashchange", () => {
			if (this.currentPage && typeof this.currentPage.destroy === "function") {
				this.currentPage.destroy();
			}
		});
	}

	loadPage() {
		const hash = window.location.hash;
		let page = null;

		this.authModel.checkAuth();

		if (hash.startsWith("#/detail/")) {
			const id = hash.substring("#/detail/".length);

			if (!this.authModel.isLoggedIn()) {
				window.location.hash = "#/login";
				return;
			}

			page = new this.routes["#/detail/:id"](id);
		} else {
			if ((hash === "#/stories" || hash === "#/add" || hash === "#/favorites") && !this.authModel.isLoggedIn()) {
				window.location.hash = "#/login";
				return;
			}

			if ((hash === "#/login" || hash === "#/register") && this.authModel.isLoggedIn()) {
				window.location.hash = "#/";
				return;
			}

			const View = this.routes[hash];
			if (View) {
				page = new View();
			} else {
				page = new NotFoundView();
			}
		}

		this.currentPage = page;

		if ("startViewTransition" in document) {
			document.startViewTransition(() => {
				this.renderPage(page);
			});
		} else {
			this.renderPage(page);
		}
	}

	renderPage(page) {
		this.mainContent.innerHTML = "";
		const viewContainer = document.createElement("div");
		viewContainer.className = "view-enter";
		page.render(viewContainer);
		this.mainContent.appendChild(viewContainer);
		page.afterRender();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}
}

export default Router;
