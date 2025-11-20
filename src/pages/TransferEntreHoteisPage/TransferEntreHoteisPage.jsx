import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { transferEntreHoteisSchema } from "../../schemas/reservasSchemas";
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

const TransferEntreHoteisPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaId, setReservaId] = useState("");
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([]);
  const [pacotesTransfer, setPacotesTransfer] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferEntreHoteisSchema),
    defaultValues: {
      tipo: "transfer_entre_hoteis",
    },
  });

  useEffect(() => {
    const carregarListas = async () => {
      console.log("🔄 [TransferEntreHoteis] Carregando dados...");
      
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
      console.log("✅ [TransferEntreHoteis] Veículos carregados:", veiculos);
      setVeiculosDisponiveis(veiculos);

      // Buscar pacotes de transfer_entre_hoteis
      try {
        const q = query(
          collection(db, 'pacotes'),
          where('categoria', '==', 'transfer_entre_hoteis')
        );
        const querySnapshot = await getDocs(q);
        const pacotes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("✅ [TransferEntreHoteis] Pacotes transfer carregados:", pacotes);
        console.log("📊 [TransferEntreHoteis] Total de pacotes:", pacotes.length);
        setPacotesTransfer(pacotes);
        
        if (pacotes.length === 0) {
          console.warn("⚠️ [TransferEntreHoteis] Nenhum pacote encontrado com categoria 'transfer_entre_hoteis'");
          console.log("💡 [TransferEntreHoteis] Crie pacotes no Admin (/admin/pacotes) com categoria 'transfer_entre_hoteis'");
        }
      } catch (error) {
        console.error('❌ [TransferEntreHoteis] Erro ao buscar pacotes transfer:', error);
      }
    };
    carregarListas();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("📋 [TransferEntreHoteis] Submetendo dados:", data);
    try {
      const telefone = normalizarTelefone(data.responsavel.telefone);

      const reserva = {
        tipo: "transfer_entre_hoteis",
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
          rotaTransfer: data.rotaTransfer, // Pacote selecionado
          tipoVeiculo: data.tipoTransferVeiculo,
          data: data.data,
          hora: data.hora,
          hotelPartida: data.hotelPartida?.hotel || "",
          hotelDestino: data.hotelDestino?.hotel || "",
          quantidadeMalas: data.quantidades.malas || 0,
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
      <SEOHelmet
        title="Transfer entre Hotéis - Transfer Fortaleza Tur"
        description="Reserve transfer entre hotéis em Fortaleza com praticidade, conforto e agilidade."
        noindex={true}
      />
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
          <h1>🏨 Transfer entre Hotéis</h1>
          <p>Hotel → Outro Hotel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-reserva">
        <div className="secao-form">
          <h3>🚗 Detalhes do Transfer</h3>

          <div className="campo-form">
            <label>Rota do Transfer *</label>
            <select {...register("rotaTransfer")}>
              <option value="">Selecione a rota...</option>
              {pacotesTransfer.map((pacote) => (
                <option key={pacote.id} value={pacote.titulo}>
                  {pacote.titulo}
                </option>
              ))}
            </select>
            {errors.rotaTransfer && (
              <span className="erro">{errors.rotaTransfer.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Tipo de Transfer e Veículo *</label>
            <select {...register("tipoTransferVeiculo")}>
              <option value="">Selecione...</option>
              {veiculosDisponiveis.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {errors.tipoTransferVeiculo && (
              <span className="erro">{errors.tipoTransferVeiculo.message}</span>
            )}
          </div>

          <div className="campos-linha">
            <div className="campo-form">
              <label>Data *</label>
              <input type="date" {...register("data")} />
              {errors.data && (
                <span className="erro">{errors.data.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Hora *</label>
              <input type="time" {...register("hora")} />
              {errors.hora && (
                <span className="erro">{errors.hora.message}</span>
              )}
            </div>
          </div>

          <div className="campo-form">
            <label>Hotel de Partida</label>
            <input
              type="text"
              placeholder="Ex: Hotel Praia Mar, Av. Beira Mar, 123"
              {...register("hotelPartida")}
            />
            {errors.hotelPartida && (
              <span className="erro">{errors.hotelPartida.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Hotel de Destino</label>
            <input
              type="text"
              placeholder="Ex: Hotel Vista Mar, Av. Abolição, 456"
              {...register("hotelDestino")}
            />
            {errors.hotelDestino && (
              <span className="erro">{errors.hotelDestino.message}</span>
            )}
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

export default TransferEntreHoteisPage;
