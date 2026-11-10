import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Configuration provided by user and firebase-applet-config.json
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyBXUV6nx4LNIza2jiqFsje1dy0z65-njQY",
  authDomain: firebaseAppletConfig.authDomain || "erp-system-4c6a0.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "erp-system-4c6a0",
  storageBucket: firebaseAppletConfig.storageBucket || "erp-system-4c6a0.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "449072295693",
  appId: firebaseAppletConfig.appId || "1:449072295693:web:1e7031275819f8ceb58a44",
  measurementId: firebaseAppletConfig.measurementId || "G-39VK93P392",
};

// Initialize Firebase once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Database ID configured for this application instance
export const databaseId =
  firebaseAppletConfig.firestoreDatabaseId ||
  "ai-studio-omnicampuserp-4e76130e-d37a-4a19-a5af-4a9e6a020950";

// Initialize Cloud Firestore with auto-detect long polling and multi-tab offline persistence
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    databaseId
  );
} catch {
  firestoreDb = getFirestore(app, databaseId);
}

export const db = firestoreDb;
export default app;
