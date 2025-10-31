/**
 * Script para adicionar campo "categoria" aos pacotes existentes
 * Execute este arquivo uma vez para migrar os dados
 */

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const migrarCategoriaPacotes = async () => {
  try {
    console.log('🔄 Iniciando migração de categorias...');
    
    const querySnapshot = await getDocs(collection(db, 'pacotes'));
    let atualizados = 0;
    
    for (const docSnap of querySnapshot.docs) {
      const dados = docSnap.data();
      
      // Se não tem categoria, adicionar "passeio" como padrão
      if (!dados.categoria) {
        await updateDoc(doc(db, 'pacotes', docSnap.id), {
          categoria: 'passeio'
        });
        console.log(`✅ Pacote "${dados.titulo}" atualizado com categoria "passeio"`);
        atualizados++;
      } else {
        console.log(`⏭️  Pacote "${dados.titulo}" já tem categoria: ${dados.categoria}`);
      }
    }
    
    console.log(`\n✅ Migração concluída! ${atualizados} pacotes atualizados.`);
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
};

export default migrarCategoriaPacotes;
