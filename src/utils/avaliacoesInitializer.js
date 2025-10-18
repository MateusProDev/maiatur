import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const avaliacoesExemplo = [
  {
    userId: 'user_exemplo_1',
    nomeUsuario: 'Maria Silva',
    emailUsuario: 'maria.silva@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=1',
    nota: 5,
    comentario: 'O tour pela favela foi simplesmente fantástico! O guia local conhecia todos os detalhes da história e cultura. A vista é de tirar o fôlego. Recomendo muito!',
    status: 'aprovada',
    verificado: true,
    likes: 23,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    userId: 'user_exemplo_2',
    nomeUsuario: 'João Santos',
    emailUsuario: 'joao.santos@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=2',
    nota: 4,
    comentario: 'A experiência foi muito boa! O guia era simpático e conhecedor da região. Aprendemos muito sobre a história local e a vista panorâmica é impressionante.',
    status: 'aprovada',
    verificado: false,
    likes: 15,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    userId: 'user_exemplo_3',
    nomeUsuario: 'Ana Costa',
    emailUsuario: 'ana.costa@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=3',
    nota: 5,
    comentario: 'Fiz o tour noturno e foi uma experiência única! Ver a cidade iluminada lá de cima é mágico. O guia contou histórias fascinantes sobre a comunidade.',
    status: 'aprovada',
    verificado: true,
    likes: 31,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    userId: 'user_exemplo_4',
    nomeUsuario: 'Carlos Oliveira',
    emailUsuario: 'carlos.oliveira@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=4',
    nota: 4,
    comentario: 'O tour me fez entender melhor a realidade e a riqueza cultural da comunidade. O guia foi muito profissional e respeitoso. As fotos ficaram incríveis!',
    status: 'aprovada',
    verificado: false,
    likes: 12,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    userId: 'user_exemplo_5',
    nomeUsuario: 'Lucia Ferreira',
    emailUsuario: 'lucia.ferreira@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=5',
    nota: 5,
    comentario: 'Já fiz vários tours pelo Rio e este foi disparado o melhor! A perspectiva da cidade é única, o guia é muito carismático. Me senti totalmente segura!',
    status: 'aprovada',
    verificado: true,
    likes: 45,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    userId: 'user_exemplo_6',
    nomeUsuario: 'Roberto Lima',
    emailUsuario: 'roberto.lima@email.com',
    avatarUsuario: 'https://i.pravatar.cc/150?img=6',
    nota: 4,
    comentario: 'Levei minha família toda e foi um sucesso! As crianças adoraram conhecer a cultura local e o guia soube adaptar o conteúdo para todas as idades.',
    status: 'aprovada',
    verificado: false,
    likes: 18,
    denuncias: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

export const inicializarAvaliacoes = async () => {
  try {
    console.log('Verificando se já existem avaliações...');
    
    const avaliacoesRef = collection(db, 'avaliacoes');
    const snapshot = await getDocs(avaliacoesRef);
    
    if (!snapshot.empty) {
      console.log('Avaliações já existem. Nenhuma ação necessária.');
      return { success: true, message: 'Avaliações já existem' };
    }

    console.log('Criando avaliações de exemplo...');
    
    const promises = avaliacoesExemplo.map(async (avaliacao) => {
      try {
        const docRef = await addDoc(avaliacoesRef, avaliacao);
        console.log(`Avaliação criada com ID: ${docRef.id}`);
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        return { success: false, error: error.message };
      }
    });

    const resultados = await Promise.all(promises);
    const sucessos = resultados.filter(r => r.success).length;
    const erros = resultados.filter(r => !r.success).length;

    console.log(`Avaliações criadas: ${sucessos} sucessos, ${erros} erros`);

    return {
      success: true,
      message: `${sucessos} avaliações criadas com sucesso`,
      detalhes: { sucessos, erros }
    };

  } catch (error) {
    console.error('Erro ao inicializar avaliações:', error);
    return {
      success: false,
      message: 'Erro ao inicializar avaliações',
      error: error.message
    };
  }
};