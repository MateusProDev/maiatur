import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { StatusReserva } from "../types/reservas";

/**
 * Cria uma nova reserva no Firestore
 * @param {Object} dados - Dados completos da reserva validados pelo Zod
 * @returns {Promise<string>} ID da reserva criada
 */
export const criarReserva = async (dados) => {
  try {
    // Preparar dados para salvar
    // Normalizar/alinhar campos para garantir compatibilidade com email/voucher/admin
    const normalizeBeforeSave = (d) => {
      const detalhes = d.detalhes || {};
      // mover campos planos para detalhes se não existirem
      detalhes.nomePasseio = detalhes.nomePasseio || d.passeioDesejado || d.nomePasseio || detalhes.nomePasseio || '';
      detalhes.dataPasseio = detalhes.dataPasseio || d.dataPasseio || '';
      detalhes.horaPasseio = detalhes.horaPasseio || d.horaPasseio || '';
      detalhes.horaSaida = detalhes.horaSaida || d.horaSaida || '';
      detalhes.horaRetorno = detalhes.horaRetorno || d.horaRetorno || '';
      detalhes.localSaida = detalhes.localSaida || d.localSaida || '';
      detalhes.tipoVeiculo = detalhes.tipoVeiculo || d.tipoPasseioVeiculo || d.tipoTransferVeiculo || d.tipoVeiculo || '';
      detalhes.destinoTransfer = detalhes.destinoTransfer || d.destinoTransfer || '';
      detalhes.numeroVoo = detalhes.numeroVoo || d.numeroVoo || '';
      detalhes.dataHoraChegada = detalhes.dataHoraChegada || d.dataHoraChegada || '';
      detalhes.dataHoraSaida = detalhes.dataHoraSaida || d.dataHoraSaida || '';

      return Object.assign({}, d, { detalhes });
    };

    const reservaReady = normalizeBeforeSave(dados);

    const reservaData = {
      ...reservaReady,
      status: StatusReserva.PENDENTE,
      criadaEm: serverTimestamp(),
      atualizadaEm: serverTimestamp(),
      // Normalizar telefone
      responsavel: {
        ...reservaReady.responsavel,
        telefone: normalizarTelefone(reservaReady.responsavel.telefone)
      },
      // Parsear lista de passageiros
      passageirosLista: parsePassageiros(reservaReady.passageiros || reservaReady.passageirosTexto || ''),
      // Manter string original também
      passageirosTexto: reservaReady.passageiros || reservaReady.passageirosTexto || ''
    };

    // Adicionar ao Firestore
    const docRef = await addDoc(collection(db, "reservas"), reservaData);
    
    console.log("✅ Reserva criada com sucesso:", docRef.id);
    
    // Enviar email via Vercel Serverless Function
    try {
      const response = await fetch("/api/enviar-email-reserva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reserva: reservaData,
          reservaId: docRef.id,
        }),
      });
      
      if (response.ok) {
        console.log("✅ Email enviado com sucesso!");
      } else {
        console.warn("⚠️ Erro ao enviar email, mas reserva foi criada");
      }
    } catch (emailError) {
      console.warn("⚠️ Falha ao enviar email:", emailError.message);
      // Não falha a reserva se o email não for enviado
    }
    
    return docRef.id;
    
  } catch (error) {
    console.error("❌ Erro ao criar reserva:", error);
    throw new Error(`Erro ao criar reserva: ${error.message}`);
  }
};

/**
 * Normaliza o telefone removendo caracteres especiais
 */
export const normalizarTelefone = (telefone) => {
  return telefone.replace(/\D/g, '');
};

/**
 * Faz parse da string de passageiros para array de objetos
 */
export const parsePassageiros = (textoPassageiros) => {
  const linhas = textoPassageiros.split('\n').filter(l => l.trim());
  
  return linhas.map((linha, index) => {
    const match = linha.match(/^(.+?)\s*(?:\(?(CPF|RG|Passaporte)\)?[:.]?\s*([^\s-]+))?(?:\s*-\s*(.+))?$/i);
    
    if (match) {
      const [, nome, tipoDoc, numDoc, idade] = match;
      return {
        id: index + 1,
        nome: nome.trim(),
        documento: tipoDoc ? { tipo: tipoDoc.toUpperCase(), numero: numDoc.trim() } : null,
        idade: idade ? idade.trim() : null
      };
    }
    
    return {
      id: index + 1,
      nome: linha.trim(),
      documento: null,
      idade: null
    };
  });
};

/**
 * Busca reservas com filtros
 */
export const buscarReservas = async (filtros = {}) => {
  try {
    let q = collection(db, "reservas");
    
    // Aplicar filtros
    if (filtros.tipo) {
      q = query(q, where("tipo", "==", filtros.tipo));
    }
    if (filtros.status) {
      q = query(q, where("status", "==", filtros.status));
    }
    if (filtros.email) {
      q = query(q, where("responsavel.email", "==", filtros.email));
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    q = query(q, orderBy("criadaEm", "desc"));
    
    // Limitar resultados
    if (filtros.limite) {
      q = query(q, limit(filtros.limite));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error("❌ Erro ao buscar reservas:", error);
    throw new Error(`Erro ao buscar reservas: ${error.message}`);
  }
};

/**
 * Busca lista de opções (passeios, hotéis, etc)
 */
export const buscarLista = async (tipo) => {
  try {
    // Buscar diretamente pelo ID do documento
    const docRef = doc(db, "listas", tipo);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items || [];
    }
    
    return [];
    
  } catch (error) {
    console.error(`❌ Erro ao buscar lista ${tipo}:`, error);
    return []; // Retorna array vazio em caso de erro
  }
};

/**
 * Busca pacotes por categoria
 * @param {string} categoria - Categoria do pacote (passeio, transfer_chegada, etc)
 * @returns {Promise<Array>} Lista de pacotes da categoria
 */
export const buscarPacotesPorCategoria = async (categoria) => {
  try {
    console.log(`🔍 Buscando pacotes com categoria: ${categoria}`);
    
    // Buscar todos os pacotes e filtrar localmente
    const q = query(collection(db, "pacotes"));
    
    const querySnapshot = await getDocs(q);
    const pacotes = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(pacote => {
        // Filtra pacotes que pertencem à categoria (principal ou adicional)
        const categoriaPrincipalMatch = pacote.categoria === categoria;
        const categoriasAdicionaisMatch = pacote.categorias && 
          Array.isArray(pacote.categorias) && 
          pacote.categorias.includes(categoria);
        
        return categoriaPrincipalMatch || categoriasAdicionaisMatch;
      });
    
    console.log(`✅ Encontrados ${pacotes.length} pacotes na categoria ${categoria}:`, pacotes);
    return pacotes;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar pacotes da categoria ${categoria}:`, error);
    return [];
  }
};

