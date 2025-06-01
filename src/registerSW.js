import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		const updateSW = registerSW({
			onNeedRefresh() {
				const refresh = confirm('✨ Versi baru KataKita tersedia! Muat ulang halaman untuk update?');
				if (refresh) updateSW(true);
			},
			onOfflineReady() {
				console.log('🚀 KataKita siap digunakan secara offline!');
			},
		});

		return true;
	}

	console.warn('❌ Service Worker tidak didukung di browser ini.');
	return false;
}
