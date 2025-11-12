// INSTRUÇÕES: Execute este arquivo através do console do navegador
// 1. Acesse http://localhost:3000/admin/services
// 2. Abra o console (F12)
// 3. Cole este código e pressione Enter

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwxcShz_SMx7PG8gzTOvjjkG7SbJ7PBcw",
  authDomain: "maiatur.firebaseapp.com",
  projectId: "maiatur",
  storageBucket: "maiatur.firebasestorage.app",
  messagingSenderId: "1037976703161",
  appId: "1:1037976703161:web:124bbc5c66546180d04b68"
};

const app = initializeApp(firebaseConfig, 'temp-init');
const db = getFirestore(app);

const servicesData = {
  active: true,
  badge: 'Experiências Personalizadas',
  title: 'Nossos Serviços',
  subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
  services: [
    {
      id: 1731340800000,
      title: 'Transfers & Receptivo',
      description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
      image: '/aviaoservico.png',
      color: '#21A657',
      link: '/pacotes',
      linkText: 'Saiba mais'
    },
    {
      id: 1731340800001,
      title: 'Passeios Privativos',
      description: 'Experiências exclusivas com roteiros personalizados para você',
      image: '/jericoaquaraservico.png',
      color: '#EE7C35',
      link: '/pacotes',
      linkText: 'Saiba mais'
    },
    {
      id: 1731340800002,
      title: 'City Tours',
      description: 'Conheça as principais atrações e cultura local com nossos guias',
      image: '/fortalezacityservico.png',
      color: '#F8C144',
      link: '/pacotes',
      linkText: 'Saiba mais'
    }
  ]
};

try {
  await setDoc(doc(db, 'content', 'servicesSection'), servicesData);
  console.log('✅ 3 serviços adicionados com sucesso!');
  console.log('Recarregue a página para ver os 3 serviços.');
} catch (error) {
  console.error('❌ Erro:', error);
}
