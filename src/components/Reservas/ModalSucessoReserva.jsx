import React from "react";
import "./ModalSucessoReserva.css";


export default function ModalSucessoReserva({ isOpen, onClose, reservaId }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sucesso">
          <span className="icone-sucesso" style={{ fontSize: 48, color: '#27ae60' }}>🎉</span>
          <h2 style={{ margin: '1rem 0 0.5rem 0', color: '#1a4d7a', fontWeight: 700, fontSize: '1.7rem' }}>Reserva Confirmada!</h2>
        </div>
        <div className="modal-body">
          <p style={{ textAlign: 'center', color: '#27ae60', fontSize: '1.15rem', fontWeight: 500, marginBottom: '1.2rem' }}>
            Sua reserva foi criada com sucesso!
          </p>
          <div className="info-reserva" style={{ background: '#f8f9fa', borderRadius: 8, padding: '1rem', margin: '0.5rem 0 1.5rem 0', textAlign: 'center', boxShadow: '0 2px 8px rgba(39,174,96,0.07)' }}>
            <span style={{ color: '#e67e22', fontWeight: 700, fontSize: '1rem', letterSpacing: 1 }}>Número da Reserva</span>
            <div className="numero-reserva" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e67e22', marginTop: 6, fontFamily: 'monospace', letterSpacing: 2 }}>{reservaId}</div>
          </div>
          <p className="mensagem-email" style={{ textAlign: 'center', color: '#555', marginBottom: '1.2rem' }}>
            Você receberá um e-mail com o <strong>voucher da reserva</strong> em alguns instantes.<br />
            <span style={{ color: '#e67e22' }}>Verifique também a caixa de spam.</span>
          </p>
          <div style={{ textAlign: 'center', margin: '1.2rem 0' }}>
            <span style={{ fontSize: '1.2rem', color: '#1a4d7a', fontWeight: 600 }}>Obrigado por escolher a Transfer Fortaleza Tur!</span>
            <br />
            <span style={{ color: '#27ae60', fontSize: '1rem' }}>Em breve entraremos em contato para confirmar os detalhes.</span>
          </div>
          <div style={{ textAlign: 'center', margin: '1.5rem 0 0.5rem 0', fontSize: '1.5rem' }}>✈️ 🏖️ 🌴 ☀️</div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: 0 }}>
          <button className="btn-fechar" style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, fontSize: '1rem', padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 600 }} onClick={onClose}>
            Fechar
          </button>
          <button className="btn-inicio" style={{ background: '#e67e22', color: 'white', border: 'none', borderRadius: 6, fontSize: '1rem', padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => window.location.href = "/"}>
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
