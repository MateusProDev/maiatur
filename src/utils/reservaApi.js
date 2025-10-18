import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, setDoc } from 'firebase/firestore';

// Utilitário para logar erros e debug detalhado
function logFirestoreError(context, error, extra = {}) {
  // eslint-disable-next-line no-console
  console.error(`[Firestore][${context}] ERRO:`, error, extra);
  if (error && error.code) {
    // eslint-disable-next-line no-console
    console.error(`[Firestore][${context}] Código: ${error.code} | Mensagem: ${error.message}`);
  }
}

function logFirestoreDebug(context, message, extra = {}) {
  // eslint-disable-next-line no-console
  console.debug(`[Firestore][${context}] DEBUG: ${message}`, extra);
}

// Criar reserva
export async function criarReserva(reserva) {
  logFirestoreDebug('criarReserva', 'Entrada', { reserva });
  try {
    const docRef = await addDoc(collection(db, 'reservas'), { ...reserva, status: 'pendente', motoristaId: null });
    logFirestoreDebug('criarReserva', 'Reserva criada', { id: docRef.id });
    return docRef.id;
  } catch (error) {
    logFirestoreError('criarReserva', error, { reserva });
    throw new Error('Erro ao criar reserva: ' + (error?.message || error));
  }
}

// Listar reservas
export async function listarReservas() {
  logFirestoreDebug('listarReservas', 'Entrada');
  try {
    const q = query(collection(db, 'reservas'));
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // Função auxiliar para converter Timestamp para string
      const tsToDate = ts => (ts && typeof ts === 'object' && ts.seconds)
        ? new Date(ts.seconds * 1000)
        : ts;

      // Converte campos de data/hora
      let dataReserva = data.dataReserva || data.data;
      let dataViagem = data.dataViagem;
      let horaReserva = data.hora;
      let createdAt = data.createdAt;

      if (dataReserva && typeof dataReserva === 'object' && dataReserva.seconds) {
        const d = tsToDate(dataReserva);
        dataReserva = d.toLocaleString();
      }
      if (dataViagem && typeof dataViagem === 'object' && dataViagem.seconds) {
        const d = tsToDate(dataViagem);
        dataViagem = d.toLocaleString();
      }
      if (horaReserva && typeof horaReserva === 'object' && horaReserva.seconds) {
        const d = tsToDate(horaReserva);
        horaReserva = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
        const d = tsToDate(createdAt);
        createdAt = d.toLocaleString();
      }

      // Corrige statusHistory se existir
      let statusHistory = data.statusHistory;
      if (Array.isArray(statusHistory)) {
        statusHistory = statusHistory.map(item => ({
          ...item,
          date: (item.date && typeof item.date === 'object' && item.date.seconds)
            ? tsToDate(item.date).toLocaleString()
            : item.date
        }));
      }

      return {
        id: docSnap.id,
        ...data,
        dataReserva,
        dataViagem,
        hora: horaReserva,
        createdAt,
        statusHistory
      };
    });
    logFirestoreDebug('listarReservas', 'Saída', { count: result.length });
    return result;
  } catch (error) {
    logFirestoreError('listarReservas', error);
    throw new Error('Erro ao listar reservas: ' + (error?.message || error));
  }
}

// Delegar reserva para motorista
export async function delegarReserva(reservaId, motoristaId) {
  logFirestoreDebug('delegarReserva', 'Entrada', { reservaId, motoristaId });
  try {
    const reservaRef = doc(db, 'reservas', reservaId);
    await updateDoc(reservaRef, { status: 'delegada', motoristaId });
    logFirestoreDebug('delegarReserva', 'Reserva delegada', { reservaId, motoristaId });
  } catch (error) {
    logFirestoreError('delegarReserva', error, { reservaId, motoristaId });
    throw new Error('Erro ao delegar reserva: ' + (error?.message || error));
  }
}

// Listar reservas de um motorista
export async function listarReservasMotorista(motoristaId) {
  logFirestoreDebug('listarReservasMotorista', 'Entrada', { motoristaId });
  try {
    const q = query(collection(db, 'reservas'), where('motoristaId', '==', motoristaId));
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logFirestoreDebug('listarReservasMotorista', 'Saída', { count: result.length });
    return result;
  } catch (error) {
    logFirestoreError('listarReservasMotorista', error, { motoristaId });
    throw new Error('Erro ao listar reservas do motorista: ' + (error?.message || error));
  }
}

// Cadastrar motorista
// Salva o motorista usando o UID do Auth como ID do documento
export async function cadastrarMotorista(motorista, uid) {
  logFirestoreDebug('cadastrarMotorista', 'Entrada', { motorista, uid });
  try {
    await setDoc(doc(db, 'motoristas', uid), { ...motorista, lucroTotal: 0 });
    logFirestoreDebug('cadastrarMotorista', 'Motorista cadastrado', { uid });
    return uid;
  } catch (error) {
    logFirestoreError('cadastrarMotorista', error, { motorista, uid });
    throw new Error('Erro ao cadastrar motorista: ' + (error?.message || error));
  }
}

// Listar motoristas
export async function listarMotoristas() {
  logFirestoreDebug('listarMotoristas', 'Entrada');
  try {
    const q = query(collection(db, 'motoristas'));
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logFirestoreDebug('listarMotoristas', 'Saída', { count: result.length });
    return result;
  } catch (error) {
    logFirestoreError('listarMotoristas', error);
    throw new Error('Erro ao listar motoristas: ' + (error?.message || error));
  }
}
