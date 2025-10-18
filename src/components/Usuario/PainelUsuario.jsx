import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  FiUser, FiCheckCircle, FiClock, FiXCircle, 
  FiMail, FiTruck, FiCheck, FiFilter, FiSearch,
  FiChevronDown, FiChevronUp, FiInfo, FiCalendar
} from 'react-icons/fi';
import PainelUsuarioChat from './PainelUsuarioChat';
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton';
import './PainelUsuario.css';
import './PainelUsuarioChat.css';

// Componente de Filtros Avançados
const FiltrosReservas = ({ filtros, setFiltros, statusOptions }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="filtros-container">
      <div className="filtros-header" onClick={() => setExpandido(!expandido)}>
        <FiFilter />
        <span>Filtrar Reservas</span>
        {expandido ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      
      {expandido && (
        <div className="filtros-conteudo">
          <div className="filtro-grupo">
            <label>Status</label>
            <div className="filtro-opcoes">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  className={`filtro-botao ${filtros.status.includes(status.value) ? 'ativo' : ''}`}
                  onClick={() => {
                    setFiltros(prev => {
                      const newStatus = prev.status.includes(status.value)
                        ? prev.status.filter(s => s !== status.value)
                        : [...prev.status, status.value];
                      return { ...prev, status: newStatus };
                    });
                  }}
                >
                  {status.icon} {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filtro-grupo">
            <label>Período</label>
            <div className="filtro-periodo">
              <div className="filtro-input">
                <FiCalendar />
                <input 
                  type="date" 
                  value={filtros.dataInicio || ''}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                />
              </div>
              <span>até</span>
              <div className="filtro-input">
                <FiCalendar />
                <input 
                  type="date" 
                  value={filtros.dataFim || ''}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="filtro-grupo">
            <label>Buscar</label>
            <div className="filtro-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Pesquisar reservas..."
                value={filtros.termoBusca}
                onChange={(e) => setFiltros({...filtros, termoBusca: e.target.value})}
              />
            </div>
          </div>

          <button 
            className="filtro-limpar"
            onClick={() => setFiltros({
              status: [],
              dataInicio: '',
              dataFim: '',
              termoBusca: ''
            })}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para exibir informações de pagamento
const PagamentoInfo = ({ reserva }) => {
  const { pagamento, metodoPagamento, statusPagamento, valorPago } = reserva;
  
  if (!pagamento && !metodoPagamento && !statusPagamento) return <>Não informado</>;
  if (typeof pagamento === 'string') return <>{pagamento}</>;
  
  if (typeof pagamento === 'object' && pagamento !== null) {
    if (pagamento.status || pagamento.status_detail) {
      return (
        <span>
          <strong>Método:</strong> {pagamento.metodo || metodoPagamento || 'Mercado Pago'}<br />
          <strong>Status:</strong> {pagamento.status || statusPagamento || 'Desconhecido'}<br />
          {pagamento.status_detail && (<><strong>Detalhe:</strong> {pagamento.status_detail}<br /></>)}
          {pagamento.transaction_amount && (<><strong>Valor:</strong> R$ {Number(pagamento.transaction_amount).toFixed(2).replace('.', ',')}<br /></>)}
          {pagamento.id && (<><strong>ID:</strong> {pagamento.id}<br /></>)}
        </span>
      );
    }
    
    if (pagamento.qr_code || pagamento.pixKey) {
      return (
        <span>
          <strong>Método:</strong> Pix<br />
          {pagamento.status && (<><strong>Status:</strong> {pagamento.status}<br /></>)}
          {pagamento.valor && (<><strong>Valor:</strong> R$ {Number(pagamento.valor).toFixed(2).replace('.', ',')}<br /></>)}
          {pagamento.qr_code && (<><strong>QR Code:</strong> {pagamento.qr_code}<br /></>)}
        </span>
      );
    }
    
    return (
      <span>
        <strong>Método:</strong> {metodoPagamento || 'Desconhecido'}<br />
        {statusPagamento && (<><strong>Status:</strong> {statusPagamento}<br /></>)}
        {valorPago && (<><strong>Valor Pago:</strong> R$ {Number(valorPago).toFixed(2).replace('.', ',')}<br /></>)}
      </span>
    );
  }
  
  return <>{metodoPagamento || statusPagamento || 'Não informado'}</>;
};

const PainelUsuario = () => {
  const safeValue = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };

  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    status: [],
    dataInicio: '',
    dataFim: '',
    termoBusca: ''
  });

  // Função para obter informações detalhadas do status
  const getStatusInfo = (status) => {
    const statusData = {
      'pendente': {
        label: 'Pendente',
        message: 'Sua reserva foi recebida e está sendo processada. Em breve será delegada para um de nossos motoristas.',
        icon: '⏳',
        color: '#fbbf24'
      },
      'delegada': {
        label: 'Delegada',
        message: 'Sua reserva foi atribuída a um motorista. Aguarde a confirmação.',
        icon: '🚗',
        color: '#3b82f6'
      },
      'confirmada': {
        label: 'Confirmada',
        message: 'Excelente! Um dos nossos motoristas confirmou sua viagem e já a tem em sua agenda. Você receberá informações de contato em breve.',
        icon: '✅',
        color: '#10b981'
      },
      'aguardando_aprovacao': {
        label: 'Viagem Realizada',
        message: 'Sua viagem foi realizada! Estamos processando os dados finais da viagem para conclusão.',
        icon: '🔄',
        color: '#f97316'
      },
      'aprovada': {
        label: 'Concluída',
        message: 'Sua viagem foi concluída com sucesso! Esperamos que tenha tido uma ótima experiência conosco.',
        icon: '🎉',
        color: '#16a34a'
      },
      'concluida': {
        label: 'Concluída',
        message: 'Sua viagem foi concluída com sucesso! Esperamos que tenha tido uma ótima experiência conosco.',
        icon: '🎉',
        color: '#059669'
      },
      'pendente_correcao': {
        label: 'Em Revisão',
        message: 'Estamos revisando alguns detalhes da sua viagem. Em breve entraremos em contato.',
        icon: '🔍',
        color: '#ef4444'
      },
      'cancelada': {
        label: 'Cancelada',
        message: 'Esta reserva foi cancelada. Entre em contato conosco se precisar de esclarecimentos.',
        icon: '❌',
        color: '#ef4444'
      }
    };
    return statusData[status] || {
      label: status,
      message: 'Status da reserva atualizado.',
      icon: 'ℹ️',
      color: '#6b7280'
    };
  };

  // Opções de status para os filtros
  const statusOptions = useMemo(() => [
    { value: 'pendente', label: 'Pendentes', icon: '⏳', color: '#fbbf24' },
    { value: 'delegada', label: 'Delegadas', icon: '🚗', color: '#3b82f6' },
    { value: 'confirmada', label: 'Confirmadas', icon: '✅', color: '#10b981' },
    { value: 'concluida', label: 'Concluídas', icon: '🎉', color: '#059669' },
    { value: 'cancelada', label: 'Canceladas', icon: '❌', color: '#ef4444' },
    { value: 'aguardando_aprovacao', label: 'Em Aprovação', icon: '🔄', color: '#f97316' },
    { value: 'pendente_correcao', label: 'Em Revisão', icon: '🔍', color: '#ef4444' }
  ], []);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) return;
      const q = query(collection(db, 'reservas'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const reservasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(reservasData);
      setLoading(false);
    };
    fetchReservas();
  }, [user]);

  // Filtrar reservas com base nos filtros selecionados
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por status
      if (filtros.status.length > 0 && !filtros.status.includes(reserva.status)) {
        return false;
      }
      
      // Filtro por termo de busca
      if (filtros.termoBusca) {
        const termo = filtros.termoBusca.toLowerCase();
        const camposBusca = [
          reserva.pacoteTitulo,
          reserva.pontoPartida,
          reserva.pontoDestino,
          reserva.observacoes,
          reserva.motivoCancelamento
        ].join(' ').toLowerCase();
        
        if (!camposBusca.includes(termo)) {
          return false;
        }
      }
      
      // Filtro por data
      if (filtros.dataInicio || filtros.dataFim) {
        const dataReserva = new Date(reserva.dataIda);
        const inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        const fim = filtros.dataFim ? new Date(filtros.dataFim) : null;
        
        if (inicio && dataReserva < inicio) return false;
        if (fim && dataReserva > fim) return false;
      }
      
      return true;
    });
  }, [reservas, filtros]);

  // Calcular totais
  const { total, pendentes, delegadas, confirmadas, concluidas, canceladas } = useMemo(() => {
    return {
      total: reservas.length,
      pendentes: reservas.filter(r => r.status === 'pendente').length,
      delegadas: reservas.filter(r => r.status === 'delegada').length,
      confirmadas: reservas.filter(r => r.status === 'confirmada').length,
      concluidas: reservas.filter(r => 
        r.status === 'concluida' || 
        r.status === 'aguardando_aprovacao' || 
        r.status === 'aprovada'
      ).length,
      canceladas: reservas.filter(r => 
        r.status === 'cancelada' || 
        r.status === 'pendente_correcao'
      ).length
    };
  }, [reservas]);

  if (!user) {
    return <div className="pu-bg"><div className="pu-container"><p>Faça login para ver suas reservas.</p></div></div>;
  }

  return (
    <div className="pu-bg">
      <div className="pu-dashboard">
        <div className="pu-header">
          <div className="pu-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="pu-avatar-img" />
            ) : (
              <FiUser className="pu-icon" />
            )}
          </div>
          <div className="pu-info">
            <h2>{user.displayName || 'Usuário'}</h2>
            <div className="pu-email"><FiMail /> {user.email}</div>
            <div className="pu-stats-badge">
              <span>{total} reservas</span>
              <span>{concluidas} concluídas</span>
            </div>
          </div>
        </div>

        <div className="pu-resumo">
          <div className="pu-resumo-card pu-total">
            <span>Total</span>
            <strong>{total}</strong>
          </div>
          <div className="pu-resumo-card pu-pendente">
            <FiClock />
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
          <div className="pu-resumo-card pu-delegada">
            <FiTruck />
            <span>Delegadas</span>
            <strong>{delegadas}</strong>
          </div>
          <div className="pu-resumo-card pu-confirmada">
            <FiCheckCircle />
            <span>Confirmadas</span>
            <strong>{confirmadas}</strong>
          </div>
          <div className="pu-resumo-card pu-concluida">
            <FiCheck />
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
          </div>
          <div className="pu-resumo-card pu-cancelada">
            <FiXCircle />
            <span>Canceladas</span>
            <strong>{canceladas}</strong>
          </div>
        </div>

        <div className="pu-lista-container">
          <div className="pu-lista-header">
            <h3>Minhas Reservas</h3>
            <div className="pu-lista-info">
              <span>{reservasFiltradas.length} de {reservas.length} reservas</span>
              <FiltrosReservas 
                filtros={filtros}
                setFiltros={setFiltros}
                statusOptions={statusOptions}
              />
            </div>
          </div>

          {loading ? (
            <div className="pu-loading">
              <div className="pu-loading-spinner"></div>
              <p>Carregando suas reservas...</p>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="pu-empty-state">
              <FiInfo size={48} />
              <h4>Nenhuma reserva encontrada</h4>
              <p>
                {filtros.status.length > 0 || filtros.termoBusca || filtros.dataInicio || filtros.dataFim
                  ? "Tente ajustar seus filtros de busca"
                  : "Você ainda não fez nenhuma reserva"}
              </p>
            </div>
          ) : (
            <div className="pu-reservas-grid">
              {reservasFiltradas.map(reserva => {
                const statusInfo = getStatusInfo(reserva.status);
                return (
                  <div key={reserva.id} className={`pu-reserva-card pu-${safeValue(reserva.status)}`}>
                    <div className="pu-reserva-card-header">
                      <span className="pu-pacote">{safeValue(reserva.pacoteTitulo)}</span>
                      <span 
                        className={`pu-status pu-${safeValue(reserva.status)}`}
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="pu-status-message">
                      <p>{statusInfo.message}</p>
                    </div>

                    <div className="pu-reserva-card-body">
                      <div><strong>Data:</strong> {safeValue(reserva.dataIda)} <strong>Hora:</strong> {safeValue(reserva.horaIda)}</div>
                      <div><strong>Origem:</strong> {safeValue(reserva.pontoPartida) || safeValue(reserva.origem) || 'Não informado'}</div>
                      <div><strong>Destino:</strong> {safeValue(reserva.pontoDestino) || safeValue(reserva.pacoteTitulo) || 'Não informado'}</div>
                      <div><strong>Valor:</strong> R$ {typeof reserva.valorTotal === 'number' ? reserva.valorTotal.toFixed(2).replace('.', ',') : safeValue(reserva.valorTotal)}</div>
                      <div><strong>Pagamento:</strong> <PagamentoInfo reserva={reserva} /></div>
                      {reserva.observacoes && <div><strong>Obs:</strong> {safeValue(reserva.observacoes)}</div>}
                    </div>

                    {(reserva.status === 'confirmada' || reserva.status === 'delegada') && (
                      <div className="pu-contact-info">
                        <h4>📞 Informações de Contato</h4>
                        <p>Em breve você receberá os dados de contato do motorista responsável.</p>
                      </div>
                    )}

                    {reserva.motivoCancelamento && (
                      <div className="pu-cancelamento-info">
                        <h4>Motivo do Cancelamento:</h4>
                        <p>{safeValue(reserva.motivoCancelamento)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <PainelUsuarioChat />
      <WhatsAppButton />
    </div>
  );
};

export default PainelUsuario;