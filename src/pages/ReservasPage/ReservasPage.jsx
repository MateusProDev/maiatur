import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaPlane, FaExchangeAlt, FaPlaneDeparture, FaHotel } from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import "./ReservasPage.css";

const ReservasPage = () => {
  const navigate = useNavigate();

  const opcoes = [
    {
      id: "passeio",
      titulo: "Passeio",
      descricao: "Reserve um passeio turístico completo",
      icone: <FaRoute size={40} />,
      rota: "/reservas/passeio",
      cor: "#4CAF50",
    },
    {
      id: "transfer-chegada",
      titulo: "Transfer de Chegada",
      descricao: "Aeroporto → Hotel",
      icone: <FaPlane size={40} />,
      rota: "/reservas/transfer-chegada",
      cor: "#2196F3",
    },
    {
      id: "transfer-chegada-saida",
      titulo: "Transfer Chegada e Saída",
      descricao: "Aeroporto → Hotel → Aeroporto",
      icone: <FaExchangeAlt size={40} />,
      rota: "/reservas/transfer-chegada-e-saida",
      cor: "#9C27B0",
    },
    {
      id: "transfer-saida",
      titulo: "Transfer de Saída",
      descricao: "Hotel → Aeroporto",
      icone: <FaPlaneDeparture size={40} />,
      rota: "/reservas/transfer-saida",
      cor: "#FF9800",
    },
    {
      id: "transfer-entre-hoteis",
      titulo: "Transfer entre Hotéis",
      descricao: "Hotel → Outro Hotel",
      icone: <FaHotel size={40} />,
      rota: "/reservas/transfer-entre-hoteis",
      cor: "#F44336",
    },
  ];

  return (
    <div className="reservas-page">
      <div className="reservas-header">
        <img 
          src="/android-chrome-512x512.png" 
          alt="Maiatur Logo" 
          className="reservas-logo"
        />
        <h1>Reservas Online</h1>
        <p>Escolha o tipo de serviço que deseja reservar</p>
      </div>

      <div className="reservas-grid">
        {opcoes.map((opcao) => (
          <div
            key={opcao.id}
            className="reserva-card"
            onClick={() => navigate(opcao.rota)}
            style={{ borderColor: opcao.cor }}
          >
            <div className="card-icone" style={{ color: opcao.cor }}>
              {opcao.icone}
            </div>
            <div className="reserva-card-content">
              <h3>{opcao.titulo}</h3>
              <p>{opcao.descricao}</p>
            </div>
            <button
              className="btn-reservar"
              style={{ backgroundColor: opcao.cor }}
            >
              Reservar Agora
            </button>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>📋 Importante</h3>
        <ul>
          <li>Reservas devem ser feitas com no mínimo 24 horas de antecedência</li>
          <li>Após a confirmação, você receberá um voucher por e-mail</li>
          <li>Você também pode confirmar via WhatsApp</li>
          <li>Leia nossa política de cancelamento antes de reservar</li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default ReservasPage;
