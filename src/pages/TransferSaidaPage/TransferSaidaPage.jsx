import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { transferSaidaSchema } from "../../schemas/reservasSchemas";
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

const TransferSaidaPage = () => {
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
    resolver: zodResolver(transferSaidaSchema),
    defaultValues: {
      tipo: "transfer_saida",
    },
  });

  useEffect(() => {
    const carregarListas = async () => {
      console.log("🔄 [TransferSaida] Carregando dados...");
      
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
      console.log("✅ [TransferSaida] Veículos carregados:", veiculos);
      setVeiculosDisponiveis(veiculos);

      // Buscar pacotes de transfer_saida E transfer_chegada_saida
      try {
        const q1 = query(
          collection(db, 'pacotes'),
          where('categoria', '==', 'transfer_saida')
        );
        const q2 = query(
          collection(db, 'pacotes'),
          where('categoria', '==', 'transfer_chegada_saida')
        );
        
        const [querySnapshot1, querySnapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2)
        ]);
        
        const pacotes1 = querySnapshot1.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const pacotes2 = querySnapshot2.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const todosPacotes = [...pacotes1, ...pacotes2];
        
        console.log("✅ [TransferSaida] Pacotes transfer_saida:", pacotes1.length);
        console.log("✅ [TransferSaida] Pacotes transfer_chegada_saida:", pacotes2.length);
        console.log("📊 [TransferSaida] Total de pacotes:", todosPacotes.length);
        setPacotesTransfer(todosPacotes);
        
        if (todosPacotes.length === 0) {
          console.warn("⚠️ [TransferSaida] Nenhum pacote encontrado");
          console.log("💡 [TransferSaida] Crie pacotes no Admin com categoria 'transfer_saida' ou 'transfer_chegada_saida'");
        }
      } catch (error) {
        console.error('❌ [TransferSaida] Erro ao buscar pacotes transfer:', error);
      }
    };
    carregarListas();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("📋 [TransferSaida] Submetendo dados:", data);
    try {
      const telefone = normalizarTelefone(data.responsavel.telefone);

      const reserva = {
        tipo: "transfer_saida",
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
          origemTransfer: data.origemTransfer, // Pacote selecionado
          tipoTransferVeiculo: data.tipoTransferVeiculo,
          dataHoraSaida: data.dataHoraSaida,
          // O schema agora garante que 'localSaida' é um objeto { hotel, endereco }
          localSaida: data.localSaida?.hotel || "",
          aeroportoDestino: "Aeroporto de Fortaleza",
          quantidadeMalas: data.quantidades.malas || 0,
        },
        // Estrutura compatível com gerador de voucher (campos básicos)
        voo: {
          numeroVoo: 'N/D',
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
      <SEOHelmet
        title="Transfer de Saída - Transfer Fortaleza Tur"
        description="Reserve seu transfer de saída do aeroporto para o hotel em Fortaleza com segurança e pontualidade."
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
          <h1>🛫 Transfer de Saída</h1>
          <p>Hotel → Aeroporto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-reserva">
        <div className="secao-form">
          <h3>🚗 Detalhes do Transfer</h3>

          <div className="campo-form">
            <label>Origem do Transfer *</label>
            <select {...register("origemTransfer")}>
              <option value="">Selecione a origem...</option>
              {pacotesTransfer.map((pacote) => (
                <option key={pacote.id} value={pacote.titulo}>
                  {pacote.titulo}
                </option>
              ))}
            </select>
            {errors.origemTransfer && (
              <span className="erro">{errors.origemTransfer.message}</span>
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

          <div className="campo-form">
            <label>Data/Hora de Saída *</label>
            <input type="datetime-local" {...register("dataHoraSaida")} />
            <small className="hint">
              Recomendamos chegar ao aeroporto com 3h de antecedência para voos
              internacionais e 2h para voos nacionais.
            </small>
            {errors.dataHoraSaida && (
              <span className="erro">{errors.dataHoraSaida.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Local de Saída (Hotel/Endereço)</label>
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

export default TransferSaidaPage;
