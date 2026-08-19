import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  FaMapPin, 
  FaCar, 
  FaCreditCard, 
  FaCalendarAlt,
  FaStar,
  FaWhatsapp
} from 'react-icons/fa';
import './TransferBeberibe.css';

const TransferBeberibe = () => {
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

  useEffect(() => {
    const transferRef = doc(db, 'content', 'transferBeberibe');
    const unsubscribe = onSnapshot(transferRef, (docSnap) => {
      if (docSnap.exists()) {
        setTransferData(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar dados do transfer:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de fazer uma reserva de transfer.');
    const whatsappUrl = `https://wa.me/${transferData.whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="transfer-beberibe-section">
      <div className="transfer-beberibe-container">
        <div className="transfer-header">
          <h2 className="transfer-title">{transferData.title}</h2>
          <p className="transfer-subtitle">{transferData.subtitle}</p>
        </div>

        <div className="transfer-content">
          {/* Tripadvisor Badge */}
          <div className="transfer-item tripadvisor-item">
            <div className="item-icon"><FaStar /></div>
            <div className="item-content">
              <h3 className="item-title">{transferData.tripadvisorBadge}</h3>
              {transferData.tripadvisorLink && (
                <a 
                  href={transferData.tripadvisorLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tripadvisor-link"
                >
                  Link para conferir avaliação
                </a>
              )}
            </div>
          </div>

          {/* Vehicle Reservation */}
          <div className="transfer-item vehicle-item">
            <div className="item-icon"><FaCar /></div>
            <div className="item-content">
              <h3 className="item-title">{transferData.vehicleTitle}</h3>
              <p className="item-description">{transferData.vehicleDescription}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="transfer-item payment-item">
            <div className="item-icon"><FaCreditCard /></div>
            <div className="item-content">
              <h3 className="item-title">{transferData.paymentTitle}</h3>
              <p className="item-description">{transferData.paymentDescription}</p>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="transfer-item schedule-item">
            <div className="item-icon"><FaCalendarAlt /></div>
            <div className="item-content">
              <h3 className="item-title">{transferData.scheduleTitle}</h3>
              <p className="item-description">{transferData.scheduleDescription}</p>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div className="transfer-whatsapp-container">
            <button 
              className="transfer-whatsapp-button"
              onClick={handleWhatsAppClick}
            >
              <FaWhatsapp />
              {transferData.whatsappButtonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransferBeberibe;
