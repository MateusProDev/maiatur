import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { passeioSchema } from "../../schemas/reservasSchemas";
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
  buscarPacotesPorCategoria,
} from "../../services/reservasService";
import ModalSucessoReserva from "../../components/Reservas/ModalSucessoReserva";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./PasseioPage.css";

const PasseioPage = () => {
    const onSubmit = async (data) => {
      setLoading(true);
      try {
        // Normalizar telefone
        const telefone = normalizarTelefone(data.responsavel.telefone);
        // Montar objeto de reserva alinhado com transfer/email/voucher
        const reserva = {
          tipo: "passeio",
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
          },
          passageiros: data.passageiros, // enviar como texto; service fará o parse
          pagamento: {
            forma: data.pagamento.forma,
            valorTotal: data.pagamento.valorTotal,
          },
          observacoes: data.observacoes || "",
          detalhes: {
            nomePasseio: data.passeioDesejado,
            tipoVeiculo: data.tipoPasseioVeiculo,
            dataPasseio: data.dataPasseio,
            horaPasseio: data.horaPasseio,
            localSaida: data.localSaida,
            horaSaida: data.horaSaida,
            horaRetorno: data.horaRetorno,
          },
        };
        // Salvar no Firestore
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaId, setReservaId] = useState("");
  const [passeiosDisponiveis, setPasseiosDisponiveis] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passeioSchema),
    defaultValues: {
      tipo: "passeio",
    },
  });

  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([
    "Carro até 6 pessoas",
    "Van até 15 pessoas",
    "Transfer executivo",
    "4x4",
    "Buggy"
  ]);

  useEffect(() => {
    // Carregar listas do Firestore
    const carregarListas = async () => {
      console.log("🔄 Carregando dados do Firestore...");
      
      // Buscar logo da agência
      try {
        // Usar logo específica do icons
        setLogoUrl('/icons/android-chrome-512x512.png');
        
        // Fallback: buscar do Firestore se necessário
        const headerRef = doc(db, 'content', 'header');
        const headerDoc = await getDoc(headerRef);
        if (headerDoc.exists() && headerDoc.data().logoUrl) {
          setLogoUrl(headerDoc.data().logoUrl);
        }
      } catch (error) {
        console.error('Erro ao buscar logo:', error);
        // Fallback para logo local
        setLogoUrl('/icons/android-chrome-512x512.png');
      }
      
      // Buscar PACOTES da categoria "passeio"
      const pacotes = await buscarPacotesPorCategoria("passeio");
      console.log("✅ Pacotes (passeios) carregados:", pacotes);
      
      // Buscar veículos da lista
      const veiculos = await buscarLista("veiculos");
      console.log("✅ Veículos carregados:", veiculos);
      
      // Extrair títulos dos pacotes
      const titulosPacotes = pacotes.map(p => p.titulo);
      console.log("📋 Títulos dos pacotes:", titulosPacotes);
      
      setPasseiosDisponiveis(titulosPacotes);
    };
    carregarListas();
  }, []);
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || "seu-projeto";
  const voucherUrl = `https://us-central1-${projectId}.cloudfunctions.net/voucher/${reservaId}`;
  const whatsappNumber = process.env.REACT_APP_AGENCY_PHONE_WHATS || "558500000000";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de confirmar minha reserva #${reservaId}`;

  return (
    <div className="formulario-page">
      <SEOHelmet
        title="Reserva de Passeio - Transfer Fortaleza Tur"
        description="Reserve passeios turísticos exclusivos em Fortaleza e região. Escolha entre pacotes, eventos ou outros tipos de passeio."
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
          <h1>🚌 Reserva de Passeio</h1>
          <p>Preencha os dados abaixo para realizar sua reserva</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error("❌ [Passeio] Erros de validação:", errors);
        alert("Por favor, corrija os erros do formulário antes de enviar.");
      })} className="form-reserva">
        {/* Detalhes do Passeio */}
        <div className="secao-form">
          <h3>🗺️ Detalhes do Passeio</h3>

          <div className="campo-form">
            <label>Passeio Desejado *</label>
            <select {...register("passeioDesejado")}>
              <option value="">Selecione...</option>
              {passeiosDisponiveis.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Eventos">Eventos</option>
              <option value="Outros">Outros</option>
            </select>
            {errors.passeioDesejado && (
              <span className="erro">{errors.passeioDesejado.message}</span>
            )}
          </div>

          <div className="campo-form">
            <label>Tipo de Passeio e Veículo *</label>
            <select {...register("tipoPasseioVeiculo")}>
              <option value="">Selecione...</option>
              {veiculosDisponiveis.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {errors.tipoPasseioVeiculo && (
              <span className="erro">{errors.tipoPasseioVeiculo.message}</span>
            )}
          </div>

          <div className="campos-linha">
            <div className="campo-form">
              <label>Data do Passeio *</label>
              <input type="date" {...register("dataPasseio")} />
              {errors.dataPasseio && (
                <span className="erro">{errors.dataPasseio.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Hora do Passeio *</label>
              <input type="time" {...register("horaPasseio")} />
              {errors.horaPasseio && (
                <span className="erro">{errors.horaPasseio.message}</span>
              )}
            </div>
          </div>

          <div className="campo-form">
            <label>Local de Saída *</label>
            <input
              type="text"
              placeholder="Ex: Hotel Praia Mar, Av. Beira Mar, 123"
              {...register("localSaida")}
            />
            {errors.localSaida && (
              <span className="erro">{errors.localSaida.message}</span>
            )}
          </div>

          <div className="campos-linha">
            <div className="campo-form">
              <label>Hora de Saída *</label>
              <input type="time" {...register("horaSaida")} />
              {errors.horaSaida && (
                <span className="erro">{errors.horaSaida.message}</span>
              )}
            </div>

            <div className="campo-form">
              <label>Hora de Retorno *</label>
              <input type="time" {...register("horaRetorno")} />
              {errors.horaRetorno && (
                <span className="erro">{errors.horaRetorno.message}</span>
              )}
            </div>
          </div>
        </div>

        <CamposResponsavel register={register} errors={errors} ddiOptions={DDI_OPTIONS} />
        <CamposQuantidades register={register} errors={errors} />
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

export default PasseioPage;
