import React from "react";
import "./ModalSucessoReserva.css";

export default function ModalSucessoReserva({ isOpen, onClose, reservaId }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="icone-sucesso">✅</span>
          <h2>Reserva Confirmada!</h2>
        </div>
        <div className="modal-body">
          <p>Sua reserva foi criada com sucesso!</p>
          <div className="info-reserva">
            <strong>Número da Reserva:</strong>
            <span className="numero-reserva">{reservaId}</span>
          </div>
          <p className="mensagem-email">
            Você receberá um e-mail com o <strong>voucher da reserva</strong> em alguns instantes.
            Verifique também a caixa de spam.
          </p>
          <p className="mensagem-final">
            Obrigado por escolher a <strong>Transfer Fortaleza Tur</strong>!<br />
            Em breve entraremos em contato para confirmar os detalhes.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-fechar" onClick={onClose}>
            Fechar
          </button>
          <button className="btn-inicio" onClick={() => window.location.href = "/"}>
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
