import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./EditTransferBeberibe.css";

const EditTransferBeberibe = () => {
  const navigate = useNavigate();
  const [transferData, setTransferData] = useState({
    title: 'DETALHES DO TRANSFER',
    subtitle: 'Confira a seguir tudo sobre o Transfer Beberibe (privativo).',
    tripadvisorBadge: 'SOMOS EMPRESA TOP NO TRIPADVISOR E GOOGLE COM TODAS AVALIAÇÕES 5 ESTRELAS',
    tripadvisorLink: '',
    vehicleTitle: 'VOCÊ RESERVA O VEÍCULO INTEIRO (NÃO É POR PESSOA)',
    vehicleDescription: 'Reserve seu transfer privativo com motorista exclusivo para você e seus acompanhantes.',
    paymentTitle: '30% DE GARANTIA DE RESERVA + 70% RESTANTE PESSOALMENTE NO MOMENTO DO SERVIÇO',
    paymentDescription: 'Pague apenas 30% de entrada (reserva) via Pix ou TED, e o 70% restante pessoalmente no momento do serviço.',
    scheduleTitle: 'ESCOLHA A DATA E HORÁRIO MAIS CONVENIENTES PARA VOCÊ',
    scheduleDescription: 'Desfrute de mais!',
    whatsappButtonText: 'Reservar por WhatsApp',
    whatsappNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchTransferData = async () => {
      try {
        const transferRef = doc(db, "content", "transferBeberibe");
        const transferDoc = await getDoc(transferRef);
        if (transferDoc.exists()) {
          const data = transferDoc.data();
          setTransferData({
            title: data.title || 'DETALHES DO TRANSFER',
            subtitle: data.subtitle || 'Confira a seguir tudo sobre o Transfer Beberibe (privativo).',
            tripadvisorBadge: data.tripadvisorBadge || 'SOMOS EMPRESA TOP NO TRIPADVISOR E GOOGLE COM TODAS AVALIAÇÕES 5 ESTRELAS',
            tripadvisorLink: data.tripadvisorLink || '',
            vehicleTitle: data.vehicleTitle || 'VOCÊ RESERVA O VEÍCULO INTEIRO (NÃO É POR PESSOA)',
            vehicleDescription: data.vehicleDescription || 'Reserve seu transfer privativo com motorista exclusivo para você e seus acompanhantes.',
            paymentTitle: data.paymentTitle || '30% DE GARANTIA DE RESERVA + 70% RESTANTE PESSOALMENTE NO MOMENTO DO SERVIÇO',
            paymentDescription: data.paymentDescription || 'Pague apenas 30% de entrada (reserva) via Pix ou TED, e o 70% restante pessoalmente no momento do serviço.',
            scheduleTitle: data.scheduleTitle || 'ESCOLHA A DATA E HORÁRIO MAIS CONVENIENTES PARA VOCÊ',
            scheduleDescription: data.scheduleDescription || 'Desfrute de mais!',
            whatsappButtonText: data.whatsappButtonText || 'Reservar por WhatsApp',
            whatsappNumber: data.whatsappNumber || ''
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchTransferData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await setDoc(doc(db, "content", "transferBeberibe"), transferData);
      setSuccess("Dados salvos com sucesso!");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setTransferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="edit-transfer-beberibe">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="edit-transfer-beberibe">
      <h2>Editar Transfer Beberibe</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Cabeçalho</h3>
          <div className="form-group">
            <label>Título Principal</label>
            <input
              type="text"
              value={transferData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Subtítulo</label>
            <textarea
              value={transferData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Tripadvisor</h3>
          <div className="form-group">
            <label>Texto do Badge</label>
            <textarea
              value={transferData.tripadvisorBadge}
              onChange={(e) => handleChange('tripadvisorBadge', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Link do Tripadvisor</label>
            <input
              type="url"
              value={transferData.tripadvisorLink}
              onChange={(e) => handleChange('tripadvisorLink', e.target.value)}
              placeholder="https://tripadvisor.com.br/..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Informações do Veículo</h3>
          <div className="form-group">
            <label>Título sobre Reserva do Veículo</label>
            <textarea
              value={transferData.vehicleTitle}
              onChange={(e) => handleChange('vehicleTitle', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descrição da Reserva</label>
            <textarea
              value={transferData.vehicleDescription}
              onChange={(e) => handleChange('vehicleDescription', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Informações de Pagamento</h3>
          <div className="form-group">
            <label>Título do Pagamento</label>
            <textarea
              value={transferData.paymentTitle}
              onChange={(e) => handleChange('paymentTitle', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descrição do Pagamento</label>
            <textarea
              value={transferData.paymentDescription}
              onChange={(e) => handleChange('paymentDescription', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Informações de Agendamento</h3>
          <div className="form-group">
            <label>Título do Agendamento</label>
            <textarea
              value={transferData.scheduleTitle}
              onChange={(e) => handleChange('scheduleTitle', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descrição do Agendamento</label>
            <textarea
              value={transferData.scheduleDescription}
              onChange={(e) => handleChange('scheduleDescription', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>WhatsApp</h3>
          <div className="form-group">
            <label>Texto do Botão</label>
            <input
              type="text"
              value={transferData.whatsappButtonText}
              onChange={(e) => handleChange('whatsappButtonText', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Número do WhatsApp (com código do país, ex: 5585999999999)</label>
            <input
              type="tel"
              value={transferData.whatsappNumber}
              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              placeholder="5585999999999"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="save-button">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/admin/dashboard")} 
            className="cancel-button"
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransferBeberibe;
