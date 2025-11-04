// Script para adicionar o campo 'views' em posts que não têm
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Configuração do Firebase (use as mesmas configurações do seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyDNzsIpah5nHf3Ae84hxJn2OqvLPONl_TE",
  authDomain: "maiatur-2024.firebaseapp.com",
  projectId: "maiatur-2024",
  storageBucket: "maiatur-2024.firebasestorage.app",
  messagingSenderId: "596776677646",
  appId: "1:596776677646:web:5e32dcc75bd8a0b63c7a18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixBlogViews() {
  try {
    console.log('🔍 Buscando posts no Firestore...');
    const postsRef = collection(db, 'blogPosts');
    const snapshot = await getDocs(postsRef);
    
    console.log(`📊 Total de posts encontrados: ${snapshot.size}`);
    
    let updated = 0;
    let alreadyHasViews = 0;
    
    for (const postDoc of snapshot.docs) {
      const data = postDoc.data();
      const postId = postDoc.id;
      
      console.log(`\n📝 Post: ${data.title}`);
      console.log(`   ID: ${postId}`);
      console.log(`   Views atual: ${data.views !== undefined ? data.views : 'UNDEFINED'}`);
      
      if (data.views === undefined) {
        console.log('   ⚠️  Campo views não existe! Adicionando...');
        await updateDoc(doc(db, 'blogPosts', postId), {
          views: 0
        });
        console.log('   ✅ Campo views adicionado com valor 0');
        updated++;
      } else {
        console.log('   ✓  Campo views já existe');
        alreadyHasViews++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO:');
    console.log(`   Total de posts: ${snapshot.size}`);
    console.log(`   Posts atualizados: ${updated}`);
    console.log(`   Posts que já tinham views: ${alreadyHasViews}`);
    console.log('='.repeat(50));
    console.log('\n✅ Script finalizado com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

fixBlogViews();
