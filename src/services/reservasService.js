import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { TipoReserva, StatusReserva } from "../types/reservas";

/**
 * Cria uma nova reserva no Firestore
 * @param {Object} dados - Dados completos da reserva validados pelo Zod
 * @returns {Promise<string>} ID da reserva criada
 */
export const criarReserva = async (dados) => {
  try {
    // Preparar dados para salvar
    const reservaData = {
      ...dados,
      status: StatusReserva.PENDENTE,
      criadaEm: serverTimestamp(),
      atualizadaEm: serverTimestamp(),
      // Normalizar telefone
      responsavel: {
        ...dados.responsavel,
        telefone: normalizarTelefone(dados.responsavel.telefone)
      },
      // Parsear lista de passageiros
      passageirosLista: parsePassageiros(dados.passageiros),
      // Manter string original também
      passageirosTexto: dados.passageiros
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
    const q = query(
      collection(db, "listas"),
      where("tipo", "==", tipo),
      where("ativo", "==", true),
      orderBy("ordem", "asc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error(`❌ Erro ao buscar lista ${tipo}:`, error);
    return []; // Retorna array vazio em caso de erro
  }
};
