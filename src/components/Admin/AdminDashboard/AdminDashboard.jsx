// Modern Admin Dashboard with Analytics and Quick Edit Links
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  FiLogOut,
  FiImage,
  FiPackage,
  FiInfo,
  FiMail,
  FiMessageSquare,
  FiSettings,
  FiTrendingUp,
  FiEye,
  FiZap,
  FiHelpCircle,
  FiChevronRight,
  
  FiRefreshCw,
  FiShield,
  FiLink,
  FiMousePointer,
  FiTarget,
  FiX
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import "./AdminDashboard.css";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');
  
  // SEO data
  const [seoData, setSeoData] = useState(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  
  // Modal state
  const [modalInfo, setModalInfo] = useState(null);
  
  // Google OAuth client
  const googleClientRef = useRef(null);

  // Load logo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const headerDoc = await getDoc(doc(db, 'settings', 'header'));
        if (headerDoc.exists() && headerDoc.data().logoUrl) {
          setLogoUrl(headerDoc.data().logoUrl);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    };
    loadLogo();
  }, []);

  // Load Google Identity Services
  // Move checkExistingToken and exchangeCodeForToken above GIS useEffect to avoid use-before-define lint warnings
  const clearGoogleTokens = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_timestamp');
    localStorage.removeItem('google_token_expires_at');
    localStorage.removeItem('google_keep_signed_until');
  };

  // Stable fetch function for SEO data
  const fetchSEOData = useCallback(async (accessToken) => {
    console.log('🔄 Buscando dados SEO...');
    setSeoLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:transferfortalezatur.com.br')}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || localStorage.getItem('google_access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: startDateStr,
            endDate: endDateStr,
            dimensions: ['query'],
            rowLimit: 10
          }),
        }
      );

      const data = await response.json();
      console.log('📊 Dados SEO recebidos:', data);
      
      if (response.ok) {
        setSeoData(data);
        console.log('✅ Dados SEO carregados com sucesso!');
      } else {
        console.error('❌ Erro na API do Search Console:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados SEO:', error);
    } finally {
      setSeoLoading(false);
    }
  }, []);

  const checkExistingToken = useCallback(async () => {
    const accessToken = localStorage.getItem('google_access_token');
    const refreshToken = localStorage.getItem('google_refresh_token');
    const expiresAt = parseInt(localStorage.getItem('google_token_expires_at') || '0', 10);
    const keepUntil = parseInt(localStorage.getItem('google_keep_signed_until') || '0', 10);

    if (!accessToken && !refreshToken) {
      console.log('❌ Nenhum token encontrado');
      return;
    }

    const now = Date.now();

    // If access token exists and not expired, use it
    if (accessToken && expiresAt && expiresAt > now) {
      console.log('🔒 Access token válido, carregando dados SEO...');
      await fetchSEOData(accessToken);
      return;
    }

    // If we have a refresh token and user opted to stay signed (keepUntil in future), try to refresh
    if (refreshToken && keepUntil > now) {
      console.log('🔄 Access token expirado ou ausente, tentando refresh com refresh_token...');
      try {
        const resp = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });

        const data = await resp.json();
        console.log('📨 Resposta refresh token:', data);

        if (data.access_token) {
          const newExpiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000);
          localStorage.setItem('google_access_token', data.access_token);
          localStorage.setItem('google_token_timestamp', Date.now().toString());
          localStorage.setItem('google_token_expires_at', newExpiresAt.toString());
          console.log('✅ Token renovado com sucesso, carregando dados SEO...');
          await fetchSEOData(data.access_token);
          return;
        }
      } catch (err) {
        console.error('❌ Falha ao renovar token:', err);
      }
    }

    // Otherwise remove tokens
    console.log('❌ Tokens inválidos ou expiração ultrapassada, removendo...');
    clearGoogleTokens();
  }, [fetchSEOData]);

  const exchangeCodeForToken = useCallback(async (code) => {
    console.log('🔄 Trocando código por token...');
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: window.location.origin,
        }),
      });

      const data = await response.json();
      console.log('📨 Resposta do token:', data);
      
      if (data.access_token) {
        localStorage.setItem('google_access_token', data.access_token);
        localStorage.setItem('google_token_timestamp', Date.now().toString());
        const expiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000);
        localStorage.setItem('google_token_expires_at', expiresAt.toString());

        // If refresh_token present, store it and set keep-signed-until to 1 year
        if (data.refresh_token) {
          localStorage.setItem('google_refresh_token', data.refresh_token);
          const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
          localStorage.setItem('google_keep_signed_until', oneYear.toString());
        }

        console.log('✅ Token salvo com timestamp e expiração, carregando dados SEO...');
        await fetchSEOData(data.access_token);
      } else {
        console.error('❌ Erro na resposta do token:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao trocar código por token:', error);
    }
  }, [fetchSEOData]);

  useEffect(() => {
    const loadGIS = () => {
      console.log('🔄 Carregando Google Identity Services...');
      if (window.google && window.google.accounts && !googleClientRef.current) {
        console.log('✅ Google Identity Services disponível, inicializando...');
        googleClientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/webmasters.readonly',
          ux_mode: 'popup',
          // Request offline access to get a refresh token when possible
          access_type: 'offline',
          prompt: 'consent',
          callback: (response) => {
            console.log('📨 Callback OAuth recebido:', response);
            if (response.code) {
              exchangeCodeForToken(response.code);
            }
          },
        });
        setGapiLoaded(true);
        console.log('✅ Google Identity Services inicializado!');

        // Check if user is already authenticated
        checkExistingToken();
      } else {
        console.log('❌ Google Identity Services não disponível ou já inicializado');
      }
    };

    if (window.google && window.google.accounts) {
      loadGIS();
    } else {
      console.log('🔄 Carregando script GIS...');
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('✅ Script GIS carregado');
        loadGIS();
      };
      script.onerror = () => {
        console.error('❌ Erro ao carregar script GIS');
      };
      document.head.appendChild(script);
    }
  }, [checkExistingToken, exchangeCodeForToken]);

  // Load analytics data - Removed Firebase loading
  useEffect(() => {
    // Removed Firebase analytics loading
  }, []);

  const goTo = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Quick edit links with neutral colors
  const quickEditLinks = [
    { icon: FiHelpCircle, title: "Central de Ajuda", description: "Tutorial e guia de uso", path: "/admin/ajuda", gradient: "from-slate-600 to-slate-700" },
    { icon: FiShield, title: "Usuários", description: "Gerenciar acessos", path: "/admin/users", gradient: "from-blue-600 to-blue-700" },
    { icon: FiImage, title: "Banners Hero", description: "Editar carrossel principal", path: "/admin/banners", gradient: "from-gray-600 to-gray-700" },
    { icon: FiPackage, title: "Pacotes", description: "Gerenciar pacotes de viagem", path: "/admin/pacotes", gradient: "from-zinc-600 to-zinc-700" },
    { icon: FiSettings, title: "Reservas", description: "Gerenciar reservas online", path: "/admin/reservas", gradient: "from-neutral-600 to-neutral-700" },
    { icon: FiMessageSquare, title: "Blog", description: "Gerenciar posts do blog", path: "/admin/blog", gradient: "from-stone-600 to-stone-700" },
    { icon: FiLink, title: "Link in Bio", description: "Configure links para Instagram", path: "/admin/link-bio", gradient: "from-purple-600 to-pink-600" },
    { icon: FaGoogle, title: "Google Reviews", description: "Gerenciar avaliações do Google", path: "/admin/google-reviews", gradient: "from-blue-500 to-blue-600" },
    { icon: FiSettings, title: "Serviços", description: "Gerenciar seção de serviços", path: "/admin/services", gradient: "from-green-500 to-green-600" },
    { icon: FiInfo, title: "Sobre Nós", description: "Editar página sobre", path: "/admin/edit-about", gradient: "from-slate-500 to-slate-600" },
    { icon: FiImage, title: "Logo", description: "Alterar logo do site", path: "/admin/edit-header", gradient: "from-gray-500 to-gray-600" },
    { icon: FiMail, title: "Rodapé", description: "Editar informações do footer", path: "/admin/edit-footer", gradient: "from-zinc-500 to-zinc-600" }
  ];

  

  // Handle Google sign in for SEO
  const handleGoogleSignIn = async () => {
    console.log('🔄 Iniciando login Google...');
    if (!googleClientRef.current) {
      console.error('❌ Cliente Google não inicializado');
      return;
    }

    try {
      console.log('📤 Solicitando código de autorização (offline access)...');
      // requestCode will open the consent popup; GIS should honor access_type: 'offline'
      googleClientRef.current.requestCode();
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
    }
  };

  

  // Refresh SEO data
  const refreshSEOData = async () => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      await fetchSEOData(token);
    }
  };

  // (fetchSEOData is defined above as a stable useCallback)

  // Chart data configurations - Removed Firebase charts

  // Filter public pages only - Removed Firebase filtering

  // Handle modal
  const openModal = (metricType) => {
    const metricInfo = {
      clicks: {
        title: 'Cliques Totais',
        description: 'Número total de vezes que usuários clicaram nos seus resultados de pesquisa do Google. Cada clique representa um usuário interessado que visitou seu site.',
        importance: 'Quanto mais cliques, melhor o engajamento dos usuários com seu conteúdo.',
        tips: 'Otimize títulos e meta descriptions para aumentar a taxa de cliques.'
      },
      impressions: {
        title: 'Impressões Totais',
        description: 'Número total de vezes que suas páginas apareceram nos resultados de pesquisa do Google. Cada impressão representa uma oportunidade de clique.',
        importance: 'Quanto mais impressões, maior a visibilidade do seu site nos resultados de busca.',
        tips: 'Trabalhe SEO on-page e off-page para melhorar o posicionamento e aumentar impressões.'
      },
      ctr: {
        title: 'CTR Médio (Click-Through Rate)',
        description: 'Porcentagem de usuários que clicaram em seus resultados após vê-los. Calculado como: Cliques ÷ Impressões × 100.',
        importance: 'Mede a atratividade dos seus títulos e descrições nos resultados de pesquisa.',
        tips: 'Crie títulos atraentes e meta descriptions que incentivem cliques.'
      },
      position: {
        title: 'Posição Média',
        description: 'Posição média dos seus resultados nos resultados de pesquisa do Google. Números menores indicam melhores posições (ex: 1.0 = primeira posição).',
        importance: 'Quanto menor o número, melhor o posicionamento orgânico do seu site.',
        tips: 'Otimize conteúdo, melhore velocidade do site e construa backlinks de qualidade.'
      }
    };
    setModalInfo(metricInfo[metricType]);
  };

  const closeModal = () => {
    setModalInfo(null);
  };

  // Disconnect Google account
  const disconnectGoogle = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    setSeoData(null);
    console.log('✅ Desconectado do Google Search Console');
  };

  return (
    <div className="modern-admin-dashboard-simple">
      {/* Header Bar */}
      <header className="dashboard-header-bar">
        <div className="header-content">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="dashboard-logo" />
          ) : (
            <div className="dashboard-logo-placeholder">
              <span>Admin Panel</span>
            </div>
          )}
          
          <div className="header-text">
            <h1>
              <FiZap />
              Dashboard
            </h1>
            <p>Bem-vindo ao painel administrativo</p>
          </div>
        </div>

        <div className="header-actions">
          {seoData && (
            <button className="google-disconnect-btn" onClick={disconnectGoogle} title="Desconectar Google Search Console">
              <FaGoogle />
              <span>Desconectar</span>
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main-content">
        <div className="dashboard-container">
          
          {/* SEO Metrics Section */}
          <div className="section-header">
            <h2 className="section-title">
              <FaGoogle />
              Métricas SEO - Google Search Console
            </h2>
            {seoData && (
              <button 
                className="refresh-btn"
                onClick={refreshSEOData}
                disabled={seoLoading}
                title="Atualizar métricas"
              >
                <FiRefreshCw />
                {seoLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
            )}
            {!seoData && (
              <button 
                className="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={!gapiLoaded}
              >
                <FaGoogle />
                Conectar Google
              </button>
            )}
          </div>

          {seoLoading ? (
            <div className="seo-loading">
              <div className="loading-spinner"></div>
              <p>Carregando dados do Google Search Console...</p>
            </div>
          ) : seoData ? ( <>
            <div className="seo-metrics-grid">
              <div className="seo-stat-card">
                <div className="seo-stat-icon">
                  <FiMousePointer />
                </div>
                <div className="seo-stat-info">
                  <div className="seo-stat-header">
                    <p className="seo-stat-label">Cliques Totais</p>
                    <button className="info-btn" onClick={() => openModal('clicks')}>
                      <FiInfo />
                    </button>
                  </div>
                  <h3 className="seo-stat-number">
                    {seoData.rows?.reduce((sum, row) => sum + row.clicks, 0)?.toLocaleString() || 0}
                  </h3>
                  <p className="seo-stat-change">Últimos 30 dias</p>
                </div>
              </div>

              <div className="seo-stat-card">
                <div className="seo-stat-icon">
                  <FiEye />
                </div>
                <div className="seo-stat-info">
                  <div className="seo-stat-header">
                    <p className="seo-stat-label">Impressões Totais</p>
                    <button className="info-btn" onClick={() => openModal('impressions')}>
                      <FiInfo />
                    </button>
                  </div>
                  <h3 className="seo-stat-number">
                    {seoData.rows?.reduce((sum, row) => sum + row.impressions, 0)?.toLocaleString() || 0}
                  </h3>
                  <p className="seo-stat-change">Vezes que apareceu</p>
                </div>
              </div>

              <div className="seo-stat-card">
                <div className="seo-stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="seo-stat-info">
                  <div className="seo-stat-header">
                    <p className="seo-stat-label">CTR Médio</p>
                    <button className="info-btn" onClick={() => openModal('ctr')}>
                      <FiInfo />
                    </button>
                  </div>
                  <h3 className="seo-stat-number">
                    {seoData.rows?.length > 0 
                      ? ((seoData.rows.reduce((sum, row) => sum + row.ctr, 0) / seoData.rows.length) * 100).toFixed(2) + '%'
                      : '0%'
                    }
                  </h3>
                  <p className="seo-stat-change">Taxa de cliques</p>
                </div>
              </div>

              <div className="seo-stat-card">
                <div className="seo-stat-icon">
                  <FiTarget />
                </div>
                <div className="seo-stat-info">
                  <div className="seo-stat-header">
                    <p className="seo-stat-label">Posição Média</p>
                    <button className="info-btn" onClick={() => openModal('position')}>
                      <FiInfo />
                    </button>
                  </div>
                  <h3 className="seo-stat-number">
                    {seoData.rows?.length > 0 
                      ? (seoData.rows.reduce((sum, row) => sum + row.position, 0) / seoData.rows.length).toFixed(1)
                      : '0'
                    }
                  </h3>
                  <p className="seo-stat-change">Ranking no Google</p>
                </div>
              </div>
            </div>

            {/* Top Queries Section */}
            {seoData.rows && seoData.rows.length > 0 && (
              <div className="top-queries-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <FiTrendingUp />
                    Principais Consultas (Palavras-chave)
                  </h2>
                </div>
                
                <div className="top-queries-list">
                  {seoData.rows.map((row, index) => (
                    <div key={index} className="query-item" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="query-rank">#{index + 1}</div>
                      <div className="query-content">
                        <h4 className="query-text">{row.keys[0]}</h4>
                        <div className="query-metrics">
                          <span className="query-clicks">
                            <FiMousePointer />
                            {row.clicks} cliques
                          </span>
                          <span className="query-impressions">
                            <FiEye />
                            {row.impressions} impressões
                          </span>
                          <span className="query-ctr">
                            {row.ctr ? (row.ctr * 100).toFixed(1) + '%' : '0%'} CTR
                          </span>
                          <span className="query-position">
                            <FiTarget />
                            Posição {row.position?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>) : (
            <div className="seo-connect-prompt">
              <FaGoogle className="google-icon-large" />
              <h3>Conecte sua conta Google</h3>
              <p>Para visualizar métricas reais do Google Search Console como cliques, impressões e posições de ranking.</p>
              <button 
                className="google-signin-btn primary"
                onClick={handleGoogleSignIn}
                disabled={!gapiLoaded}
              >
                <FaGoogle />
                Conectar Google Search Console
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="section-header">
            <h2 className="section-title">
              <FiZap />
              Acesso Rápido
            </h2>
          </div>
          
          <div className="quick-edit-grid">
            {quickEditLinks.map((link, index) => (
              <button
                key={index}
                className="quick-edit-card"
                onClick={() => goTo(link.path)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="quick-edit-icon">
                  <link.icon />
                </div>
                <div className="quick-edit-content">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                </div>
                <FiChevronRight className="quick-edit-arrow" />
              </button>
            ))}
          </div>

        </div>
      </main>

      {/* Modal */}
      {modalInfo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalInfo.title}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>📊 O que significa</h4>
                <p>{modalInfo.description}</p>
              </div>
              <div className="modal-section">
                <h4>🎯 Importância</h4>
                <p>{modalInfo.importance}</p>
              </div>
              <div className="modal-section">
                <h4>💡 Dicas para melhorar</h4>
                <p>{modalInfo.tips}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
