import VamshopClient from 'vamshop-client';
import settings from 'lib/settings';

let api = null;
let dashboardToken = localStorage.getItem('dashboard_token');
let webstoreToken = localStorage.getItem('webstore_token');

const DEVELOPER_MODE = settings.developerMode === true;

if (dashboardToken || DEVELOPER_MODE === true) {
	api = new VamshopClient({
		apiBaseUrl: settings.apiBaseUrl || '/api/v1',
		apiToken: dashboardToken,
		webstoreToken: webstoreToken
	});
}

export default api;
