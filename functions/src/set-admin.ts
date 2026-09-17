import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp({ credential: applicationDefault() });
const [uid, username = 'admin'] = process.argv.slice(2);
if (!uid) throw new Error('Usage: node lib/set-admin.js <ADMIN_UID> [username]');
const auth = getAuth();
const user = await auth.getUser(uid);
await auth.setCustomUserClaims(uid, { ...(user.customClaims ?? {}), role: 'admin' });
const profileRef = getFirestore().doc(`users/${uid}`);
const profile = await profileRef.get();
await profileRef.set({
  role: 'admin', username: username.trim().toLocaleLowerCase('tr-TR'),
  displayName: user.displayName || 'Furkan Eğitmen', status: 'active',
  updatedAt: FieldValue.serverTimestamp(), ...(!profile.exists ? { createdAt: FieldValue.serverTimestamp() } : {}),
}, { merge: true });
await getFirestore().doc('system/config').set({ adminUid: uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`Admin claim applied to ${uid}.`);
