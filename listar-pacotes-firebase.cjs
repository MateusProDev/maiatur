// Script para listar todos os pacotes do Firestore com todas as informações
// Execute: node listar-pacotes-firebase.cjs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyBwxcShz_SMx7PG8gzTOvjjkG7SbJ7PBcw",
  authDomain: "maiatur.firebaseapp.com",
  projectId: "maiatur",
  storageBucket: "maiatur.firebasestorage.app",
  messagingSenderId: "1037976703161",
  appId: "1:1037976703161:web:124bbc5c66546180d04b68",
  measurementId: "G-PTWQ45MF15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listarPacotes() {
  try {
    console.log('='.repeat(80));
    console.log('  LISTANDO TODOS OS PACOTES DO FIREBASE - Maiatur');
    console.log('='.repeat(80));
    console.log('');

    const pacotesRef = collection(db, 'pacotes');
    const snapshot = await getDocs(pacotesRef);

    if (snapshot.empty) {
      console.log('❌ Nenhum pacote encontrado na collection "pacotes".');
      process.exit(0);
    }

    console.log(`✅ Total de pacotes encontrados: ${snapshot.size}`);
    console.log('');

    const pacotes = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      pacotes.push({
        id: doc.id,
        ...data
      });
    });

    // Exibir cada pacote no console de forma organizada
    pacotes.forEach((pacote, index) => {
      console.log('-'.repeat(80));
      console.log(`📦 PACOTE ${index + 1} / ${pacotes.length}`);
      console.log('-'.repeat(80));
      console.log(`  ID do Documento: ${pacote.id}`);
      
      // Exibir todos os campos do pacote
      const campos = Object.keys(pacote).filter(k => k !== 'id').sort();
      
      campos.forEach((campo) => {
        const valor = pacote[campo];
        
        if (valor === null || valor === undefined) {
          console.log(`  ${campo}: (vazio)`);
        } else if (typeof valor === 'object' && valor.toDate) {
          // Timestamp do Firestore
          console.log(`  ${campo}: ${valor.toDate().toLocaleString('pt-BR')}`);
        } else if (Array.isArray(valor)) {
          console.log(`  ${campo}: [Array com ${valor.length} itens]`);
          valor.forEach((item, i) => {
            if (typeof item === 'object') {
              console.log(`    [${i}]: ${JSON.stringify(item, null, 6).substring(0, 200)}`);
            } else {
              console.log(`    [${i}]: ${item}`);
            }
          });
        } else if (typeof valor === 'object') {
          console.log(`  ${campo}: ${JSON.stringify(valor, null, 4).substring(0, 300)}`);
        } else if (typeof valor === 'string' && valor.length > 100) {
          console.log(`  ${campo}: ${valor.substring(0, 100)}...`);
        } else {
          console.log(`  ${campo}: ${valor}`);
        }
      });
      
      console.log('');
    });

    // Resumo dos campos encontrados
    console.log('='.repeat(80));
    console.log('  RESUMO DOS CAMPOS ENCONTRADOS');
    console.log('='.repeat(80));
    
    const todosCampos = new Set();
    pacotes.forEach(p => {
      Object.keys(p).forEach(k => todosCampos.add(k));
    });
    
    const camposOrdenados = [...todosCampos].sort();
    console.log(`\nCampos existentes (${camposOrdenados.length}):`);
    camposOrdenados.forEach(c => {
      const quantos = pacotes.filter(p => p[c] !== undefined && p[c] !== null).length;
      console.log(`  • ${c} — presente em ${quantos}/${pacotes.length} pacotes`);
    });

    // Resumo por categoria (se existir)
    const categorias = {};
    pacotes.forEach(p => {
      const cat = p.category || p.categoria || 'Sem categoria';
      if (!categorias[cat]) categorias[cat] = 0;
      categorias[cat]++;
    });

    console.log(`\n📂 Pacotes por categoria:`);
    Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, qtd]) => {
      console.log(`  • ${cat}: ${qtd} pacotes`);
    });

    // Salvar JSON completo com todos os dados
    const jsonOutput = JSON.stringify(pacotes, (key, value) => {
      // Converter Timestamps do Firestore para string legível
      if (value && typeof value === 'object' && value.seconds && value.nanoseconds !== undefined) {
        return new Date(value.seconds * 1000).toISOString();
      }
      return value;
    }, 2);

    const outputFile = 'pacotes-firebase-export.json';
    fs.writeFileSync(outputFile, jsonOutput, 'utf8');
    console.log(`\n💾 Dados completos salvos em: ${outputFile}`);
    console.log(`   Tamanho do arquivo: ${(Buffer.byteLength(jsonOutput) / 1024).toFixed(1)} KB`);

    console.log('\n' + '='.repeat(80));
    console.log('  CONCLUÍDO!');
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao listar pacotes:', error.message);
    console.error(error);
    process.exit(1);
  }
}

listarPacotes();
