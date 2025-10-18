// src/utils/firestoreUtils.js
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';

/**
 * Inicializa automaticamente as coleções e estruturas necessárias no Firestore
 */
export const initializeFirestoreCollections = async () => {
  try {
    console.debug('[firestoreUtils] Inicializando estruturas do Firestore...');

    // 1. Configuração de viagens
    await initializeViagemSettings();
    
    // 2. Coleção de viagens
    await initializeViagensCollection();
    
    // 3. Coleção de pacotes com campos de ida e volta
    await initializePacotesIdaVolta();
    
    console.debug('[firestoreUtils] Estruturas do Firestore inicializadas com sucesso!');
    return true;
  } catch (error) {
    console.error('[firestoreUtils] Erro ao inicializar Firestore:', error);
    return false;
  }
};

/**
 * Configura as configurações padrão para viagens
 */
const initializeViagemSettings = async () => {
  const settingsRef = doc(db, 'settings', 'viagens');
  const settingsDoc = await getDoc(settingsRef);
  
  if (!settingsDoc.exists()) {
    const defaultSettings = {
      porcentagemSinalPadrao: 40,
      statusDisponiveis: [
        'reservado',
        'ida_iniciada', 
        'ida_finalizada',
        'volta_iniciada',
        'volta_finalizada',
        'cancelado'
      ],
      statusPagamento: [
        'pendente',
        'sinal_pago',
        'pago_completo'
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(settingsRef, defaultSettings);
    console.debug('[firestoreUtils] Configurações de viagem criadas');
  }
};

// Remove campos undefined e retorna objeto limpo
function sanitizeFirestoreData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean;
}

/**
 * Cria um documento de exemplo na coleção viagens para garantir que ela existe
 */
const initializeViagensCollection = async () => {
  const viagensRef = collection(db, 'viagens');
  const exemploRef = doc(viagensRef, 'exemplo_estrutura');
  const exemploSnap = await getDoc(exemploRef);
  if (!exemploSnap.exists()) {
    const exemploViagem = sanitizeFirestoreData({
      isExemplo: true,
      pacoteId: 'string',
      clienteId: 'string',
      isIdaEVolta: false,
      dataIda: '',
      dataVolta: '',
      horaIda: '',
      horaVolta: '',
      motoristaIdaId: '',
      motoristaVoltaId: '',
      status: 'string',
      valorTotal: 0,
      porcentagemSinal: 0,
      valorSinal: 0,
      valorRestante: 0,
      statusPagamento: 'pendente',
      pontoPartida: '',
      pontoDestino: '',
      observacoesIda: '',
      observacoesVolta: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(exemploRef, exemploViagem);
    console.debug('[firestoreUtils] Documento de exemplo da coleção viagens criado com todos os campos.');
  } else {
    // Atualiza o documento para garantir que todos os campos estejam presentes
    const data = exemploSnap.data();
    const requiredFields = {
      isExemplo: true,
      pacoteId: 'string',
      clienteId: 'string',
      isIdaEVolta: false,
      dataIda: '',
      dataVolta: '',
      horaIda: '',
      horaVolta: '',
      motoristaIdaId: '',
      motoristaVoltaId: '',
      status: 'string',
      valorTotal: 0,
      porcentagemSinal: 0,
      valorSinal: 0,
      valorRestante: 0,
      statusPagamento: 'pendente',
      pontoPartida: '',
      pontoDestino: '',
      observacoesIda: '',
      observacoesVolta: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    let needsUpdate = false;
    for (const key in requiredFields) {
      if (!(key in data)) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      await setDoc(exemploRef, sanitizeFirestoreData({ ...requiredFields, ...data }), { merge: true });
      console.debug('[firestoreUtils] Documento de exemplo da coleção viagens atualizado com campos obrigatórios.');
    }
  }
};

/**
 * Atualiza pacotes existentes para incluir campos de ida e volta
 */
const initializePacotesIdaVolta = async () => {
  const pacotesRef = collection(db, 'pacotes');
  const pacotesSnapshot = await getDocs(pacotesRef);
  
  let pacotesAtualizados = 0;
  
  for (const pacoteDoc of pacotesSnapshot.docs) {
    const pacoteData = pacoteDoc.data();
    
    // Verifica se já tem os campos de ida e volta
    if (!pacoteData.hasOwnProperty('isIdaEVolta')) {
      const updatedPacote = {
        ...pacoteData,
        // Campos para ida e volta
        isIdaEVolta: false,
        precoIda: pacoteData.preco || 0,
        precoVolta: pacoteData.preco || 0,
        precoIdaEVolta: pacoteData.preco ? pacoteData.preco * 1.8 : 0, // 10% desconto na combinação
        porcentagemSinal: 40,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(pacoteDoc.ref, updatedPacote);
      pacotesAtualizados++;
    }
  }
  
  if (pacotesAtualizados > 0) {
    console.debug(`[firestoreUtils] ${pacotesAtualizados} pacotes atualizados com campos ida/volta`);
  }
};

/**
 * Cria uma nova viagem no Firestore
 */
export const criarViagem = async (viagemData) => {
  try {
    const viagensRef = collection(db, 'viagens');
    const novaViagemRef = doc(viagensRef);
    // Alinha todos os campos correlacionados
    const viagem = sanitizeFirestoreData({
      id: novaViagemRef.id,
      // Identificadores
      pacoteId: viagemData.pacoteId || null,
      pacoteTitulo: viagemData.pacoteTitulo || '',
      clienteId: viagemData.clienteId || '',
      reservaOriginalId: viagemData.reservaOriginalId || '',

      // Configuração da viagem
      isIdaEVolta: viagemData.isIdaEVolta ?? false,
      tipoViagem: viagemData.tipoViagem || '',
      dataIda: viagemData.dataIda || '',
      dataVolta: viagemData.dataVolta || '',
      horaIda: viagemData.horaIda || '',
      horaVolta: viagemData.horaVolta || '',

      // Motoristas
      motoristaIdaId: viagemData.motoristaIdaId || '',
      motoristaVoltaId: viagemData.motoristaVoltaId || '',

      // Status
      status: viagemData.status || 'reservado',
      statusPagamento: viagemData.statusPagamento || 'pendente',

      // Financeiro
      valorTotal: parseFloat(viagemData.valorTotal || 0),
      porcentagemSinal: viagemData.porcentagemSinal || 40,
      valorSinal: viagemData.valorSinal || null,
      valorRestante: viagemData.valorRestante || null,
      valorPago: viagemData.valorPago || null,
      valorComDesconto: viagemData.valorComDesconto || null,

      // Localização
      pontoPartida: viagemData.pontoPartida || '',
      pontoDestino: viagemData.pontoDestino || '',

      // Observações
      observacoesIda: viagemData.observacoesIda || '',
      observacoesVolta: viagemData.observacoesVolta || '',

      // Dados do cliente
      clienteNome: viagemData.clienteNome || '',
      clienteEmail: viagemData.clienteEmail || '',
      clienteTelefone: viagemData.clienteTelefone || '',
      clienteCpf: viagemData.clienteCpf || '',

      // Passageiros
      totalPassageiros: viagemData.totalPassageiros || 1,
      adultos: viagemData.adultos || 1,
      criancas: viagemData.criancas || 0,
      infantis: viagemData.infantis || 0,
      passageirosFormatado: viagemData.passageirosFormatado || '',

      // Pagamento
      metodoPagamento: viagemData.metodoPagamento || '',
      pagamento: viagemData.pagamento || null,

      // Metadados
      origem: viagemData.origem || '',
      criadoEm: viagemData.criadoEm || null,
      atualizadoEm: viagemData.atualizadoEm || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(novaViagemRef, viagem);
    console.debug('[firestoreUtils] Viagem criada:', novaViagemRef.id);
    return {
      success: true,
      id: novaViagemRef.id,
      data: viagem
    };
  } catch (error) {
    console.error('[firestoreUtils] Erro ao criar viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Atualiza uma viagem existente
 */
export const atualizarViagem = async (viagemId, updates) => {
  try {
    const viagemRef = doc(db, 'viagens', viagemId);
    const updateData = sanitizeFirestoreData({
      ...updates,
      updatedAt: serverTimestamp()
    });
    await setDoc(viagemRef, updateData, { merge: true });
    console.debug('[firestoreUtils] Viagem atualizada:', viagemId);
    return { success: true };
  } catch (error) {
    console.error('[firestoreUtils] Erro ao atualizar viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Busca viagens com filtros
 */
export const buscarViagens = async (filtros = {}) => {
  try {
    let viagensQuery = collection(db, 'viagens');
    
    // Aplica filtros se fornecidos
    if (filtros.status) {
      viagensQuery = query(viagensQuery, where('status', '==', filtros.status));
    }
    
    if (filtros.clienteId) {
      viagensQuery = query(viagensQuery, where('clienteId', '==', filtros.clienteId));
    }
    
    if (filtros.motoristaId) {
      viagensQuery = query(viagensQuery, where('motoristaIdaId', '==', filtros.motoristaId));
    }
    
    // Ordena por data de criação (mais recentes primeiro)
    viagensQuery = query(viagensQuery, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(viagensQuery);
    const viagens = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(viagem => !viagem.isExemplo); // Remove documento de exemplo
    
    return {
      success: true,
      data: viagens
    };
  } catch (error) {
    console.error('[firestoreUtils] Erro ao buscar viagens:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Converte uma reserva existente em viagem
 */
export const converterReservaParaViagem = async (reservaId, reservaData) => {
  try {
    // Busca dados do pacote se disponível
    let pacoteData = {};
    if (reservaData.pacoteId) {
      const pacoteRef = doc(db, 'pacotes', reservaData.pacoteId);
      const pacoteDoc = await getDoc(pacoteRef);
      if (pacoteDoc.exists()) {
        pacoteData = pacoteDoc.data();
      }
    }
    // Cria dados da viagem baseado na reserva
    const viagemData = sanitizeFirestoreData({
      // Identificadores
      pacoteId: reservaData.pacoteId || null,
      pacoteTitulo: reservaData.pacoteTitulo || pacoteData.titulo || '',
      clienteId: reservaData.userId || reservaData.clienteId,
      reservaOriginalId: reservaId,

      // Configuração da viagem
      isIdaEVolta: reservaData.isIdaEVolta ?? pacoteData.isIdaEVolta ?? false,
      tipoViagem: reservaData.tipoViagem || '',
      dataIda: reservaData.dataIda || reservaData.data || reservaData.dataReserva || '',
      dataVolta: reservaData.dataVolta || '',
      horaIda: reservaData.horaIda || reservaData.hora || reservaData.horario || '',
      horaVolta: reservaData.horaVolta || '',

      // Motoristas
      motoristaIdaId: reservaData.motoristaIdaId || reservaData.motoristaId || '',
      motoristaVoltaId: reservaData.motoristaVoltaId || '',

      // Status
      status: reservaData.status || 'reservado',
      statusPagamento: reservaData.statusPagamento || 'pendente',

      // Financeiro
      valorTotal: parseFloat(reservaData.valorTotal || reservaData.valor || reservaData.preco || pacoteData.preco || 0),
      porcentagemSinal: reservaData.porcentagemSinal || pacoteData.porcentagemSinal || 40,
      valorSinal: reservaData.valorSinal || null,
      valorRestante: reservaData.valorRestante || null,
      valorPago: reservaData.valorPago || null,
      valorComDesconto: reservaData.valorComDesconto || null,

      // Localização
      pontoPartida: reservaData.pontoPartida || reservaData.enderecoOrigem || reservaData.origem || '',
      pontoDestino: reservaData.pontoDestino || reservaData.enderecoDestino || reservaData.destino || pacoteData.titulo || '',

      // Observações
      observacoesIda: reservaData.observacoesIda || reservaData.observacoes || '',
      observacoesVolta: reservaData.observacoesVolta || '',

      // Dados do cliente
      clienteNome: reservaData.clienteNome || reservaData.nome || '',
      clienteEmail: reservaData.clienteEmail || reservaData.email || '',
      clienteTelefone: reservaData.clienteTelefone || reservaData.telefone || '',
      clienteCpf: reservaData.clienteCpf || reservaData.cpf || '',

      // Passageiros
      totalPassageiros: reservaData.totalPassageiros || 1,
      adultos: reservaData.adultos || 1,
      criancas: reservaData.criancas || 0,
      infantis: reservaData.infantis || 0,
      passageirosFormatado: reservaData.passageirosFormatado || '',

      // Pagamento
      metodoPagamento: reservaData.metodoPagamento || '',
      pagamento: reservaData.pagamento || null,

      // Metadados
      origem: 'conversao_reserva',
      criadoEm: reservaData.criadoEm || null,
      atualizadoEm: reservaData.atualizadoEm || null
    });
    // Calcula valores do sinal
    const { valorSinal, valorRestante } = calcularValores(
      viagemData.valorTotal, 
      viagemData.porcentagemSinal
    );
    viagemData.valorSinal = valorSinal;
    viagemData.valorRestante = valorRestante;
    return await criarViagem(viagemData);
  } catch (error) {
    console.error('[firestoreUtils] Erro ao converter reserva para viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calcula valores de sinal e restante
 */
export const calcularValores = (valorTotal, porcentagemSinal) => {
  const valorSinal = (valorTotal * porcentagemSinal) / 100;
  const valorRestante = valorTotal - valorSinal;
  
  return {
    valorSinal: parseFloat(valorSinal.toFixed(2)),
    valorRestante: parseFloat(valorRestante.toFixed(2))
  };
};

/**
 * Inicialização automática quando o módulo for importado
 */
export const autoInitialize = () => {
  // Executa a inicialização após um pequeno delay para garantir que o Firebase esteja pronto
  setTimeout(() => {
    initializeFirestoreCollections().catch(console.error);
  }, 1000);
};
