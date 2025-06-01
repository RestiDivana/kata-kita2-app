import { BellIcon, BellOffIcon, Out, Star } from "./components/icons.js";
import AuthModel from "./models/auth-model.js";
import Router from "./routes.js";
import NotificationHelper from "./utils/notification-helper.js";

class App {
	constructor() {
		this.router = new Router();
		this.authModel = new AuthModel();
		this.notificationHelper = NotificationHelper;
		this.isSubscribed = false;
	}

	async init() {
		this.authModel.checkAuth();
		this.updateAuthNav();
		this.router.init();

		window.addEventListener("auth-changed", () => {
			this.updateAuthNav();
		});

		window.addEventListener("hashchange", () => {
			this.router.loadPage();
			this.updateSkipLink();
		});

		this.router.loadPage();
		this.updateSkipLink();
		this.initMobileMenu();

		window.addEventListener("beforeinstallprompt", (e) => {
			e.preventDefault();
			this.deferredPrompt = e;

			const btnInstall = document.querySelector("#action-container button");
			if (!btnInstall) {
				this.showInstallButton();
			}
		});

		this.initNetworkStatus();
		await this.initPushNotification();
	}

	showInstallButton() {
		const installButton = document.createElement("button");
		installButton.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-up-icon lucide-monitor-up"><path d="m9 10 3-3 3 3"/><path d="M12 13V7"/><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>
		`;
		installButton.className = "btn install-btn";
		document.getElementById("action-container")?.appendChild(installButton);

		installButton.addEventListener("click", async () => {
			if (!this.deferredPrompt) return;

			this.deferredPrompt.prompt();
			const choiceResult = await this.deferredPrompt.userChoice;

			if (choiceResult.outcome === "accepted") {
				installButton.remove();
			}

			this.deferredPrompt = null;
		});
	}

	initNetworkStatus() {
		import("./components/network-status.js").then(({ default: NetworkStatus }) => {
			new NetworkStatus();
		});
	}

	async initPushNotification() {
		const serviceWorkerRegistration = await this.notificationHelper.registerServiceWorker();

		if (serviceWorkerRegistration && "PushManager" in window) {
			try {
				const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
				this.isSubscribed = existingSubscription !== null;
				this.notificationHelper.updateServiceWorkerSubscriptionState(this.isSubscribed);

				if (this.authModel.isLoggedIn()) {
					this.addNotificationButton(this.isSubscribed);
				}
			} catch (error) {
				console.error("Error checking push subscription:", error);
			}
		}
	}

	addNotificationButton(isSubscribed) {
		const existingBtn = document.getElementById("notificationBtn");
		if (existingBtn) existingBtn.remove();

		const existingMobileBtn = document.getElementById("mobileNotificationBtn");
		if (existingMobileBtn) existingMobileBtn.remove();

		const userInfoDesktop = document.querySelector("#authNav .user-info");
		if (userInfoDesktop) {
			const notificationBtn = document.createElement("button");
			notificationBtn.id = "notificationBtn";
			notificationBtn.className = "btn";
			notificationBtn.innerHTML = isSubscribed ? BellOffIcon() : BellIcon();
			userInfoDesktop.appendChild(notificationBtn);

			notificationBtn.addEventListener("click", async () => {
				const registration = await navigator.serviceWorker.ready;
				const currentSubscription = await registration.pushManager.getSubscription();
				await this.togglePushNotification(currentSubscription !== null);
			});
		}

		const userInfoMobile = document.querySelector("#sidebarAuthNav .user-info");
		if (userInfoMobile) {
			const mobileNotificationBtn = document.createElement("button");
			mobileNotificationBtn.id = "mobileNotificationBtn";
			mobileNotificationBtn.className = "btn";
			mobileNotificationBtn.style.width = "100%";
			mobileNotificationBtn.innerHTML = isSubscribed ? BellOffIcon() : BellIcon();
			userInfoMobile.appendChild(mobileNotificationBtn);

			mobileNotificationBtn.addEventListener("click", async () => {
				const registration = await navigator.serviceWorker.ready;
				const currentSubscription = await registration.pushManager.getSubscription();
				await this.togglePushNotification(currentSubscription !== null);
			});
		}
	}

	async togglePushNotification(isSubscribed) {
		try {
			const registration = await navigator.serviceWorker.ready;
			if (!registration) {
				alert("Service Worker tidak tersedia");
				return;
			}

			if (isSubscribed) {
				await this.notificationHelper.unsubscribePushNotification(registration);
				this.isSubscribed = false;
				this.updateNotificationButtons(false);
				alert("Notifikasi dinonaktifkan");
			} else {
				const permissionResult = await this.notificationHelper.requestPermission();
				if (!permissionResult) {
					alert("Silakan izinkan notifikasi di pengaturan browser Anda");
					return;
				}

				const subscription = await this.notificationHelper.subscribePushNotification(registration);
				if (subscription) {
					this.isSubscribed = true;
					this.updateNotificationButtons(true);
					this.notificationHelper.showNotification("Notifikasi Diaktifkan", {
						body: "Anda akan menerima notifikasi untuk cerita baru dari KataKita",
						icon: "./icons/icon-192x192.png",
					});
				}
			}
		} catch (error) {
			console.error("Error toggling push notification:", error);
			alert(`Terjadi kesalahan: ${error.message}`);
		}
	}

	updateNotificationButtons(isSubscribed) {
		const notificationBtn = document.getElementById("notificationBtn");
		if (notificationBtn) notificationBtn.innerHTML = isSubscribed ? BellOffIcon() : BellIcon();

		const mobileNotificationBtn = document.getElementById("mobileNotificationBtn");
		if (mobileNotificationBtn) mobileNotificationBtn.innerHTML = isSubscribed ? BellOffIcon() : BellIcon();

		this.isSubscribed = isSubscribed;
		this.notificationHelper.updateServiceWorkerSubscriptionState(isSubscribed);
	}

	updateAuthNav() {
		const authNavElement = document.getElementById("authNav");
		const sidebarAuthNavElement = document.getElementById("sidebarAuthNav");

		if (!authNavElement || !sidebarAuthNavElement) return;

		if (this.authModel.isLoggedIn()) {
			const desktopAuthContent = `
        <div class="user-info">
          <a href="#/favorites" class="btn btn-secondary">${Star()}</a>
          <button id="logoutBtn" class="btn">${Out()}</button>
        </div>
      `;

			const mobileAuthContent = `
        <div class="user-info">
          <a href="#/favorites" class="btn btn-secondary">${Star()}</a>
          <button id="mobileLogoutBtn" class="btn">${Out()}</button>
        </div>
      `;

			authNavElement.innerHTML = desktopAuthContent;
			sidebarAuthNavElement.innerHTML = mobileAuthContent;

			document.getElementById("logoutBtn")?.addEventListener("click", () => {
				this.authModel.logout();
			});

			document.getElementById("mobileLogoutBtn")?.addEventListener("click", () => {
				this.authModel.logout();
			});

			this.initPushNotification();
		} else {
			const authContent = `<a href="#/login" class="nav-link">Masuk</a>`;
			authNavElement.innerHTML = authContent;
			sidebarAuthNavElement.innerHTML = authContent;
		}
	}

	initMobileMenu() {
		const hamburgerMenu = document.getElementById("hamburgerMenu");
		const sidebar = document.getElementById("sidebar");
		const overlay = document.getElementById("overlay");

		if (!hamburgerMenu || !sidebar || !overlay) {
			console.warn("Elemen mobile menu tidak ditemukan");
			return;
		}

		hamburgerMenu.addEventListener("click", () => {
			sidebar.classList.toggle("open");
			overlay.classList.toggle("open");
		});

		overlay.addEventListener("click", () => {
			sidebar.classList.remove("open");
			overlay.classList.remove("open");
		});

		sidebar.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => {
				sidebar.classList.remove("open");
				overlay.classList.remove("open");
			});
		});
	}

	updateSkipLink() {
		const skipLink = document.getElementById("skipLink");
		if (skipLink) {
			skipLink.addEventListener("click", (e) => {
				e.preventDefault();
				const mainContent = document.getElementById("mainContent");
				if (mainContent) {
					mainContent.setAttribute("tabindex", "-1");
					mainContent.focus();
					mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			});
		}
	}
}

export default App;
