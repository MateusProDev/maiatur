// Tipos de reserva disponíveis
export const TipoReserva = {
  PASSEIO: "passeio",
  TRANSFER_CHEGADA: "transfer_chegada",
  TRANSFER_CHEGADA_SAIDA: "transfer_chegada_saida",
  TRANSFER_SAIDA: "transfer_saida",
  TRANSFER_ENTRE_HOTEIS: "transfer_entre_hoteis"
};

// Status da reserva
export const StatusReserva = {
  PENDENTE: "pendente",
  CONFIRMADA: "confirmada",
  CANCELADA: "cancelada",
  CONCLUIDA: "concluida"
};

// DDI mais comuns
export const DDI_OPTIONS = [
  { value: "+55", label: "+55 (Brasil)" },
  { value: "+1", label: "+1 (EUA/Canadá)" },
  { value: "+351", label: "+351 (Portugal)" },
  { value: "+34", label: "+34 (Espanha)" },
  { value: "+39", label: "+39 (Itália)" },
  { value: "+33", label: "+33 (França)" },
  { value: "+44", label: "+44 (Reino Unido)" },
  { value: "+49", label: "+49 (Alemanha)" },
  { value: "+54", label: "+54 (Argentina)" },
  { value: "+56", label: "+56 (Chile)" },
];
