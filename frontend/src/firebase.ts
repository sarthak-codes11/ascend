import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY as string,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.REACT_APP_FIREBASE_APP_ID as string,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

if (window.location.hostname === "localhost") {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
  } catch (e) {}
  try {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } catch (e) {}
}

export { app, auth, db };
