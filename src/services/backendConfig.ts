export const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
export const isCloudBackendConfigured = /^https:\/\//i.test(apiBaseUrl);
