import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import './PainelUsuarioChat.css';

const SUGESTOES = [
  'Como faço uma nova reserva?',
  'Como acompanho o status?',
  'Como alterar meus dados?',
  'Preciso de suporte',
  'Quais formas de pagamento?',
];

const RESPOSTAS = {
  'Como faço uma nova reserva?': 'Para reservar, clique em reservar no pacote desejado e siga as instruções.',
  'Como acompanho o status?': 'O status aparece colorido em cada reserva no painel.',
  'Como alterar meus dados?': 'Em breve será possível editar seus dados pelo painel.',
  'Preciso de suporte': 'Fale conosco pelo WhatsApp no rodapé para suporte personalizado.',
  'Quais formas de pagamento?': 'Aceitamos PIX, cartão, dinheiro e transferência bancária.',
};

const MENSAGENS_FIXAS = [
  { from: 'bot', text: 'Olá! Sou sua assistente virtual. Como posso ajudar?' },
];

const PainelUsuarioChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(MENSAGENS_FIXAS);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setTimeout(() => {
      setMessages(msgs => ([
        ...msgs,
        { from: 'bot', text: RESPOSTAS[input] || 'Sou uma assistente virtual fixa. Para dúvidas específicas, use o WhatsApp no rodapé.' }
      ]));
    }, 600);
    setInput('');
  };

  const handleSugestao = (s) => {
    setInput(s);
  };

  return (
    <>
      <button className={`puchat-fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Abrir chat">
        {open ? <FiChevronDown /> : <FiMessageCircle />}
      </button>
      {open && (
        <div className="puchat-fixed">
          <div className="puchat-header">
            <FiMessageCircle className="puchat-icon" /> Assistente Virtual
            <button className="puchat-close" onClick={() => setOpen(false)} aria-label="Fechar chat"><FiChevronUp /></button>
          </div>
          <div className="puchat-sugestoes">
            {SUGESTOES.map((s, i) => (
              <button key={i} className="puchat-sugestao" onClick={() => handleSugestao(s)}>{s}</button>
            ))}
          </div>
          <div className="puchat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`puchat-msg ${msg.from}`}>{msg.text}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="puchat-form" onSubmit={handleSend} autoComplete="off">
            <input
              type="text"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit"><FiSend /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default PainelUsuarioChat;
