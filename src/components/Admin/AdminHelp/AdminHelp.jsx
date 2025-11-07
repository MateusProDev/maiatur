import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiImage,
  FiPackage,
  FiSettings,
  FiMessageSquare,
  FiInfo,
  FiMail,
  FiTrendingUp,
  FiPlay,
  FiCheckCircle,
  FiBook,
  FiHelpCircle,
  FiUser,
  FiMonitor,
  FiSmartphone,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './AdminHelp.css';

const AdminHelp = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('inicio');
  const [completedSteps, setCompletedSteps] = useState([]);

  const sections = [
    { id: 'inicio', title: 'Início Rápido', icon: FiPlay },
    { id: 'banners', title: 'Gerenciar Banners', icon: FiImage },
    { id: 'pacotes', title: 'Gerenciar Pacotes', icon: FiPackage },
    { id: 'reservas', title: 'Reservas Online', icon: FiSettings },
    { id: 'blog', title: 'Blog e Posts', icon: FiMessageSquare },
    { id: 'analytics', title: 'Estatísticas', icon: FiTrendingUp },
    { id: 'dicas', title: 'Dicas e Truques', icon: FiHelpCircle }
  ];

  const toggleStep = (stepId) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(id => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="help-content">
            <div className="help-hero">
              <FiBook className="help-hero-icon" />
              <h1>Bem-vindo ao Tutorial do Painel Admin</h1>
              <p>Aprenda a gerenciar seu site de forma simples e rápida</p>
            </div>

            <div className="help-section">
              <h2>🚀 Primeiros Passos</h2>
              <div className="help-steps">
                <div className={`help-step ${completedSteps.includes('step1') ? 'completed' : ''}`}>
                  <div className="step-header" onClick={() => toggleStep('step1')}>
                    <div className="step-number">1</div>
                    <h3>Familiarize-se com o Dashboard</h3>
                    {completedSteps.includes('step1') && <FiCheckCircle className="check-icon" />}
                  </div>
                  <div className="step-content">
                    <p>O painel principal mostra:</p>
                    <ul>
                      <li><FiTrendingUp /> <strong>Total de Visualizações:</strong> Quantas pessoas visitaram seu site</li>
                      <li><FiBarChart2 /> <strong>Páginas Únicas:</strong> Quantas páginas diferentes foram acessadas</li>
                      <li><FiClock /> <strong>Horário de Pico:</strong> Quando seu site tem mais visitas</li>
                    </ul>
                  </div>
                </div>

                <div className={`help-step ${completedSteps.includes('step2') ? 'completed' : ''}`}>
                  <div className="step-header" onClick={() => toggleStep('step2')}>
                    <div className="step-number">2</div>
                    <h3>Acesso Rápido às Edições</h3>
                    {completedSteps.includes('step2') && <FiCheckCircle className="check-icon" />}
                  </div>
                  <div className="step-content">
                    <p>Use os cards coloridos para acessar rapidamente:</p>
                    <div className="quick-links-preview">
                      <div className="mini-card" style={{background: 'linear-gradient(135deg, #128C7E, #21A657)'}}>
                        <FiImage /> Banners
                      </div>
                      <div className="mini-card" style={{background: 'linear-gradient(135deg, #EE7C35, #F8C144)'}}>
                        <FiPackage /> Pacotes
                      </div>
                      <div className="mini-card" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                        <FiSettings /> Reservas
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`help-step ${completedSteps.includes('step3') ? 'completed' : ''}`}>
                  <div className="step-header" onClick={() => toggleStep('step3')}>
                    <div className="step-number">3</div>
                    <h3>Monitore as Estatísticas</h3>
                    {completedSteps.includes('step3') && <FiCheckCircle className="check-icon" />}
                  </div>
                  <div className="step-content">
                    <p>Acompanhe o desempenho do seu site:</p>
                    <ul>
                      <li><FiSmartphone /> Veja quantos visitantes usam celular</li>
                      <li><FiMonitor /> Compare com acessos de computador</li>
                      <li><FiBarChart2 /> Descubra quais páginas são mais populares</li>
                    </ul>
                    <div className="help-tip">
                      <strong>💡 Dica:</strong> Use os botões "7 dias", "30 dias" e "90 dias" para ver diferentes períodos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'banners':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiImage className="help-hero-icon" />
              <h1>Gerenciar Banners</h1>
              <p>Personalize o carrossel principal do seu site</p>
            </div>

            <div className="help-section">
              <h2>📸 Como adicionar um novo banner</h2>
              <div className="help-steps">
                <div className="tutorial-step">
                  <span className="step-badge">Passo 1</span>
                  <p>Clique no card <strong>"Banners Hero"</strong> no dashboard</p>
                </div>
                <div className="tutorial-step">
                  <span className="step-badge">Passo 2</span>
                  <p>Clique no botão <strong>"Adicionar Banner"</strong></p>
                </div>
                <div className="tutorial-step">
                  <span className="step-badge">Passo 3</span>
                  <p>Faça upload de uma imagem (recomendado: 1920x800px)</p>
                </div>
                <div className="tutorial-step">
                  <span className="step-badge">Passo 4</span>
                  <p>Preencha o título, subtítulo e texto do botão</p>
                </div>
                <div className="tutorial-step">
                  <span className="step-badge">Passo 5</span>
                  <p>Ative o banner e salve!</p>
                </div>
              </div>

              <div className="help-warning">
                <strong>⚠️ Importante:</strong> Imagens muito grandes podem deixar o site lento. Use imagens otimizadas!
              </div>

              <div className="help-tip">
                <strong>💡 Dica Pro:</strong> Você pode reordenar os banners arrastando-os para cima ou para baixo
              </div>
            </div>
          </div>
        );

      case 'pacotes':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiPackage className="help-hero-icon" />
              <h1>Gerenciar Pacotes</h1>
              <p>Adicione e edite seus pacotes de viagem</p>
            </div>

            <div className="help-section">
              <h2>🎒 Criando um pacote completo</h2>
              
              <div className="help-grid">
                <div className="help-card">
                  <h3>Informações Básicas</h3>
                  <ul>
                    <li>Nome do pacote (ex: "Beach Park Completo")</li>
                    <li>Descrição detalhada</li>
                    <li>Categoria (Passeio, Transfer, etc)</li>
                    <li>Preço (ou ocultar se for sob consulta)</li>
                  </ul>
                </div>

                <div className="help-card">
                  <h3>Imagens</h3>
                  <ul>
                    <li>Imagem principal (destaque)</li>
                    <li>Galeria com mais fotos</li>
                    <li>Formato recomendado: JPG ou PNG</li>
                    <li>Tamanho ideal: 1200x800px</li>
                  </ul>
                </div>

                <div className="help-card">
                  <h3>Detalhes do Passeio</h3>
                  <ul>
                    <li>Duração (ex: "8 horas")</li>
                    <li>Incluso (alimentação, transporte)</li>
                    <li>O que levar</li>
                    <li>Horários de partida</li>
                  </ul>
                </div>

                <div className="help-card">
                  <h3>Configurações</h3>
                  <ul>
                    <li>✅ Marcar como destaque</li>
                    <li>👁️ Mostrar/ocultar preço</li>
                    <li>🔗 Link do WhatsApp</li>
                    <li>📍 Ponto de encontro</li>
                  </ul>
                </div>
              </div>

              <div className="help-tip">
                <strong>💡 Dica:</strong> Pacotes marcados como "Destaque" aparecem nos carrosséis da home (máximo 5 por categoria)
              </div>
            </div>
          </div>
        );

      case 'reservas':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiSettings className="help-hero-icon" />
              <h1>Sistema de Reservas</h1>
              <p>Gerencie reservas online do seu site</p>
            </div>

            <div className="help-section">
              <h2>📋 Como funcionam as reservas</h2>
              
              <div className="help-flow">
                <div className="flow-step">
                  <div className="flow-icon"><FiUser /></div>
                  <h4>1. Cliente preenche</h4>
                  <p>Nome, data, quantidade de pessoas, destino</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">
                  <div className="flow-icon"><FiMail /></div>
                  <h4>2. Sistema envia</h4>
                  <p>Email para você com todos os dados</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">
                  <div className="flow-icon"><FaWhatsapp /></div>
                  <h4>3. Você confirma</h4>
                  <p>Entre em contato via WhatsApp</p>
                </div>
              </div>

              <div className="help-section">
                <h3>Status das Reservas</h3>
                <div className="status-list">
                  <div className="status-item pending">
                    <span className="status-badge">Pendente</span>
                    <p>Nova reserva aguardando seu contato</p>
                  </div>
                  <div className="status-item confirmed">
                    <span className="status-badge">Confirmada</span>
                    <p>Você já entrou em contato e confirmou</p>
                  </div>
                  <div className="status-item completed">
                    <span className="status-badge">Concluída</span>
                    <p>Serviço já foi realizado</p>
                  </div>
                  <div className="status-item cancelled">
                    <span className="status-badge">Cancelada</span>
                    <p>Cliente cancelou ou não confirmou</p>
                  </div>
                </div>
              </div>

              <div className="help-tip">
                <strong>💡 Dica:</strong> Configure o email de recebimento em "Configurações" → "Email de Reservas"
              </div>
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiMessageSquare className="help-hero-icon" />
              <h1>Blog e Posts</h1>
              <p>Compartilhe dicas e atraia mais visitantes</p>
            </div>

            <div className="help-section">
              <h2>✍️ Criando um post de qualidade</h2>
              
              <div className="help-checklist">
                <div className="checklist-item">
                  <FiCheckCircle />
                  <div>
                    <h4>Título chamativo</h4>
                    <p>Ex: "10 Praias Secretas em Fortaleza que Você Precisa Conhecer"</p>
                  </div>
                </div>
                <div className="checklist-item">
                  <FiCheckCircle />
                  <div>
                    <h4>Imagem de capa atraente</h4>
                    <p>Use fotos de alta qualidade dos destinos</p>
                  </div>
                </div>
                <div className="checklist-item">
                  <FiCheckCircle />
                  <div>
                    <h4>Conteúdo útil e informativo</h4>
                    <p>Dê dicas práticas, horários, preços, como chegar</p>
                  </div>
                </div>
                <div className="checklist-item">
                  <FiCheckCircle />
                  <div>
                    <h4>Call-to-action</h4>
                    <p>Incentive o leitor a fazer uma reserva ao final do post</p>
                  </div>
                </div>
              </div>

              <div className="help-tip">
                <strong>💡 SEO:</strong> Use palavras-chave como "passeios em Fortaleza", "praias do Ceará" no título e conteúdo
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiTrendingUp className="help-hero-icon" />
              <h1>Estatísticas e Analytics</h1>
              <p>Entenda o comportamento dos visitantes</p>
            </div>

            <div className="help-section">
              <h2>📊 Interpretando os dados</h2>
              
              <div className="help-metrics">
                <div className="metric-card">
                  <div className="metric-icon" style={{background: 'linear-gradient(135deg, #64748b, #475569)'}}>
                    <FiTrendingUp />
                  </div>
                  <div>
                    <h4>Total de Visualizações</h4>
                    <p><strong>O que significa:</strong> Número total de páginas vistas</p>
                    <p><strong>Como melhorar:</strong> Poste no Instagram, Facebook e WhatsApp</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
                    <FiBarChart2 />
                  </div>
                  <div>
                    <h4>Páginas Únicas</h4>
                    <p><strong>O que significa:</strong> Quantas páginas diferentes foram acessadas</p>
                    <p><strong>Como melhorar:</strong> Crie mais conteúdo no blog</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{background: 'linear-gradient(135deg, #06b6d4, #0891b2)'}}>
                    <FiClock />
                  </div>
                  <div>
                    <h4>Horário de Pico</h4>
                    <p><strong>O que significa:</strong> Quando as pessoas mais acessam</p>
                    <p><strong>Como usar:</strong> Poste nas redes sociais nesse horário</p>
                  </div>
                </div>
              </div>

              <div className="help-section">
                <h3>📱 Dispositivos</h3>
                <p>Veja se seus visitantes usam mais celular ou computador:</p>
                <ul>
                  <li><FiSmartphone /> <strong>Mobile alto:</strong> Seu site está otimizado para celular ✅</li>
                  <li><FiMonitor /> <strong>Desktop alto:</strong> Talvez precise melhorar a versão mobile</li>
                </ul>
              </div>

              <div className="help-tip">
                <strong>💡 Dica:</strong> Se uma página tem muitas visitas, significa que ela está atraindo pessoas. Coloque CTAs fortes nela!
              </div>
            </div>
          </div>
        );

      case 'dicas':
        return (
          <div className="help-content">
            <div className="help-hero small">
              <FiHelpCircle className="help-hero-icon" />
              <h1>Dicas e Truques</h1>
              <p>Aproveite ao máximo seu painel admin</p>
            </div>

            <div className="help-section">
              <h2>🎯 Melhores Práticas</h2>
              
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">📸</div>
                  <h4>Imagens Otimizadas</h4>
                  <p>Antes de fazer upload, reduza o tamanho das fotos usando ferramentas como TinyPNG ou Compressor.io</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">✍️</div>
                  <h4>Descrições Completas</h4>
                  <p>Quanto mais detalhes você colocar nos pacotes, menos dúvidas os clientes terão</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">⭐</div>
                  <h4>Destaque Estratégico</h4>
                  <p>Marque como destaque apenas seus melhores pacotes (máximo 5 por categoria)</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">💰</div>
                  <h4>Preços Transparentes</h4>
                  <p>Se possível, mostre o preço. Se variar muito, use "Sob Consulta"</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">📱</div>
                  <h4>Teste no Celular</h4>
                  <p>Sempre teste as mudanças no seu celular antes de publicar</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">🔄</div>
                  <h4>Atualize Regularmente</h4>
                  <p>Poste no blog pelo menos 1x por semana para manter o site ativo</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">📊</div>
                  <h4>Acompanhe Estatísticas</h4>
                  <p>Verifique o dashboard toda semana para entender o que funciona</p>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">💬</div>
                  <h4>WhatsApp Sempre Visível</h4>
                  <p>Certifique-se que o número do WhatsApp está correto em Configurações</p>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h2>🆘 Problemas Comuns</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <h4>❓ A imagem não carrega</h4>
                  <p><strong>Solução:</strong> Verifique se o arquivo é JPG ou PNG e tem menos de 5MB</p>
                </div>
                <div className="faq-item">
                  <h4>❓ Não recebo emails de reserva</h4>
                  <p><strong>Solução:</strong> Verifique se o email está configurado corretamente em Configurações</p>
                </div>
                <div className="faq-item">
                  <h4>❓ O pacote não aparece na home</h4>
                  <p><strong>Solução:</strong> Marque como "Destaque" e verifique se está ativo</p>
                </div>
                <div className="faq-item">
                  <h4>❓ As estatísticas estão zeradas</h4>
                  <p><strong>Solução:</strong> É normal se o site acabou de ser criado. Aguarde visitantes!</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-help">
      <div className="help-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
          <FiArrowLeft /> Voltar ao Dashboard
        </button>
        <div className="progress-indicator">
          {completedSteps.length > 0 && (
            <span>✅ {completedSteps.length} passo{completedSteps.length > 1 ? 's' : ''} concluído{completedSteps.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="help-layout">
        <aside className="help-sidebar">
          <div className="sidebar-header">
            <FiBook />
            <h3>Central de Ajuda</h3>
          </div>
          <nav className="help-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="help-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminHelp;
