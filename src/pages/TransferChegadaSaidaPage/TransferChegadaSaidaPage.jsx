import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
import { db } from "../../firebase/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import "../PasseioPage/PasseioPage.css";

const TransferChegadaSaidaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaId, setReservaId] = useState("");
  const [, setVeiculosDisponiveis] = useState([]);
  const [pacotesTransfer, setPacotesTransfer] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

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
      console.log("🔄 [TransferChegadaSaida] Carregando dados...");
      
      // Buscar logo
      try {
        setLogoUrl('/icons/android-chrome-512x512.png');
        const headerRef = doc(db, 'content', 'header');
        const headerDoc = await getDoc(headerRef);
        if (headerDoc.exists() && headerDoc.data().logoUrl) {
          setLogoUrl(headerDoc.data().logoUrl);
        }
      } catch (error) {
        console.error('Erro ao buscar logo:', error);
        setLogoUrl('/icons/android-chrome-512x512.png');
      }
      
      // Lista de veículos disponíveis
      const veiculos = [
        "Carro até 6 pessoas",
        "Van até 15 pessoas",
        "Transfer executivo",
        "4x4",
        "Buggy"
      ];
      console.log("✅ [TransferChegadaSaida] Veículos carregados:", veiculos);
      setVeiculosDisponiveis(veiculos);

      // Buscar pacotes de transfer_chegada_saida
      try {
        const q = query(
          collection(db, 'pacotes'),
          where('categoria', '==', 'transfer_chegada_saida')
        );
        const querySnapshot = await getDocs(q);
        const pacotes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("✅ [TransferChegadaSaida] Pacotes transfer carregados:", pacotes);
        console.log("📊 [TransferChegadaSaida] Total de pacotes:", pacotes.length);
        setPacotesTransfer(pacotes);
        
        if (pacotes.length === 0) {
          console.warn("⚠️ [TransferChegadaSaida] Nenhum pacote encontrado com categoria 'transfer_chegada_saida'");
          console.log("💡 [TransferChegadaSaida] Crie pacotes no Admin (/admin/pacotes) com categoria 'transfer_chegada_saida'");
        }
      } catch (error) {
        console.error('❌ [TransferChegadaSaida] Erro ao buscar pacotes transfer:', error);
      }
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
          destinoTransfer: data.destinoTransfer, // Pacote selecionado
          tipoVeiculo: data.tipoTransferVeiculo,
          dataHoraChegada: data.dataHoraChegada,
          numeroVooChegada: data.numeroVooChegada,
          hotelDestino: data.hotelDestino?.hotel || "",
          dataHoraSaida: data.dataHoraSaida,
          localSaida: data.localSaida?.hotel || "",
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
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Transfer Chegada e Saída - Transfer Fortaleza Tur</title>
        <meta name="description" content="Reserve transfer de chegada e saída em Fortaleza. Serviço completo para sua viagem, com conforto e agilidade." />
      </Helmet>
      <div className="form-header">
        <div className="form-header-top">
          <button onClick={() => navigate("/reservas")} className="btn-voltar">
            ← Voltar
          </button>
          {logoUrl && (
            <div className="form-logo">
              <img src={logoUrl} alt="Transfer Fortaleza Tur Logo" />
            </div>
          )}
        </div>
        <div className="form-header-content">
          <h1>🔄 Transfer Chegada e Saída</h1>
          <p>Aeroporto → Hotel → Aeroporto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-reserva">
        {/* DESTINO */}
        <div className="secao-form">
          <h3>📍 Destino do Transfer</h3>

          <div className="campo-form">
            <label>Selecione o Destino *</label>
            <select {...register("destinoTransfer")}> 
              <option value="">Selecione o destino...</option>
              {pacotesTransfer.map((pacote) => (
                <option key={pacote.id} value={pacote.titulo}>
                  {pacote.titulo}
                </option>
              ))}
            </select>
            {errors.destinoTransfer && (
              <span className="erro">{errors.destinoTransfer.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Tipo de Transfer e Veículo *</label>
            <select {...register("tipoTransferVeiculo")}> 
              <option value="">Selecione...</option>
              {["Carro até 6 pessoas", "Van até 15 pessoas", "Transfer executivo", "4x4", "Buggy"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {errors.tipoTransferVeiculo && (
              <span className="erro">{errors.tipoTransferVeiculo.message}</span>
            )}
          </div>
        </div>

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
            <label>Hotel de Destino</label>
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
            <label>Local de Saída (Hotel)</label>
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

