// src/models/viagemModel.js
export const ViagemStatus = {
  RESERVADO: 'reservado',
  IDA_INICIADA: 'ida_iniciada', 
  IDA_FINALIZADA: 'ida_finalizada',
  VOLTA_INICIADA: 'volta_iniciada',
  VOLTA_FINALIZADA: 'volta_finalizada',
  CANCELADO: 'cancelado'
};

export const PagamentoStatus = {
  PENDENTE: 'pendente',
  SINAL_PAGO: 'sinal_pago',
  PAGO_COMPLETO: 'pago_completo'
};

export const createViagemModel = (dados) => ({
  id: dados.id || null,
  pacoteId: dados.pacoteId,
  clienteId: dados.clienteId,
  
  // Configuração da viagem
  isIdaEVolta: dados.isIdaEVolta || false,
  dataIda: dados.dataIda,
  dataVolta: dados.dataVolta || null,
  horaIda: dados.horaIda,
  horaVolta: dados.horaVolta || null,
  
  // Motoristas
  motoristaIdaId: dados.motoristaIdaId || null,
  motoristaVoltaId: dados.motoristaVoltaId || null,
  
  // Status
  status: dados.status || ViagemStatus.RESERVADO,
  
  // Financeiro
  valorTotal: dados.valorTotal || 0,
  porcentagemSinal: dados.porcentagemSinal || 40,
  valorSinal: dados.valorSinal || 0,
  valorRestante: dados.valorRestante || 0,
  statusPagamento: dados.statusPagamento || PagamentoStatus.PENDENTE,
  
  // Localização
  pontoPartida: dados.pontoPartida || '',
  pontoDestino: dados.pontoDestino || '',
  
  // Observações
  observacoesIda: dados.observacoesIda || '',
  observacoesVolta: dados.observacoesVolta || '',
  
  // Metadados
  createdAt: dados.createdAt,
  updatedAt: dados.updatedAt
});

export const calcularValores = (valorTotal, porcentagemSinal) => {
  const valorSinal = (valorTotal * porcentagemSinal) / 100;
  const valorRestante = valorTotal - valorSinal;
  
  return {
    valorSinal: parseFloat(valorSinal.toFixed(2)),
    valorRestante: parseFloat(valorRestante.toFixed(2))
  };
};
