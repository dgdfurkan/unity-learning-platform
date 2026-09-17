export const firebaseWebConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
export const isFirebaseConfigured = Object.values(firebaseWebConfig).every((value) => typeof value === 'string' && value.length > 0)
  && typeof appCheckSiteKey === 'string' && appCheckSiteKey.length > 0;
export const firebaseRegion = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'europe-west1';
export const adminUsername = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').trim().toLocaleLowerCase('tr-TR');
export const adminEmailDomain = (import.meta.env.VITE_ADMIN_EMAIL_DOMAIN || 'levelup.local').trim().toLocaleLowerCase('en-US');
