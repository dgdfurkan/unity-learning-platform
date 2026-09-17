import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { appCheckSiteKey, firebaseRegion, firebaseWebConfig, isFirebaseConfigured } from './firebaseConfig';

const app = isFirebaseConfigured ? initializeApp(firebaseWebConfig) : null;

if (app) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;
export const cloudFunctions = app ? getFunctions(app, firebaseRegion) : null;
