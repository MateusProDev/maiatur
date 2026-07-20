import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { transferChegadaSchema } from "../../schemas/reservasSchemas";
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
} from "../../services/reservasService";
import ModalSucessoReserva from "../../components/Reservas/ModalSucessoReserva";
import { db } from "../../firebase/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { autoOptimize } from "../../utils/cloudinaryOptimizer";
import "../PasseioPage/PasseioPage.css";

const TransferChegadaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaId, setReservaId] = useState("");
  const [pacotesTransfer, setPacotesTransfer] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferChegadaSchema),
    defaultValues: {
      tipo: "transfer_chegada",
    },
  });

  useEffect(() => {
    const carregarListas = async () => {
      console.log("🔄 [TransferChegada] Carregando dados...");
      
      // Otimização: Verificar cache primeiro
      const cacheKey = 'transfer_chegada_data';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      // Usar cache se tiver menos de 10 minutos
      if (cachedData && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 10 * 60 * 1000) {
          console.log('📦 Usando cache de transfer chegada');
          const parsed = JSON.parse(cachedData);
          setLogoUrl(parsed.logoUrl);
          setPacotesTransfer(parsed.pacotes);
          return;
        }
      }
      
      // Buscar logo da agência
      let currentLogoUrl = '/icons/android-chrome-512x512.png';
      try {
        setLogoUrl(currentLogoUrl);
        const headerRef = doc(db, 'content', 'header');
        const headerDoc = await getDoc(headerRef);
        if (headerDoc.exists() && headerDoc.data().logoUrl) {
          currentLogoUrl = headerDoc.data().logoUrl;
          setLogoUrl(currentLogoUrl);
        }
      } catch (error) {
        console.error('Erro ao buscar logo:', error);
        setLogoUrl(currentLogoUrl);
      }
      
      // Lista de veículos disponíveis
      const veiculos = [
        "Carro até 6 pessoas",
        "Van até 15 pessoas",
        "Transfer executivo",
        "4x4",
        "Buggy"
      ];
      console.log("✅ [TransferChegada] Veículos carregados:", veiculos);

      // Buscar pacotes de transfer_chegada E transfer_chegada_saida
      try {
        const q1 = query(
          collection(db, 'pacotes'),
          where('categoria', '==', 'transfer_chegada')
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
        
        console.log("✅ [TransferChegada] Pacotes transfer_chegada:", pacotes1.length);
        console.log("✅ [TransferChegada] Pacotes transfer_chegada_saida:", pacotes2.length);
        console.log("📊 [TransferChegada] Total de pacotes:", todosPacotes.length);
        
        setPacotesTransfer(todosPacotes);
        
        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
          logoUrl: currentLogoUrl,
          pacotes: todosPacotes
        }));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        
        if (todosPacotes.length === 0) {
          console.warn("⚠️ [TransferChegada] Nenhum pacote encontrado");
          console.log("💡 [TransferChegada] Crie pacotes no Admin com categoria 'transfer_chegada' ou 'transfer_chegada_saida'");
        }
      } catch (error) {
        console.error('❌ [TransferChegada] Erro ao buscar pacotes transfer:', error);
      }
    };
    carregarListas();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("📋 [TransferChegada] Submetendo dados:", data);
    try {
      const telefone = normalizarTelefone(data.responsavel.telefone);

      const reserva = {
        tipo: "transfer_chegada",
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
          numeroVoo: data.numeroVoo,
          localChegada: "Aeroporto de Fortaleza",
          destino: data.destino?.hotel || "", 
          quantidadeMalas: data.quantidades.malas || 0,
        },
        // Estrutura compatível com gerador de voucher
        vooChegada: {
          numeroVoo: data.numeroVoo,
          dataChegada: data.dataHoraChegada,
          horarioChegada: '',
        },
      };

      console.log("📦 [TransferChegada] Objeto da reserva:", reserva);

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
        title="Transfer de Chegada - Transfer Fortaleza Tur"
        description="Reserve seu transfer de chegada do aeroporto para o hotel em Fortaleza. Atendimento personalizado e seguro."
      />
      <div className="form-header">
        <div className="form-header-top">
          <button onClick={() => navigate("/reservas")} className="btn-voltar">
            ← Voltar
          </button>
          {logoUrl && (
            <div className="form-logo">
              <img 
                src={autoOptimize(logoUrl, 'logo')} 
                alt="Transfer Fortaleza Tur Logo" 
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </div>
        <div className="form-header-content">
          <h1>✈️ Transfer de Chegada</h1>
          <p>Aeroporto → Hotel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error("❌ Erros de validação:", errors);
        alert("Por favor, corrija os erros no formulário antes de enviar.");
      })} className="form-reserva">
        <div className="secao-form">
          <h3>🚗 Detalhes do Transfer</h3>

          <div className="campo-form">
            <label>Destino do Transfer *</label>
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

          <div className="campos-linha">
            <div className="campo-form">
              <label>Data/Hora de Chegada *</label>
              <input type="datetime-local" {...register("dataHoraChegada")} />
              {errors.dataHoraChegada && (
                <span className="erro">{errors.dataHoraChegada.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Nº do Vôo *</label>
              <input
                type="text"
                placeholder="Ex: G31234"
                {...register("numeroVoo")}
              />
              {errors.numeroVoo && (
                <span className="erro">{errors.numeroVoo.message}</span>
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
            <label>Destino (Hotel/Endereço)</label>
            <input
              type="text"
              placeholder="Ex: Hotel Praia Mar, Av. Beira Mar, 123"
              {...register("destino")}
            />
            {errors.destino && (
              <span className="erro">{errors.destino.message}</span>
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

export default TransferChegadaPage;
