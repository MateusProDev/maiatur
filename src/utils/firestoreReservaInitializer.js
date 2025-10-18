// Utilitário para inicializar todos os campos obrigatórios de uma reserva
export function getReservaComCamposPadrao(reserva) {
  // Determinar origem, pontoPartida e pontoDestino de forma robusta
  let origem = reserva.origem || reserva.pontoPartida || reserva.pacoteOrigem || reserva.pacoteCidadeOrigem || '';
  let pontoPartida = reserva.pontoPartida || reserva.origem || reserva.pacoteOrigem || reserva.pacoteCidadeOrigem || '';
  let pontoDestino = reserva.pontoDestino || reserva.pacoteDestino || reserva.pacoteTitulo || reserva.pacoteCidadeDestino || reserva.pacoteTitulo || '';
  // fallback para pacotes do tipo "X para Y"
  if ((!origem || !pontoPartida) && reserva.pacoteTitulo && reserva.pacoteTitulo.includes('para')) {
    const partes = reserva.pacoteTitulo.split('para');
    if (!origem || !pontoPartida) origem = pontoPartida = partes[0].trim();
    if (!pontoDestino) pontoDestino = partes[1]?.trim() || '';
  }
  return {
    // Identificadores
    pacoteId: reserva.pacoteId || '',
    pacoteTitulo: reserva.pacoteTitulo || '',
    clienteId: reserva.clienteId || reserva.userId || '',
    // Configuração da reserva
    isIdaEVolta: reserva.isIdaEVolta ?? false,
    tipoViagem: reserva.tipoViagem || '',
    dataIda: reserva.dataIda || '',
    dataVolta: reserva.dataVolta || '',
    horaIda: reserva.horaIda || '',
    horaVolta: reserva.horaVolta || '',
    // Status
    status: reserva.status || 'pendente',
    statusPagamento: reserva.statusPagamento || 'pendente',
    // Financeiro
    valorTotal: reserva.valorTotal || 0,
    porcentagemSinal: reserva.porcentagemSinal || 40,
    valorSinal: reserva.valorSinal || 0,
    valorRestante: reserva.valorRestante || 0,
    valorPago: reserva.valorPago || 0,
    valorComDesconto: reserva.valorComDesconto || 0,
    // Localização
    origem,
    pontoPartida,
    pontoDestino,
    // Observações
    observacoes: reserva.observacoes || '',
    // Dados do cliente
    clienteNome: reserva.clienteNome || reserva.nome || '',
    clienteEmail: reserva.clienteEmail || reserva.email || '',
    clienteTelefone: reserva.clienteTelefone || reserva.telefone || '',
    clienteCpf: reserva.clienteCpf || reserva.cpf || '',
    // Passageiros
    totalPassageiros: reserva.totalPassageiros || 1,
    adultos: reserva.adultos || 1,
    criancas: reserva.criancas || 0,
    infantis: reserva.infantis || 0,
    passageirosFormatado: reserva.passageirosFormatado || '',
    // Pagamento
    metodoPagamento: reserva.metodoPagamento || '',
    pagamento: reserva.pagamento || null,
    // Metadados
    criadoEm: reserva.criadoEm || null,
    atualizadoEm: reserva.atualizadoEm || null,
    // Campos extras
    ...reserva
  };
}
