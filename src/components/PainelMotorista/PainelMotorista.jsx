


import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { FaUserTie, FaCarSide, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaHotel, FaPlaneDeparture, FaBars, FaChartBar, FaMoneyBillWave, FaListUl, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';
import './PainelMotorista.css';


const PainelMotorista = () => {
  // Função utilitária para garantir que o valor é string ou primitivo
  const safeValue = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };

  const [user, setUser] = useState(null);
  const [motorista, setMotorista] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroData, setFiltroData] = useState('');
  const [aba, setAba] = useState('reservas');
  const [navbarOpen, setNavbarOpen] = useState(window.innerWidth > 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Fecha navbar ao clicar fora no mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (window.innerWidth > 900) setNavbarOpen(true);
      else setNavbarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Escuta dados do motorista em tempo real
        const motoristaRef = doc(db, 'motoristas', user.uid);
        const unsubscribeMotorista = onSnapshot(motoristaRef, (docSnap) => {
          if (docSnap.exists()) {
            setMotorista(docSnap.data());
          } else {
            setMotorista(null);
          }
        });

        // Escuta reservas atribuídas ao motorista em tempo real
        const reservasQuery = query(
          collection(db, 'reservas'),
          where('motoristaId', '==', user.uid)
        );
        const unsubscribeReservas = onSnapshot(reservasQuery, (querySnapshot) => {
          const reservasData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Reserva data:', data); // Debug para ver a estrutura
            return {
              id: doc.id,
              ...data,
            };
          });
          setReservas(reservasData);
          setLoading(false);
        });

        // Cleanup
        return () => {
          unsubscribeMotorista();
          unsubscribeReservas();
        };
      } else {
        setUser(null);
        setMotorista(null);
        setReservas([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Função para verificar se uma reserva deve ser arquivada (após 24h de aprovada)
  const isReservaArquivada = (reserva) => {
    if (reserva.status === 'aprovada' && reserva.dataAprovacao) {
      const agora = new Date();
      const dataAprovacao = reserva.dataAprovacao.toDate ? reserva.dataAprovacao.toDate() : new Date(reserva.dataAprovacao);
      const diferencaHoras = (agora - dataAprovacao) / (1000 * 60 * 60);
      return diferencaHoras > 24;
    }
    return false;
  };

  // Função para extrair valor correto da reserva
  const getValorReserva = (reserva) => {
    // Lista de campos onde o valor pode estar
    const campos = [
      reserva.valor,
      reserva.preco,
      reserva.precoTotal,
      reserva.pacotePreco,
      reserva.price,
      reserva.amount,
      reserva.total,
      reserva.valorTotal,
      reserva.precoFinal,
      reserva.dados?.valor,
      reserva.dados?.preco,
      reserva.dados?.precoTotal,
      reserva.cliente?.valor,
      reserva.cliente?.preco,
      reserva.pagamento?.valor,
      reserva.pagamento?.amount
    ];
    
    // Procura o primeiro valor válido (número positivo)
    for (let campo of campos) {
      if (campo != null && campo !== '' && campo !== undefined) {
        // Remove caracteres não numéricos exceto ponto e vírgula
        const valorLimpo = String(campo).replace(/[^\d.,]/g, '');
        const valorNumerico = parseFloat(valorLimpo.replace(',', '.'));
        
        if (!isNaN(valorNumerico) && valorNumerico > 0) {
          console.log(`Valor encontrado para reserva ${reserva.id}:`, valorNumerico, 'de campo:', campo);
          return valorNumerico;
        }
      }
    }
    
    console.log(`Nenhum valor encontrado para reserva ${reserva.id}`, reserva);
    return 0;
  };

  // Função para calcular valor do motorista com valores fixos
  const getValorMotorista = (reserva) => {
    // Se tem valores fixos definidos
    if (reserva.pacote && reserva.pacote.valorPrimeiraViagem) {
      // Para pacotes ida e volta, verifica qual motorista
      if (reserva.tipoViagem === 'ida_volta' || reserva.isIdaEVolta) {
        // Se tem segunda viagem definida, retorna primeira viagem
        if (reserva.pacote.valorSegundaViagem) {
          return reserva.pacote.valorPrimeiraViagem;
        }
      }
      // Para qualquer viagem, retorna o valor da primeira viagem
      return reserva.pacote.valorPrimeiraViagem;
    }

    // Fallback para sistema antigo (percentual) - pode ser removido após migração
    const valorTotal = getValorReserva(reserva);
    let valorSinal = reserva.pacote?.valorSinal || (valorTotal * 0.30);
    const valorRestante = valorTotal - valorSinal;

    if (reserva.tipoViagem === 'ida_volta' || reserva.isIdaEVolta) {
      return valorRestante / 3;
    } else {
      return valorRestante / 2;
    }
  };

  // Função para obter info da divisão de valores fixos
  const getInfoDivisao = (reserva) => {
    // Se tem valores fixos definidos
    if (reserva.pacote && reserva.pacote.valorSinal && reserva.pacote.valorPrimeiraViagem) {
      if (reserva.tipoViagem === 'ida_volta' || reserva.isIdaEVolta) {
        return {
          tipo: 'ida_volta',
          divisao: '3 partes fixas',
          valorAgencia: reserva.pacote.valorSinal,
          valorMotoristaIda: reserva.pacote.valorPrimeiraViagem,
          valorMotoristaVolta: reserva.pacote.valorSegundaViagem || reserva.pacote.valorPrimeiraViagem,
          descricao: 'Valores Fixos: Agência + Motorista Ida + Motorista Volta',
          parteMotorista: 'Valor Fixo'
        };
      } else {
        return {
          tipo: 'ida',
          divisao: '2 partes fixas',
          valorAgencia: reserva.pacote.valorSinal,
          valorMotorista: reserva.pacote.valorPrimeiraViagem,
          descricao: 'Valores Fixos: Agência + Motorista',
          parteMotorista: 'Valor Fixo'
        };
      }
    }

    // Fallback para sistema antigo (percentual)
    const valorTotal = getValorReserva(reserva);
    const valorSinal = valorTotal * 0.30;
    const valorRestante = valorTotal - valorSinal;
    
    if (reserva.tipoViagem === 'ida_volta' || reserva.isIdaEVolta) {
      return {
        tipo: 'ida_volta',
        divisao: '3 partes',
        valorAgencia: valorRestante / 3,
        valorMotoristaIda: valorRestante / 3,
        valorMotoristaVolta: valorRestante / 3,
        descricao: 'Agência + Motorista Ida + Motorista Volta',
        parteMotorista: '1/3'
      };
    } else {
      return {
        tipo: 'ida',
        divisao: '2 partes',
        valorAgencia: valorRestante / 2,
        valorMotorista: valorRestante / 2,
        descricao: 'Agência + Motorista',
        parteMotorista: '1/2'
      };
    }
  };

  // Função para obter informações do sinal com valores fixos
  const getInfoSinal = (reserva) => {
    // Se tem valor fixo do sinal definido
    if (reserva.pacote && reserva.pacote.valorSinal) {
      return {
        tipo: "valor_fixo",
        valor: reserva.pacote.valorSinal,
        valorCalculado: reserva.pacote.valorSinal
      };
    }

    // Fallback para sistema antigo (sinalConfig)
    if (reserva.pacote && reserva.pacote.sinalConfig) {
      const sinalConfig = reserva.pacote.sinalConfig;
      const valorTotal = getValorReserva(reserva);
      
      if (sinalConfig.tipo === "porcentagem") {
        return {
          tipo: "porcentagem",
          valor: sinalConfig.valor,
          valorCalculado: (valorTotal * sinalConfig.valor) / 100
        };
      } else {
        return {
          tipo: "valor",
          valor: sinalConfig.valor,
          valorCalculado: sinalConfig.valor
        };
      }
    }

    // Padrão: 30%
    const valorTotal = getValorReserva(reserva);
    return {
      tipo: "porcentagem",
      valor: 30,
      valorCalculado: valorTotal * 0.30
    };
  };

  // Função para notificar recebimento da reserva
  const notificarRecebimento = async (reserva) => {
    try {
      if (!reserva.clienteTelefone && !reserva.telefone && !reserva.whatsapp) {
        alert('Telefone do cliente não encontrado para envio da notificação.');
        return;
      }

      const telefone = reserva.clienteTelefone || reserva.telefone || reserva.whatsapp;
      const mensagem = `🎉 *Reserva Confirmada!*

Olá ${reserva.clienteNome || 'Cliente'}!

Sua reserva foi *RECEBIDA* por nossa equipe de motoristas profissionais:

🚗 *Detalhes da Viagem:*
📅 Data: ${reserva.dataReserva || 'A definir'}
🕐 Horário: ${reserva.horario || 'A definir'}
📍 Origem: ${reserva.enderecoOrigem || reserva.origem || 'Conforme combinado'}
📍 Destino: ${reserva.enderecoDestino || reserva.destino || 'Conforme combinado'}

💰 *Valores:*
💸 Valor Total: R$ ${getValorReserva(reserva).toFixed(2)}
💳 Sinal Cliente: R$ ${getInfoSinal(reserva).valorCalculado.toFixed(2)} (${getInfoSinal(reserva).tipo === 'porcentagem' ? getInfoSinal(reserva).valor + '%' : 'Valor fixo'})
🚗 *Valor Motorista: R$ ${getValorMotorista(reserva).toFixed(2)}*

✅ *Status: CONFIRMADO*
🔔 Em breve entraremos em contato para finalizar os detalhes

Agradecemos a confiança! 

---
*20 Buscar - Agência de Turismo*
_Viagens seguras com motoristas profissionais_`;

      // Atualizar status para "confirmada" 
      const reservaRef = doc(db, 'reservas', reserva.id);
      await updateDoc(reservaRef, {
        status: 'confirmada',
        dataConfirmacao: new Date(),
        notificacaoRecebimento: true,
        updatedAt: new Date()
      });

      // Abrir WhatsApp
      const telefoneFormatado = telefone.replace(/\D/g, '');
      const url = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');

      alert('Notificação de recebimento enviada e status atualizado para CONFIRMADA!');
    } catch (error) {
      console.error('Erro ao notificar recebimento:', error);
      alert('Erro ao enviar notificação de recebimento');
    }
  };

  // Função para atualizar status da reserva
  const atualizarStatusReserva = async (reservaId, novoStatus) => {
    try {
      const reservaRef = doc(db, 'reservas', reservaId);
      const updateData = { 
        status: novoStatus,
        updatedAt: new Date()
      };

      let mensagemSucesso = '';

      if (novoStatus === 'confirmada') {
        updateData.dataConfirmacao = new Date();
        mensagemSucesso = 'Reserva confirmada com sucesso! Cliente será notificado.';
      } else if (novoStatus === 'concluida') {
        updateData.dataConclusao = new Date();
        updateData.aguardandoAprovacao = true;
        updateData.motoristaId = user?.uid;
        updateData.motoristaNome = motorista?.nome;
        mensagemSucesso = `Viagem marcada como CONCLUÍDA! 
        
⏳ Aguardando aprovação do dono da agência para liberação do pagamento.

Você será notificado assim que o pagamento for aprovado!`;
      } else if (novoStatus === 'cancelada') {
        updateData.dataCancelamento = new Date();
        updateData.motivoCancelamento = 'Cancelada pelo motorista';
        mensagemSucesso = 'Reserva cancelada. Cliente será notificado automaticamente.';
      } else {
        mensagemSucesso = `Reserva ${novoStatus} com sucesso!`;
      }

      await updateDoc(reservaRef, updateData);
      alert(mensagemSucesso);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da reserva');
    }
  };

  if (loading) return <div className="pm-container">Carregando...</div>;

  if (!motorista)
    return (
      <div className="pm-container">
        <h2>Motorista não encontrado</h2>
        <p>Faça login novamente ou cadastre-se.</p>
      </div>
    );


  // Função para notificar cliente com mensagem personalizada
  const notificarCliente = (reserva, tipo) => {
    const nomeMotorista = motorista.nome;
    const modelo = motorista.modelo;
    const cor = motorista.cor;
    const placa = motorista.placa;
    const origem = reserva.enderecoOrigem || reserva.origem || 'local de origem';
    const destino = reserva.enderecoDestino || reserva.destino || reserva.pacoteTitulo || 'destino';
    const cliente = reserva.clienteNome || reserva.nome || 'cliente';
    
    // Obter informações de divisão de valores
    const infoDivisao = getInfoDivisao(reserva);
    const valorMotorista = getValorMotorista(reserva);
    
    let mensagem = '';
    
    if (tipo === 'hotel') {
      mensagem = `*Olá, ${cliente}!* 

_Sua transferência com a 20 Buscar - Agência de Turismo_

*CHEGADA NO LOCAL DE ORIGEM*
Já estou te aguardando em: *${origem}*

*INFORMAÇÕES DO SEU MOTORISTA:*
• Nome: *${nomeMotorista}*
• Veículo: *${modelo}*
• Cor: *${cor}*  
• Placa: *${placa}*

*DESTINO:* ${destino}

💰 *VALOR DA SUA VIAGEM (${infoDivisao.parteMotorista}):*
*R$ ${valorMotorista.toFixed(2)}* - Pagar no final ao motorista

_Caso precise de algo ou não me encontre, entre em contato imediatamente pelo WhatsApp._

*Tenha uma excelente viagem!*

---
*20 Buscar - Agência de Turismo*
_Viagens incríveis com praticidade e segurança_`;
    } else if (tipo === 'aeroporto_chegada') {
      mensagem = `*Olá, ${cliente}!* 

_Sua transferência com a 20 Buscar - Agência de Turismo_

✈️ *CHEGADA NO AEROPORTO*
Por favor, dirija-se ao *PORTÃO 3* do aeroporto.
Estarei te aguardando lá!

*SEU MOTORISTA:*
• *${nomeMotorista}*
• Veículo: *${modelo} ${cor}*
• Placa: *${placa}*

📍 *DESTINO:* ${destino}

💰 *VALOR DA SUA VIAGEM (${infoDivisao.parteMotorista}):*
*R$ ${valorMotorista.toFixed(2)}* - Pagar no final - Pix do motorista

⚠️ *IMPORTANTE:*
• Dirija-se ao PORTÃO 3
• Procure pelo veículo ${modelo} ${cor}
• Entre em contato se tiver dúvidas

*Tenha uma excelente viagem!*

---
*20 Buscar - Agência de Turismo*
_Viagens seguras e confortáveis_`;
    } else if (tipo === 'aeroporto_destino') {
      mensagem = `*Olá, ${cliente}!* 

_Sua transferência com a 20 Buscar - Agência de Turismo_

*CHEGANDO AO DESTINO*
Estamos chegando em: *${destino}*
Saímos de: *${origem}*

*SEU MOTORISTA:*
• *${nomeMotorista}*
• Veículo: *${modelo} ${cor}*
• Placa: *${placa}*

💰 *PAGAMENTO DA VIAGEM:*
*R$ ${valorMotorista.toFixed(2)}* (${infoDivisao.parteMotorista} do valor total)

_Obrigado por escolher nossos serviços!_
_Avalie nossa experiência e nos recomende._

*Até a próxima viagem!*

---
*20 Buscar - Agência de Turismo*
_Viagens incríveis com praticidade e segurança_`;
    }
    // Busca telefone em vários campos possíveis e formata corretamente
    let phone = reserva.clienteTelefone || 
                reserva.telefone || 
                reserva.whatsapp || 
                reserva.phone ||
                reserva.clientePhone ||
                (reserva.cliente && reserva.cliente.telefone) || 
                (reserva.cliente && reserva.cliente.whatsapp) ||
                (reserva.dados && reserva.dados.telefone) ||
                '';
                
    // Remove tudo que não é número
    phone = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (phone && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    console.log('Telefone original:', reserva.clienteTelefone || reserva.telefone);
    console.log('Telefone formatado:', phone);
    
    if (!phone || phone.length < 12) {
      alert('Telefone/WhatsApp do cliente não informado ou inválido.');
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Filtro de reservas
  const reservasFiltradas = reservas.filter((reserva) => {
    let statusOk = filtroStatus === 'todos' || reserva.status === filtroStatus;
    let dataOk = true;
    if (filtroData) {
      // Suporta tanto string quanto Timestamp
      let dataReserva = reserva.dataReserva;
      let dataSimples = '';
      if (dataReserva && dataReserva.toDate) {
        dataSimples = dataReserva.toDate().toISOString().slice(0, 10);
      } else if (typeof dataReserva === 'string') {
        dataSimples = dataReserva.slice(0, 10);
      }
      // Também verifica o campo reserva.data (caso dataReserva não exista)
      let dataCampoData = '';
      if (reserva.data && typeof reserva.data === 'string') {
        // Tenta converter para formato yyyy-mm-dd
        const partes = reserva.data.split(/[/-]/);
        if (partes.length >= 3) {
          // Suporta formatos dd/mm/yyyy, yyyy-mm-dd, etc
          if (partes[0].length === 4) {
            // yyyy-mm-dd
            dataCampoData = `${partes[0]}-${partes[1].padStart(2, '0')}-${partes[2].padStart(2, '0')}`;
          } else {
            // dd/mm/yyyy
            dataCampoData = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
          }
        }
      }
      dataOk = (dataSimples === filtroData) || (dataCampoData === filtroData);
    }
    return statusOk && dataOk;
  });

  // Separar reservas ativas das finalizadas/arquivadas
  const reservasAbertas = reservasFiltradas.filter(reserva => {
    return ['pendente', 'delegada', 'confirmada', 'concluida'].includes(reserva.status) && 
           !isReservaArquivada(reserva) && 
           reserva.status !== 'aprovada';
  });
  
  const reservasFinalizadas = reservasFiltradas.filter(reserva => {
    return reserva.status === 'aprovada' || isReservaArquivada(reserva);
  });

  // Organizar reservas abertas por prioridade (mais urgentes primeiro)
  const reservasAbertasOrdenadas = reservasAbertas.sort((a, b) => {
    // Prioridade: pendente > delegada > confirmada > concluida/aguardandoAprovacao
    const prioridade = {
      'pendente': 1,
      'delegada': 2, 
      'confirmada': 3,
      'concluida': 4,
      'aguardandoAprovacao': 4
    };
    
    const prioridadeA = prioridade[a.status] || 5;
    const prioridadeB = prioridade[b.status] || 5;
    
    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }
    
    // Se mesma prioridade, ordenar por data (mais recentes primeiro)
    const dataA = a.dataReserva ? new Date(a.dataReserva) : new Date(0);
    const dataB = b.dataReserva ? new Date(b.dataReserva) : new Date(0);
    return dataB - dataA;
  });

  // Organizar reservas finalizadas por data de aprovação (mais recentes primeiro)
  const reservasFinalizadasOrdenadas = reservasFinalizadas.sort((a, b) => {
    const dataAprovacaoA = a.dataAprovacao ? new Date(a.dataAprovacao.toDate ? a.dataAprovacao.toDate() : a.dataAprovacao) : new Date(0);
    const dataAprovacaoB = b.dataAprovacao ? new Date(b.dataAprovacao.toDate ? b.dataAprovacao.toDate() : b.dataAprovacao) : new Date(0);
    return dataAprovacaoB - dataAprovacaoA;
  });

  // Lista de status únicos para filtro
  const statusList = Array.from(new Set(reservas.map(r => r.status))).filter(Boolean);

  return (
    <div className="pm-bg">
      {/* Botão menu mobile fixo no topo */}
      <button className="pm-mobile-menu-btn" onClick={() => setNavbarOpen(!navbarOpen)}>
        <FaBars size={20} />
      </button>
      
      {/* Overlay para fechar menu no mobile */}
      {navbarOpen && isMobile && (
        <div className="pm-mobile-overlay active" onClick={() => setNavbarOpen(false)}></div>
      )}
      
      <aside className={`pm-navbar ${navbarOpen ? 'active' : ''}`}>
        <div className="pm-navbar-header">
          <span className="pm-navbar-title">Painel do Motorista</span>
        </div>
        <nav className="pm-navbar-list">
          <button className={aba === 'reservas' ? 'active' : ''} onClick={() => { setAba('reservas'); if(isMobile) setNavbarOpen(false); }}>
            <FaListUl /> Reservas
          </button>
          <button className={aba === 'ganhos' ? 'active' : ''} onClick={() => { setAba('ganhos'); if(isMobile) setNavbarOpen(false); }}>
            <FaMoneyBillWave /> Ganhos
          </button>
          <button className={aba === 'graficos' ? 'active' : ''} onClick={() => { setAba('graficos'); if(isMobile) setNavbarOpen(false); }}>
            <FaChartBar /> Gráficos
          </button>
        </nav>
      </aside>
      
      <main className="pm-container pm-motorista-panel">
        {/* Perfil do Motorista - Reorganizado */}
        <div className="pm-motorista-profile">
          <div className="pm-motorista-avatar">
            <span className="pm-motorista-avatar-circle">
              <FaUserTie size={24} />
            </span>
          </div>
          <div className="pm-motorista-info">
            <h2>{motorista.nome}</h2>
            <div className="pm-motorista-dados">
              <div className="pm-motorista-dado">
                <FaEnvelope className="pm-icon" />
                <span>{motorista.email}</span>
              </div>
              <div className="pm-motorista-dado">
                <FaPhoneAlt className="pm-icon" />
                <span>{motorista.telefone}</span>
              </div>
              <div className="pm-motorista-dado">
                <FaCarSide className="pm-icon" />
                <span>{motorista.modelo} | {motorista.cor} | {motorista.placa}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Resumo Rápido */}
        <div className="pm-summary-panel">
          <div className="pm-summary-card pm-summary-pending">
            <div className="pm-summary-icon">
              <FaCalendarAlt />
            </div>
            <div className="pm-summary-info">
              <span className="pm-summary-number">
                {reservasAbertas.length}
              </span>
              <span className="pm-summary-label">Reservas Abertas</span>
            </div>
          </div>

          <div className="pm-summary-card pm-summary-waiting">
            <div className="pm-summary-icon">
              <FaMoneyBillWave />
            </div>
            <div className="pm-summary-info">
              <span className="pm-summary-number">
                R$ {reservas
                  .filter(r => r.status === 'concluida' || r.aguardandoAprovacao)
                  .reduce((total, r) => total + getValorMotorista(r), 0)
                  .toFixed(2).replace('.', ',')}
              </span>
              <span className="pm-summary-label">Aguardando Aprovação</span>
            </div>
          </div>

          <div className="pm-summary-card pm-summary-earnings">
            <div className="pm-summary-icon">
              <FaCheckCircle />
            </div>
            <div className="pm-summary-info">
              <span className="pm-summary-number">
                R$ {reservas
                  .filter(r => r.status === 'aprovada')
                  .reduce((total, r) => total + getValorMotorista(r), 0)
                  .toFixed(2).replace('.', ',')}
              </span>
              <span className="pm-summary-label">Saldo Disponível</span>
            </div>
          </div>

          <div className="pm-summary-card pm-summary-total">
            <div className="pm-summary-icon">
              <FaCheckCircle />
            </div>
            <div className="pm-summary-info">
              <span className="pm-summary-number">{reservasFinalizadas.length}</span>
              <span className="pm-summary-label">Finalizadas</span>
            </div>
          </div>
        </div>

        <hr className="pm-motorista-divider" />
        {aba === 'reservas' && (
          <>
            <div className="pm-motorista-filtros">
              <label>
                <b>Status:</b>
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="pm-motorista-select">
                  <option value="todos">Todos</option>
                  {statusList.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label>
                <b>Data:</b>
                <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} className="pm-motorista-date" />
              </label>
            </div>
            
            {/* Reservas Abertas (Para Concluir) */}
            <h3 className="pm-motorista-title pm-section-open">
              <FaCalendarAlt className="pm-icon" /> Reservas Abertas - Para Concluir
            </h3>
            {reservasAbertasOrdenadas.length === 0 ? (
              <p className="pm-motorista-empty">Nenhuma reserva aberta encontrada.</p>
            ) : (
              <div className="pm-motorista-reservas-list">
                {reservasAbertasOrdenadas.map((reserva) => (
                  <div key={reserva.id} className="pm-motorista-reserva-card">
                    <div className="pm-motorista-reserva-info">
                      <div><FaUserTie className="pm-icon" /> <b>Cliente:</b> {safeValue(reserva.clienteNome) || safeValue(reserva.nome) || safeValue(reserva.clienteEmail) || safeValue(reserva.cliente) || 'Não informado'}</div>
                      <div><FaPhoneAlt className="pm-icon" /> <b>Telefone:</b> {
                        safeValue(reserva.clienteTelefone) || 
                        safeValue(reserva.telefone) || 
                        safeValue(reserva.whatsapp) || 
                        safeValue(reserva.phone) ||
                        safeValue(reserva.clientePhone) ||
                        safeValue(reserva.userPhone) ||
                        (reserva.cliente && safeValue(reserva.cliente.telefone)) || 
                        (reserva.cliente && safeValue(reserva.cliente.whatsapp)) ||
                        (reserva.cliente && safeValue(reserva.cliente.phone)) ||
                        (reserva.dados && safeValue(reserva.dados.telefone)) ||
                        (reserva.dados && safeValue(reserva.dados.whatsapp)) ||
                        'Não informado'
                      }</div>
                      <div><FaEnvelope className="pm-icon" /> <b>Email:</b> {
                        safeValue(reserva.clienteEmail) ||
                        safeValue(reserva.email) ||
                        safeValue(reserva.userEmail) ||
                        (reserva.cliente && safeValue(reserva.cliente.email)) ||
                        (reserva.dados && safeValue(reserva.dados.email)) ||
                        'Não informado'
                      }</div>
                      <div><FaUsers className="pm-icon" /> <b>Passageiros:</b> {
                        safeValue(reserva.passageirosFormatado) || 
                        (reserva.totalPassageiros && reserva.adultos !== undefined && reserva.criancas !== undefined && reserva.infantis !== undefined) 
                          ? `${safeValue(reserva.totalPassageiros)}(${safeValue(reserva.adultos)}-${safeValue(reserva.criancas)}-${safeValue(reserva.infantis)})`
                          : '1(1-0-0)'
                      }</div>
                      <div><FaMapMarkerAlt className="pm-icon" /> <b>Origem:</b> {
                        safeValue(reserva.enderecoOrigem) || 
                        safeValue(reserva.origem) ||
                        safeValue(reserva.enderecoColeta) ||
                        'Não informado'
                      }</div>
                      <div><FaMapMarkerAlt className="pm-icon" /> <b>Destino:</b> {
                        safeValue(reserva.enderecoDestino) ||
                        safeValue(reserva.destino) ||
                        safeValue(reserva.pacoteTitulo) || 
                        safeValue(reserva.pacoteNome) ||
                        safeValue(reserva.titulo) ||
                        safeValue(reserva.enderecoEntrega) ||
                        'Não informado'
                      }</div>
                      <div><FaCalendarAlt className="pm-icon" /> <b>Data/Hora:</b> {
                        reserva.dataReserva?.toDate ? reserva.dataReserva.toDate().toLocaleString() : 
                        safeValue(reserva.dataReserva) || safeValue(reserva.data) || 'Não informado'
                      }</div>
                      <div><FaCalendarAlt className="pm-icon" /> <b>Horário:</b> {
                        safeValue(reserva.horario) || 
                        safeValue(reserva.horarioReserva) ||
                        safeValue(reserva.timeReserva) ||
                        (reserva.dados && safeValue(reserva.dados.horario)) ||
                        'Não informado'
                      }
                      </div>
                      <div><FaMoneyBillWave className="pm-icon" /> <b>Valores:</b> 
                        {getValorReserva(reserva) > 0 ? (
                          <div style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                            <div>💰 Total: R$ {getValorReserva(reserva).toFixed(2)}</div>
                            <div>💳 Sinal: R$ {getInfoSinal(reserva).valorCalculado.toFixed(2)} ({getInfoSinal(reserva).tipo === 'porcentagem' ? getInfoSinal(reserva).valor + '%' : 'Fixo'})</div>
                            <div style={{ color: '#28a745', fontWeight: 'bold' }}>🚗 Seu valor ({getInfoDivisao(reserva).parteMotorista}): R$ {getValorMotorista(reserva).toFixed(2)}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                              📊 Divisão: {getInfoDivisao(reserva).descricao}
                            </div>
                          </div>
                        ) : 'Não informado'}
                      </div>
                      <div><FaCheckCircle className="pm-icon" /> <b>Status:</b> 
                        <span className={`pm-status-badge pm-status-${safeValue(reserva.status)}`}>{safeValue(reserva.status)}</span>
                      </div>

                      {/* Informações de Aprovação/Notificações */}
                      {reserva.status === 'concluida' && reserva.aguardandoAprovacao && (
                        <div className="pm-notification-box pm-waiting-approval">
                          <FaMoneyBillWave className="pm-icon" />
                          <div>
                            <span><b>⏳ Aguardando Aprovação do Dono da Agência</b></span>
                            <p>Sua viagem foi concluída com sucesso! Você receberá <strong>R$ {getValorMotorista(reserva).toFixed(2)}</strong> (descontado o sinal de R$ {getInfoSinal(reserva).valorCalculado.toFixed(2)}) após aprovação.</p>
                            <small>
                              ✅ Concluída em: {reserva.dataConclusao ? new Date(reserva.dataConclusao.toDate ? reserva.dataConclusao.toDate() : reserva.dataConclusao).toLocaleString() : 'Agora'}
                              <br />
                              🔔 Você receberá uma notificação quando for aprovada
                            </small>
                          </div>
                        </div>
                      )}

                      {reserva.conclusaoRejeitada && (
                        <div className="pm-notification-box pm-rejected">
                          <FaTimes className="pm-icon" />
                          <div>
                            <span><b>❌ Conclusão Rejeitada pelo Dono da Agência</b></span>
                            <p>A conclusão da sua viagem foi rejeitada e precisa ser corrigida.</p>
                            {reserva.motivoRejeicao && (
                              <p><strong>Motivo:</strong> {reserva.motivoRejeicao}</p>
                            )}
                            <p><strong>Ação necessária:</strong> Corrija os problemas e conclua novamente a viagem.</p>
                            {reserva.dataRejeicao && (
                              <small>Rejeitada em: {new Date(reserva.dataRejeicao.toDate ? reserva.dataRejeicao.toDate() : reserva.dataRejeicao).toLocaleString()}</small>
                            )}
                          </div>
                        </div>
                      )}

                      {reserva.status === 'aprovada' && (
                        <div className="pm-notification-box pm-approved">
                          <FaCheckCircle className="pm-icon" />
                          <div>
                            <span><b>🎉 Viagem Aprovada e Paga!</b></span>
                            <p>Parabéns! O dono da agência aprovou sua viagem.</p>
                            <p><strong>Valor liberado: R$ {getValorReserva(reserva).toFixed(2)}</strong></p>
                            {reserva.dataAprovacao && (
                              <small>Aprovada em: {new Date(reserva.dataAprovacao.toDate ? reserva.dataAprovacao.toDate() : reserva.dataAprovacao).toLocaleString()}</small>
                            )}
                          </div>
                        </div>
                      )}

                      {reserva.status === 'rejeitada' && (
                        <div className="pm-notification-box pm-rejected">
                          <FaTimes className="pm-icon" />
                          <span><b>Viagem Rejeitada:</b> Entre em contato com a agência para mais informações.</span>
                          {reserva.motivoRejeicao && (
                            <small>Motivo: {reserva.motivoRejeicao}</small>
                          )}
                        </div>
                      )}

                      {/* Observações/Comentários */}
                      {(reserva.observacoes || reserva.comentarios || reserva.observacao) && (
                        <div className="pm-observacoes">
                          <b>Observações:</b> {reserva.observacoes || reserva.comentarios || reserva.observacao}
                        </div>
                      )}

                      {/* Passageiros */}
                      {reserva.passageiros && (
                        <div><FaUserTie className="pm-icon" /> <b>Passageiros:</b> {reserva.passageiros} pessoas</div>
                      )}

                      {/* Tipo de viagem */}
                      {reserva.tipoViagem && (
                        <div><FaCarSide className="pm-icon" /> <b>Tipo:</b> {reserva.tipoViagem}</div>
                      )}
                    </div>
                    <div className="pm-motorista-btns">
                      {/* Botões de Notificação - Sempre disponíveis para reservas ativas */}
                      <div className="pm-notification-btns">
                        <button className="pm-btn-hotel" title="Notificar: Chegada no local de origem" onClick={() => notificarCliente(reserva, 'hotel')}>
                          <FaHotel className="pm-icon" /> Chegada Origem
                        </button>
                        <button className="pm-btn-aeroporto" title="Notificar: Chegada no aeroporto - Portão 3" onClick={() => notificarCliente(reserva, 'aeroporto_chegada')}>
                          <FaPlaneDeparture className="pm-icon" /> Chegada Aeroporto
                        </button>
                        <button className="pm-btn-aeroporto-destino" title="Notificar: Chegada no destino final" onClick={() => notificarCliente(reserva, 'aeroporto_destino')}>
                          <FaMapMarkerAlt className="pm-icon" /> Chegada Destino
                        </button>
                        <button className="pm-btn-whatsapp" title="Enviar mensagem via WhatsApp" onClick={() => window.open(`https://wa.me/${reserva.clienteTelefone || reserva.telefone || reserva.whatsapp || ''}`)} disabled={!reserva.clienteTelefone && !reserva.telefone && !reserva.whatsapp}>
                          <FaPhoneAlt className="pm-icon" /> WhatsApp
                        </button>
                        
                        {/* Botão de Notificar Recebimento da Reserva */}
                        {reserva.status === 'pendente' && (
                          <button 
                            className="pm-btn-received" 
                            title="Notificar que a reserva foi recebida por nossos motoristas" 
                            onClick={() => notificarRecebimento(reserva)}
                          >
                            <FaCheckCircle className="pm-icon" /> Reserva Recebida
                          </button>
                        )}
                      </div>

                      {/* Botões de Status - Apenas para reservas não finalizadas */}
                      {reserva.status !== 'aprovada' && reserva.status !== 'rejeitada' && !isReservaArquivada(reserva) && (
                        <div className="pm-status-btns">
                          {reserva.status === 'pendente' && (
                            <button 
                              className="pm-btn-status pm-btn-confirmar" 
                              onClick={() => atualizarStatusReserva(reserva.id, 'confirmada')}
                              title="Confirmar reserva"
                            >
                              <FaCheck className="pm-icon" /> Confirmar
                            </button>
                          )}

                          {(reserva.status === 'confirmada' || reserva.status === 'delegada') && (
                            <button 
                              className="pm-btn-status pm-btn-confirmado" 
                              onClick={() => atualizarStatusReserva(reserva.id, 'confirmada')}
                              title="Reserva já confirmada"
                              disabled
                              style={{ backgroundColor: '#28a745', color: 'white', cursor: 'not-allowed' }}
                            >
                              <FaCheckCircle className="pm-icon" /> Confirmado
                            </button>
                          )}
                          
                          {(reserva.status === 'confirmada' || reserva.status === 'delegada') && (
                            <button 
                              className="pm-btn-status pm-btn-concluir" 
                              onClick={() => atualizarStatusReserva(reserva.id, 'concluida')}
                              title="Marcar como concluída (aguardará aprovação do dono da agência)"
                            >
                              <FaCheckCircle className="pm-icon" /> Concluir
                            </button>
                          )}
                          
                          {reserva.status !== 'concluida' && !reserva.aguardandoAprovacao && (
                            <button 
                              className="pm-btn-status pm-btn-cancelar" 
                              onClick={() => atualizarStatusReserva(reserva.id, 'cancelada')}
                              title="Cancelar reserva"
                            >
                              <FaTimes className="pm-icon" /> Cancelar
                            </button>
                          )}

                          {(reserva.status === 'concluida' || reserva.aguardandoAprovacao) && (
                            <div className="pm-status-info">
                              <span className="pm-aguardando-aprovacao">
                                <FaCheckCircle className="pm-icon" /> Aguardando aprovação do dono da agência
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Seção de Reservas Finalizadas */}
            {reservasFinalizadasOrdenadas.length > 0 && (
              <>
                <h3 className="pm-motorista-title pm-finished-title">
                  <FaCheckCircle className="pm-icon" /> Reservas Finalizadas - Histórico
                </h3>
                <div className="pm-motorista-reservas-list pm-finished-section">
                  {reservasFinalizadasOrdenadas.map((reserva) => (
                    <div key={reserva.id} className="pm-motorista-reserva-card pm-finished-card">
                      <div className="pm-card-header">
                        <span className="pm-status-badge pm-status-aprovada">
                          {reserva.status === 'aprovada' ? 'Aprovada & Paga' : 'Finalizada'}
                        </span>
                        <span className="pm-reserva-id">#{reserva.id}</span>
                      </div>
                      <div className="pm-card-body">
                        <div className="pm-info-grid">
                          <div><strong>Cliente:</strong> {reserva.clienteNome || reserva.nome || 'N/A'}</div>
                          <div><strong>Passageiros:</strong> {
                            reserva.passageirosFormatado || 
                            (reserva.totalPassageiros && reserva.adultos !== undefined && reserva.criancas !== undefined && reserva.infantis !== undefined) 
                              ? `${reserva.totalPassageiros}(${reserva.adultos}-${reserva.criancas}-${reserva.infantis})`
                              : '1(1-0-0)'
                          }</div>
                          <div><strong>Data:</strong> {reserva.dataReserva?.toDate ? reserva.dataReserva.toDate().toLocaleDateString() : reserva.dataReserva || 'N/A'}</div>
                          <div><strong>Origem:</strong> {reserva.enderecoOrigem || reserva.origem || 'N/A'}</div>
                          <div><strong>Destino:</strong> {reserva.enderecoDestino || reserva.destino || reserva.pacoteTitulo || 'N/A'}</div>
                          <div><strong>Valor:</strong> R$ {getValorReserva(reserva).toFixed(2)}</div>
                          {reserva.dataAprovacao && (
                            <div><strong>Aprovada em:</strong> {new Date(reserva.dataAprovacao.toDate ? reserva.dataAprovacao.toDate() : reserva.dataAprovacao).toLocaleDateString()}</div>
                          )}
                          {reserva.status === 'aprovada' && (
                            <div className="pm-payment-info">
                              <FaCheckCircle className="pm-icon" style={{color: '#28a745'}} /> 
                              <strong>Pagamento Liberado!</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {aba === 'ganhos' && (
          <section className="pm-motorista-ganhos">
            <h3 className="pm-motorista-title"><FaMoneyBillWave className="pm-icon" /> Minha Carteira</h3>
            
            {/* Resumo de Ganhos */}
            <div className="pm-wallet-summary">
              <div className="pm-wallet-card pm-approved-earnings">
                <div className="pm-wallet-icon">
                  <FaCheckCircle />
                </div>
                <div className="pm-wallet-info">
                  <span className="pm-wallet-label">Ganhos Aprovados</span>
                  <span className="pm-wallet-value">
                    R$ {reservas
                      .filter(r => r.status === 'aprovada')
                      .reduce((total, r) => total + getValorMotorista(r), 0)
                      .toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              
              <div className="pm-wallet-card pm-pending-earnings">
                <div className="pm-wallet-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="pm-wallet-info">
                  <span className="pm-wallet-label">Aguardando Aprovação</span>
                  <span className="pm-wallet-value">
                    R$ {reservas
                      .filter(r => r.status === 'concluida' || r.aguardandoAprovacao)
                      .reduce((total, r) => total + getValorMotorista(r), 0)
                      .toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pm-motorista-filtros">
              <label>
                <b>Período:</b>
                <input type="month" className="pm-motorista-date" />
              </label>
            </div>
            
            {/* Lista detalhada de ganhos aprovados */}
            <h4 className="pm-section-title">Detalhes dos Ganhos Aprovados</h4>
            <div className="pm-motorista-ganhos-lista">
              {reservas.filter(r => r.status === 'aprovada' && r.valor).length === 0 ? (
                <p className="pm-no-earnings">Nenhum ganho aprovado ainda.</p>
              ) : (
                reservas
                  .filter(r => r.status === 'aprovada')
                  .filter(r => getValorReserva(r) > 0)
                  .map(reserva => (
                    <div key={reserva.id} className="pm-earnings-card">
                      <div className="pm-earnings-header">
                        <span className="pm-earnings-client">{reserva.clienteNome}</span>
                        <span className="pm-earnings-value">R$ {getValorMotorista(reserva).toFixed(2)}</span>
                      </div>
                      <div className="pm-earnings-breakdown" style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                        Total: R$ {getValorReserva(reserva).toFixed(2)} | Sinal: R$ {getInfoSinal(reserva).valorCalculado.toFixed(2)} | Seu valor ({getInfoDivisao(reserva).parteMotorista}): R$ {getValorMotorista(reserva).toFixed(2)}
                      </div>
                      <div className="pm-earnings-details">
                        <small>
                          <strong>Data:</strong> {reserva.dataReserva} • 
                          <strong> Destino:</strong> {reserva.destino} • 
                          {reserva.dataAprovacao && (
                            <span><strong> Aprovado em:</strong> {new Date(reserva.dataAprovacao.toDate ? reserva.dataAprovacao.toDate() : reserva.dataAprovacao).toLocaleDateString()}</span>
                          )}
                        </small>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}
        {aba === 'graficos' && (
          <div className="pm-motorista-graficos">
            <h3 className="pm-motorista-title"><FaChartBar className="pm-icon" /> Gráficos</h3>
            <p style={{color:'#888'}}>Em breve: gráficos de desempenho e corridas.</p>
          </div>
        )}
      </main>
    </div>
  );
};
export default PainelMotorista;
