// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig"; // Importando a configuração

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Exportando os serviços
const auth = getAuth(app);
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
