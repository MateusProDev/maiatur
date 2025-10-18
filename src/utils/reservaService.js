// src/utils/reservaService.js
// Serviço para gerenciar reservas
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Cria uma nova reserva no Firestore
 * @param {Object} dadosReserva - Dados da reserva
 * @returns {Promise<string>} ID da reserva criada
 */
export const criarReserva = async (dadosReserva) => {
  try {
    const docRef = await addDoc(collection(db, 'reservas'), {
      ...dadosReserva,
      dataReserva: serverTimestamp(),
      status: 'pendente'
    });
    
    console.log('✅ Reserva criada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar reserva:', error);
    throw error;
  }
};

export default {
  criarReserva
};