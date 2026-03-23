import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyClGdcZxQ0onN45uqIOdvuau8MjUyU7OsI",
  authDomain: "my-luzori-project-123654.firebaseapp.com",
  projectId: "my-luzori-project-123654",
  storageBucket: "my-luzori-project-123654.firebasestorage.app",
  messagingSenderId: "757036218013",
  appId: "1:757036218013:web:ac03f397c517201c0ec674",
  measurementId: "G-QHDN079TVQ"
};

// Initialize Firebase only if it hasn't been initialized already (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
