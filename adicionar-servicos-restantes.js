// Script para adicionar os serviços 2 e 3 no Firestore
// Execute: node adicionar-servicos-restantes.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const servico2 = {
  id: 1762897392423,
  title: 'Passeios Privativos',
  description: 'Experiências exclusivas com roteiros personalizados para você',
  image: '/jericoaquaraservico.png',
  color: '#EE7C35',
  link: '/pacotes',
  linkText: 'Saiba mais'
};

const servico3 = {
  id: 1762897392424,
  title: 'City Tours',
  description: 'Conheça as principais atrações e cultura local com nossos guias',
  image: '/fortalezacityservico.png',
  color: '#F8C144',
  link: '/pacotes',
  linkText: 'Saiba mais'
};

async function adicionarServicos() {
  try {
    console.log('🚀 Adicionando serviços 2 e 3...');
    
    const docRef = doc(db, 'content', 'servicesSection');
    
    await updateDoc(docRef, {
      services: arrayUnion(servico2, servico3)
    });
    
    console.log('✅ Serviços adicionados com sucesso!');
    console.log('   2. Passeios Privativos');
    console.log('   3. City Tours');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

adicionarServicos();
