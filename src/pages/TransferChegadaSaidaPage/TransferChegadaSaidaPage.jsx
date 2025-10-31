import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { transferChegadaSaidaSchema } from "../../schemas/reservasSchemas";
import { DDI_OPTIONS } from "../../types/reservas";
import {
  CamposResponsavel,
  CamposQuantidades,
  CamposPassageiros,
  CamposPagamento,
  CamposPolitica,
} from "../../components/Reservas/CamposComuns";
import {
  criarReserva,
  normalizarTelefone,
  buscarLista,
} from "../../services/reservasService";
import ModalSucessoReserva from "../../components/Reservas/ModalSucessoReserva";
import "../PasseioPage/PasseioPage.css";

const TransferChegadaSaidaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaId, setReservaId] = useState("");
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferChegadaSaidaSchema),
    defaultValues: {
      tipo: "transfer_chegada_saida",
    },
  });

  useEffect(() => {
    const carregarListas = async () => {
      console.log("🔄 [TransferChegadaSaida] Carregando veículos...");
      const veiculos = await buscarLista("veiculos");
      console.log("✅ [TransferChegadaSaida] Veículos carregados:", veiculos);
      setVeiculosDisponiveis(veiculos);
    };
    carregarListas();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("📋 [TransferChegadaSaida] Submetendo dados:", data);
    try {
      const telefone = normalizarTelefone(data.responsavel.telefone);

      const reserva = {
        tipo: "transfer_chegada_saida",
        status: "pendente",
        responsavel: {
          nome: data.responsavel.nome,
          email: data.responsavel.email,
          ddi: data.responsavel.ddi,
          telefone,
        },
        quantidades: {
          adultos: data.quantidades.adultos,
          criancas: data.quantidades.criancas,
          malas: data.quantidades.malas || 0,
        },
        passageiros: data.passageiros, // enviar como texto; service fará o parse
        pagamento: {
          forma: data.pagamento.forma,
          valorTotal: data.pagamento.valorTotal,
        },
        observacoes: data.observacoes || "",
        detalhes: {
          dataHoraChegada: data.dataHoraChegada,
          numeroVooChegada: data.numeroVooChegada,
          // O schema agora garante que 'hotelDestino' e 'localSaida' são objetos
          hotelDestino: data.hotelDestino.hotel,
          dataHoraSaida: data.dataHoraSaida,
          localSaida: data.localSaida.hotel,
          numeroVooSaida: data.numeroVooSaida,
          quantidadeMalas: data.quantidades.malas || 0,
        },
        // Estruturas compatíveis com gerador de voucher
        vooChegada: {
          numeroVoo: data.numeroVooChegada,
          dataChegada: data.dataHoraChegada,
          horarioChegada: '',
        },
        voo: {
          numeroVoo: data.numeroVooSaida,
          dataSaida: data.dataHoraSaida,
          horarioSaida: '',
          horarioSaidaHotel: '',
          aeroporto: 'Aeroporto de Fortaleza',
        },
      };

      const id = await criarReserva(reserva);
      setReservaId(id);
      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      alert("Erro ao criar reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || "seu-projeto";
  const voucherUrl = `https://us-central1-${projectId}.cloudfunctions.net/voucher/${reservaId}`;
  const whatsappNumber = process.env.REACT_APP_AGENCY_PHONE_WHATS || "558500000000";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de confirmar minha reserva #${reservaId}`;

  return (
    <div className="formulario-page">
      <div className="form-header">
        <button onClick={() => navigate("/reservas")} className="btn-voltar">
          ← Voltar
        </button>
        <h1>🔄 Transfer Chegada e Saída</h1>
        <p>Aeroporto → Hotel → Aeroporto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-reserva">
        {/* CHEGADA */}
        <div className="secao-form">
          <h3>✈️ Dados da Chegada</h3>

          <div className="campos-linha">
            <div className="campo-form">
              <label>Data/Hora de Chegada *</label>
              <input type="datetime-local" {...register("dataHoraChegada")} />
              {errors.dataHoraChegada && (
                <span className="erro">{errors.dataHoraChegada.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Nº do Vôo de Chegada *</label>
              <input
                type="text"
                placeholder="Ex: G31234"
                {...register("numeroVooChegada")}
              />
              {errors.numeroVooChegada && (
                <span className="erro">{errors.numeroVooChegada.message}</span>
              )}
            </div>
          </div>

          <div className="campo-form">
            <label>Local de Chegada</label>
            <input
              type="text"
              value="Aeroporto de Fortaleza"
              disabled
              style={{ background: "#f0f0f0" }}
            />
          </div>

          <div className="campo-form">
            <label>Hotel de Destino *</label>
            <input
              type="text"
              placeholder="Ex: Hotel Praia Mar"
              {...register("hotelDestino")}
            />
            {errors.hotelDestino && (
              <span className="erro">{errors.hotelDestino.message}</span>
            )}
          </div>
        </div>

        {/* SAÍDA */}
        <div className="secao-form">
          <h3>🛫 Dados da Saída</h3>
          <small className="hint">
            Recomendamos chegar ao aeroporto com 3h de antecedência para voos
            internacionais e 2h para voos nacionais.
          </small>

          <div className="campos-linha">
            <div className="campo-form">
              <label>Data/Hora de Saída *</label>
              <input type="datetime-local" {...register("dataHoraSaida")} />
              {errors.dataHoraSaida && (
                <span className="erro">{errors.dataHoraSaida.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Nº do Vôo de Saída *</label>
              <input
                type="text"
                placeholder="Ex: G35678"
                {...register("numeroVooSaida")}
              />
              {errors.numeroVooSaida && (
                <span className="erro">{errors.numeroVooSaida.message}</span>
              )}
            </div>
          </div>

          <div className="campo-form">
            <label>Local de Saída (Hotel) *</label>
            <input
              type="text"
              placeholder="Ex: Hotel Praia Mar, Av. Beira Mar, 123"
              {...register("localSaida")}
            />
            {errors.localSaida && (
              <span className="erro">{errors.localSaida.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Aeroporto de Destino</label>
            <input
              type="text"
              value="Aeroporto de Fortaleza"
              disabled
              style={{ background: "#f0f0f0" }}
            />
          </div>
        </div>

        <CamposResponsavel register={register} errors={errors} ddiOptions={DDI_OPTIONS} />
        <CamposQuantidades register={register} errors={errors} comMalas={true} />
        <CamposPassageiros register={register} errors={errors} />
        <CamposPagamento register={register} errors={errors} />
        <CamposPolitica register={register} errors={errors} />

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Processando..." : "Confirmar Reserva"}
        </button>
      </form>

      <ModalSucessoReserva
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          navigate("/reservas");
        }}
        reservaId={reservaId}
        voucherUrl={voucherUrl}
        whatsappUrl={whatsappUrl}
      />
    </div>
  );
};

export default TransferChegadaSaidaPage;
