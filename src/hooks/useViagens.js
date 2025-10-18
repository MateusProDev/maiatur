// src/hooks/useViagens.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { 
  criarViagem, 
  atualizarViagem, 
  buscarViagens, 
  converterReservaParaViagem 
} from '../utils/firestoreUtils';

/**
 * Hook customizado para gerenciar viagens
 */
export const useViagens = (filtros = {}) => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let viagensQuery = collection(db, 'viagens');
    
    // Aplica filtros
    if (filtros.status) {
      viagensQuery = query(viagensQuery, where('status', '==', filtros.status));
    }
    
    if (filtros.clienteId) {
      viagensQuery = query(viagensQuery, where('clienteId', '==', filtros.clienteId));
    }
    
    if (filtros.motoristaId) {
      viagensQuery = query(viagensQuery, where('motoristaIdaId', '==', filtros.motoristaId));
    }
    
    // Ordena por data de criação
    viagensQuery = query(viagensQuery, orderBy('createdAt', 'desc'));
    
    // Listener em tempo real
    const unsubscribe = onSnapshot(
      viagensQuery, 
      (snapshot) => {
        const viagensData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(viagem => !viagem.isExemplo); // Remove documento de exemplo
        
        setViagens(viagensData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro ao escutar viagens:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filtros.status, filtros.clienteId, filtros.motoristaId]);

  const criarNovaViagem = async (dados) => {
    try {
      setLoading(true);
      const resultado = await criarViagem(dados);
      setLoading(false);
      return resultado;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const atualizarViagemExistente = async (viagemId, updates) => {
    try {
      const resultado = await atualizarViagem(viagemId, updates);
      return resultado;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const converterReserva = async (reservaId, reservaData) => {
    try {
      setLoading(true);
      const resultado = await converterReservaParaViagem(reservaId, reservaData);
      setLoading(false);
      return resultado;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    viagens,
    loading,
    error,
    criarNovaViagem,
    atualizarViagemExistente,
    converterReserva,
    refetch: () => {
      setLoading(true);
      // O listener irá atualizar automaticamente
    }
  };
};

/**
 * Hook para buscar uma viagem específica
 */
export const useViagem = (viagemId) => {
  const [viagem, setViagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!viagemId) {
      setLoading(false);
      return;
    }

    const viagemRef = doc(db, 'viagens', viagemId);
    const unsubscribe = onSnapshot(
      viagemRef,
      (doc) => {
        if (doc.exists()) {
          setViagem({ id: doc.id, ...doc.data() });
        } else {
          setViagem(null);
          setError('Viagem não encontrada');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao buscar viagem:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [viagemId]);

  return { viagem, loading, error };
};
