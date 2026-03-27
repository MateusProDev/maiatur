import { z } from "zod";

// Schemas base reutilizáveis
const responsavelSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  ddi: z.string().min(1, "Selecione o DDI"),
  telefone: z.string().min(8, "Telefone deve ter no mínimo 8 dígitos")
});

// Schema para normalizar campos de endereço/hotel
const localSchema = z.union([
    z.object({
      hotel: z.string().min(3, "Informe o nome do hotel/local"),
      endereco: z.string().optional().default(''),
    }),
    z.string().min(5, "Informe o local (Hotel/Endereço)")
  ]).transform(val => {
    if (typeof val === 'string') {
      // Se for string, normaliza para o formato de objeto
      return { hotel: val, endereco: '' };
    }
    return val;
  });

const quantidadesSchema = z.object({
  adultos: z.number().min(1, "Deve ter pelo menos 1 adulto"),
  criancas: z.number().min(0, "Quantidade de crianças inválida").default(0),
  malas: z.number().min(0, "Quantidade de malas inválida").default(0).optional()
});

const pagamentoSchema = z.object({
  forma: z.string().min(1, "Selecione a forma de pagamento"),
  valorTotal: z.number().min(0.01, "Valor deve ser maior que zero")
});

// Schema para Passeio (campos planos usados na UI)
export const passeioSchema = z.object({
  tipo: z.literal("passeio"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema,
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos planos do formulário
  passeioDesejado: z.string().min(3, "Selecione o passeio"),
  tipoPasseioVeiculo: z.string().min(1, "Selecione o tipo de veículo"),
  dataPasseio: z.string().min(1, "Informe a data do passeio"),
  horaPasseio: z.string().min(1, "Selecione o horário do passeio"),
  localSaida: z.string().min(3, "Informe o local de saída"),
  horaSaida: z.string().min(1, "Informe a hora de saída"),
  horaRetorno: z.string().min(1, "Informe a hora de retorno"),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Chegada
export const transferChegadaSchema = z.object({
  tipo: z.literal("transfer_chegada"),
  destinoTransfer: z.string().min(1, "Selecione o destino do transfer"),
  tipoTransferVeiculo: z.string().min(1, "Selecione o tipo de veículo"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos de voo/chegada (usamos campos planos no formulário)
  dataHoraChegada: z.string().min(1, "Informe a data de chegada"),
  numeroVoo: z.string().min(3, "Número do voo inválido"),
  horarioChegada: z.string().min(1, "Informe o horário de chegada").optional(),
  aeroporto: z.string().min(3, "Informe o aeroporto de chegada").optional(),
  // Destino pode ser uma string única (Hotel + endereço) informada no formulário
  destino: localSchema.optional(),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Chegada e Saída (formulário usa campos planos)
export const transferChegadaSaidaSchema = z.object({
  tipo: z.literal("transfer_chegada_saida"),
  destinoTransfer: z.string().min(1, "Selecione o destino do transfer"),
  tipoTransferVeiculo: z.string().min(1, "Selecione o tipo de veículo").optional(),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Chegada
  dataHoraChegada: z.string().min(1, "Informe a data de chegada"),
  numeroVooChegada: z.string().min(3, "Número do voo inválido"),
  hotelDestino: localSchema.optional(),
  // Saída
  dataHoraSaida: z.string().min(1, "Informe a data de saída"),
  numeroVooSaida: z.string().min(3, "Número do voo inválido"),
  localSaida: localSchema.optional(),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Saída (campos planos usados na UI)
export const transferSaidaSchema = z.object({
  tipo: z.literal("transfer_saida"),
  origemTransfer: z.string().min(1, "Selecione a origem do transfer"),
  tipoTransferVeiculo: z.string().min(1, "Selecione o tipo de veículo"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos planos usados no formulário
  dataHoraSaida: z.string().min(1, "Informe a data de saída"),
  localSaida: localSchema.optional(),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Entre Hotéis
export const transferEntreHoteisSchema = z.object({
  tipo: z.literal("transfer_entre_hoteis"),
  rotaTransfer: z.string().min(1, "Selecione a rota do transfer"),
  tipoTransferVeiculo: z.string().min(1, "Selecione o tipo de veículo"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos planos usados no formulário
  data: z.string().min(1, "Informe a data do transfer"),
  hora: z.string().min(1, "Informe o horário do transfer"),
  hotelPartida: localSchema.optional(),
  hotelDestino: localSchema.optional(),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});
