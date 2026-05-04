import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC12vwi1mfmXTHoHxsaRYUqR-L6nWpRUIs",
  authDomain: "iyte-satranc-ieee.firebaseapp.com",
  projectId: "iyte-satranc-ieee",
  storageBucket: "iyte-satranc-ieee.firebasestorage.app",
  messagingSenderId: "1092966050623",
  appId: "1:1092966050623:web:f7d7d2e511cb16b0c6c18a",
  measurementId: "G-X3N4KCEPGY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
