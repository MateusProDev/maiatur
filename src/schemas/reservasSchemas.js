import { z } from "zod";
import { toZonedTime } from "date-fns-tz";
import { addHours } from "date-fns";

const TIMEZONE = "America/Fortaleza";

// Validador de 24h de antecedência
const validarAntecedencia24h = (dataReserva) => {
  const agora = toZonedTime(new Date(), TIMEZONE);
  const reserva = toZonedTime(new Date(dataReserva), TIMEZONE);
  const limite = addHours(agora, 24);
  return reserva >= limite;
};

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

// Schema para Passeio
export const passeioSchema = z.object({
  tipo: z.literal("passeio"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema,
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  passeio: z.object({
    nome: z.string().min(3, "Nome do passeio deve ter no mínimo 3 caracteres"),
    data: z.string().refine(validarAntecedencia24h, {
      message: "A reserva deve ser feita com no mínimo 24h de antecedência"
    }),
    horario: z.string().min(1, "Selecione o horário"),
    localEmbarque: z.string().min(3, "Informe o local de embarque")
  }),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Chegada
export const transferChegadaSchema = z.object({
  tipo: z.literal("transfer_chegada"),
  tipoTransferVeiculo: z.string().min(1, "Selecione o tipo de veículo"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos de voo/chegada (usamos campos planos no formulário)
  dataHoraChegada: z.string().refine(validarAntecedencia24h, {
    message: "A reserva deve ser feita com no mínimo 24h de antecedência"
  }),
  numeroVoo: z.string().min(3, "Número do voo inválido"),
  horarioChegada: z.string().min(1, "Informe o horário de chegada").optional(),
  aeroporto: z.string().min(3, "Informe o aeroporto de chegada").optional(),
  // Destino pode ser uma string única (Hotel + endereço) informada no formulário
  destino: localSchema,
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Chegada e Saída (formulário usa campos planos)
export const transferChegadaSaidaSchema = z.object({
  tipo: z.literal("transfer_chegada_saida"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Chegada
  dataHoraChegada: z.string().refine(validarAntecedencia24h, {
    message: "A reserva deve ser feita com no mínimo 24h de antecedência"
  }),
  numeroVooChegada: z.string().min(3, "Número do voo inválido"),
  hotelDestino: localSchema,
  // Saída
  dataHoraSaida: z.string().refine(validarAntecedencia24h, {
    message: "A reserva deve ser feita com no mínimo 24h de antecedência"
  }),
  numeroVooSaida: z.string().min(3, "Número do voo inválido"),
  localSaida: localSchema,
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Saída
export const transferSaidaSchema = z.object({
  tipo: z.literal("transfer_saida"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campo plano usado no formulário
  localSaida: localSchema,
  voo: z.object({
    numeroVoo: z.string().min(3, "Número do voo inválido"),
    dataSaida: z.string().refine(validarAntecedencia24h, {
      message: "A reserva deve ser feita com no mínimo 24h de antecedência"
    }),
    horarioSaida: z.string().min(1, "Informe o horário de saída"),
    horarioSaidaHotel: z.string().min(1, "Informe o horário de saída do hotel"),
    aeroporto: z.string().min(3, "Informe o aeroporto de saída")
  }),
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});

// Schema para Transfer Entre Hotéis
export const transferEntreHoteisSchema = z.object({
  tipo: z.literal("transfer_entre_hoteis"),
  responsavel: responsavelSchema,
  quantidades: quantidadesSchema.extend({
    malas: z.number().min(0, "Quantidade de malas inválida").default(0)
  }),
  passageiros: z.string().min(10, "Informe a relação completa dos passageiros"),
  // Campos planos usados no formulário
  data: z.string().refine(validarAntecedencia24h, {
    message: "A reserva deve ser feita com no mínimo 24h de antecedência"
  }),
  hora: z.string().min(1, "Informe o horário do transfer"),
  hotelPartida: localSchema,
  hotelDestino: localSchema,
  pagamento: pagamentoSchema,
  observacoes: z.string().optional(),
  aceitouPolitica: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de reservas"
  })
});
