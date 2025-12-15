import admin from 'firebase-admin';
import { getSecret } from './secrets.js';
let isInitialized = false;
/**
 * Initialise firebase for authentication
 *
 */
export async function initializeFirebase() {
    if (isInitialized)
        return admin; // already initialized }
    const firebaseCredentials = await getSecret("FIREBASE_CREDENTIALS");
    const credentials = JSON.parse(firebaseCredentials);
    admin.initializeApp({
        credential: admin.credential.cert(credentials)
    });
    isInitialized = true;
    return admin;
}
export default admin;
//# sourceMappingURL=firebase.js.map