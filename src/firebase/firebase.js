// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig"; // Importando a configuração

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Auth is created only when a feature actually needs it. This avoids loading
// the Firebase Auth iframe on public pages.
let authInstance = null;
const auth = new Proxy({}, {
  get(_target, property) {
    authInstance ||= getAuth(app);
    const value = authInstance[property];
    return typeof value === 'function' ? value.bind(authInstance) : value;
  }
});
const db = getFirestore(app);
const storage = getStorage(app);

// Inicializar Google Analytics 4 (apenas no browser)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Google Analytics 4 inicializado:', firebaseConfig.measurementId);
    }
  }).catch(err => {
    console.warn('⚠️ Google Analytics não suportado:', err);
  });
}

export { auth, db, storage, analytics };
