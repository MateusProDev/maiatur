// Modern Admin Dashboard with Analytics and Quick Edit Links
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiClock,
  FiActivity,
  FiZap,
  FiHelpCircle,
  FiChevronRight,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw,
  FiShield,
  FiLink,
  FiMousePointer,
  FiTarget
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

  // Load logo
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
  useEffect(() => {
    const loadGIS = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/webmasters.readonly',
          ux_mode: 'popup',
          callback: (response) => {
            if (response.code) {
              exchangeCodeForToken(response.code);
            }
          },
        });
        setGapiLoaded(true);

        // Check if user is already authenticated
        const token = localStorage.getItem('google_access_token');
        if (token) {
          fetchSEOData(token);
        }
      }
    };

    if (window.google && window.google.accounts) {
      loadGIS();
    } else {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = loadGIS;
      document.head.appendChild(script);
    }
  }, []);

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

  // Get page name from path - Removed Firebase functions
  const getPageName = (path) => {
    const pageNames = {
      '/': 'Página Inicial',
      '/pacotes': 'Pacotes',
      '/sobre': 'Sobre Nós',
      '/contato': 'Contato',
      '/avaliacoes': 'Avaliações',
      '/destinos': 'Destinos'
    };
    return pageNames[path] || path;
  };

  // Filter only public site routes - Removed
  const isPublicRoute = (path) => {
    return !path.startsWith('/admin');
  };

  // Get peak hour
  const getPeakHour = () => {
    return 'N/A';
  };

  // Handle Google sign in for SEO
  const handleGoogleSignIn = async () => {
    if (!gapiLoaded) return;

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        ux_mode: 'popup',
        callback: (response) => {
          if (response.code) {
            exchangeCodeForToken(response.code);
          }
        },
      });
      client.requestCode();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code) => {
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
      if (data.access_token) {
        localStorage.setItem('google_access_token', data.access_token);
        await fetchSEOData(data.access_token);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  // Fetch SEO data from Search Console
  const fetchSEOData = async (accessToken) => {
    setSeoLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:transferfortalezatur.com.br')}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || localStorage.getItem('google_access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: '30daysAgo',
            endDate: 'today',
            dimensions: ['query'],
            rowLimit: 10
          }),
        }
      );

      const data = await response.json();
      setSeoData(data);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setSeoLoading(false);
    }
  };

  // Chart data configurations - Removed Firebase charts

  // Filter public pages only - Removed Firebase filtering

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
          ) : seoData ? (
            <div className="seo-metrics-grid">
              <div className="seo-stat-card">
                <div className="seo-stat-icon">
                  <FiMousePointer />
                </div>
                <div className="seo-stat-info">
                  <p className="seo-stat-label">Cliques Totais</p>
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
                  <p className="seo-stat-label">Impressões Totais</p>
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
                  <p className="seo-stat-label">CTR Médio</p>
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
                  <p className="seo-stat-label">Posição Média</p>
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
          ) : (
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

          {/* Top Pages */}
          {publicPages.length > 0 && (
            <>
              <div className="section-header">
                <h2 className="section-title">
                  <FiTrendingUp />
                  Páginas Mais Visitadas
                </h2>
              </div>
              
              <div className="top-pages-list">
                {publicPages.map((page, index) => (
                  <div key={index} className="top-page-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="page-rank">#{index + 1}</div>
                    <div className="page-info">
                      <h4>{getPageName(page.page)}</h4>
                      <p>{page.page}</p>
                    </div>
                    <div className="page-views">
                      <span className="views-number">{page.count}</span>
                      <span className="views-label">visualizações</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
