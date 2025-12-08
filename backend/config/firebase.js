import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;
let auth = null;

export const initializeFirebase = () => {
    try {
        // Check if running in Cloud Functions (admin already initialized)
        if (admin.apps.length > 0) {
            console.log('✅ Firebase Admin already initialized (Cloud Functions)');
            db = admin.firestore();
            auth = admin.auth();
            return { db, auth };
        }

        // Local development - use service account
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json';
        const serviceAccount = JSON.parse(
            readFileSync(join(__dirname, '..', serviceAccountPath), 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        db = admin.firestore();
        auth = admin.auth();

        console.log('✅ Firebase Admin SDK initialized successfully');
        return { db, auth };
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.log('💡 Make sure to:');
        console.log('   1. Download service account key from Firebase Console');
        console.log('   2. Place it in backend/config/serviceAccountKey.json');
        console.log('   3. Update FIREBASE_SERVICE_ACCOUNT_PATH in .env if needed');
        process.exit(1);
    }
};

export const getDb = () => {
    if (!db) {
        // If not initialized yet, try to get from existing admin instance
        if (admin.apps.length > 0) {
            db = admin.firestore();
            return db;
        }
        throw new Error('Firestore not initialized. Call initializeFirebase() first.');
    }
    return db;
};

export const getAuth = () => {
    if (!auth) {
        // If not initialized yet, try to get from existing admin instance
        if (admin.apps.length > 0) {
            auth = admin.auth();
            return auth;
        }
        throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
    }
    return auth;
};

export default admin;
