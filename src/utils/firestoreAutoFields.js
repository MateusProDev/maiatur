import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Sistema para criar automaticamente campos no Firestore
 * Para que você não tenha trabalho de criar campos manualmente
 */

// Estrutura dos novos campos que devem existir nos pacotes
const CAMPOS_OBRIGATORIOS_PACOTE = {
  // Campos de ida e volta
  isIdaEVolta: false,
  precoIda: 0,
  precoVolta: 0,
  precoIdaVolta: 0,
  
  // Configuração de sinal
  sinalConfig: {
    tipo: "porcentagem", // "porcentagem" ou "valor"
    valor: 30, // Valor padrão 30%
    obrigatorio: true
  },
  
  // Campos calculados automaticamente
  valorSinalCalculado: 0,
  valorParaMotorista: 0,
  porcentagemSinalPadrao: 40,
  
  // Metadados do sistema
  versaoSistema: "2.0",
  ultimaAtualizacao: new Date().toISOString()
};

/**
 * Verifica e atualiza um pacote com os novos campos
 */
export const atualizarCamposPacote = async (pacoteId, dadosExistentes) => {
  try {
    const camposParaAdicionar = {};
    let precisaAtualizar = false;

    // Verificar cada campo obrigatório
    Object.keys(CAMPOS_OBRIGATORIOS_PACOTE).forEach(campo => {
      if (!(campo in dadosExistentes)) {
        camposParaAdicionar[campo] = CAMPOS_OBRIGATORIOS_PACOTE[campo];
        precisaAtualizar = true;
      }
    });

    // Se existe sinalConfig mas está incompleto, completar
    if (dadosExistentes.sinalConfig) {
      const sinalConfig = dadosExistentes.sinalConfig;
      const sinalCompleto = { ...CAMPOS_OBRIGATORIOS_PACOTE.sinalConfig };
      
      Object.keys(CAMPOS_OBRIGATORIOS_PACOTE.sinalConfig).forEach(campo => {
        if (!(campo in sinalConfig)) {
          sinalCompleto[campo] = CAMPOS_OBRIGATORIOS_PACOTE.sinalConfig[campo];
          precisaAtualizar = true;
        } else {
          sinalCompleto[campo] = sinalConfig[campo];
        }
      });
      
      if (precisaAtualizar) {
        camposParaAdicionar.sinalConfig = sinalCompleto;
      }
    }

    // Calcular valores automaticamente se necessário
    if (precisaAtualizar || !dadosExistentes.valorSinalCalculado) {
      const dadosCompletos = { ...dadosExistentes, ...camposParaAdicionar };
      const valoresCalculados = calcularValoresPacote(dadosCompletos);
      Object.assign(camposParaAdicionar, valoresCalculados);
      precisaAtualizar = true;
    }

    // Atualizar no Firestore se necessário
    if (precisaAtualizar) {
      camposParaAdicionar.ultimaAtualizacao = new Date().toISOString();
      
      const pacoteRef = doc(db, 'pacotes', pacoteId);
      await updateDoc(pacoteRef, camposParaAdicionar);
      
      console.log(`✅ Pacote ${pacoteId} atualizado com novos campos automaticamente`);
      return { ...dadosExistentes, ...camposParaAdicionar };
    }

    return dadosExistentes;
  } catch (error) {
    console.error(`❌ Erro ao atualizar campos do pacote ${pacoteId}:`, error);
    return dadosExistentes;
  }
};

/**
 * Calcula valores de sinal e motorista automaticamente
 */
export const calcularValoresPacote = (pacote) => {
  const precoBase = pacote.isIdaEVolta ? pacote.precoIdaVolta : pacote.preco;
  let valorSinal = 0;

  if (pacote.sinalConfig && pacote.sinalConfig.tipo === "porcentagem") {
    valorSinal = (precoBase * pacote.sinalConfig.valor) / 100;
  } else if (pacote.sinalConfig && pacote.sinalConfig.tipo === "valor") {
    valorSinal = pacote.sinalConfig.valor;
  }

  const valorParaMotorista = precoBase - valorSinal;

  return {
    valorSinalCalculado: valorSinal,
    valorParaMotorista: valorParaMotorista
  };
};

/**
 * Migra todos os pacotes existentes para a nova estrutura
 */
export const migrarTodosPacotes = async () => {
  try {
    console.log('🔄 Iniciando migração automática de pacotes...');
    
    const pacotesRef = collection(db, 'pacotes');
    const snapshot = await getDocs(pacotesRef);
    
    const promessas = [];
    let totalMigrados = 0;

    snapshot.forEach((doc) => {
      const promessa = atualizarCamposPacote(doc.id, doc.data())
        .then(() => {
          totalMigrados++;
        });
      promessas.push(promessa);
    });

    await Promise.all(promessas);
    
    console.log(`✅ Migração concluída! ${totalMigrados} pacotes atualizados.`);
    return { sucesso: true, totalMigrados };
    
  } catch (error) {
    console.error('❌ Erro na migração automática:', error);
    return { sucesso: false, erro: error.message };
  }
};

/**
 * Verifica se um pacote precisa de atualização
 */
export const verificarNecessidadeAtualizacao = (pacote) => {
  return Object.keys(CAMPOS_OBRIGATORIOS_PACOTE).some(campo => !(campo in pacote));
};

const firestoreAutoFields = {
  atualizarCamposPacote,
  calcularValoresPacote,
  migrarTodosPacotes,
  verificarNecessidadeAtualizacao,
  CAMPOS_OBRIGATORIOS_PACOTE
};

export default firestoreAutoFields;
