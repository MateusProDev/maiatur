// Modern Admin Dashboard with Analytics and Quick Edit Links
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import analyticsService from "../../../services/analyticsService";
import useCountUp from "../../../hooks/useCountUp";
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
  FiUsers,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiClock,
  FiActivity,
  FiZap,
  FiHelpCircle,
  FiChevronRight
} from "react-icons/fi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  
  // Analytics data
  const [totalViews, setTotalViews] = useState(0);
  const [uniquePages, setUniquePages] = useState(0);
  const [topPages, setTopPages] = useState([]);
  const [deviceStats, setDeviceStats] = useState({ mobile: 0, desktop: 0, tablet: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  // Animated counters
  const animatedViews = useCountUp(totalViews, 2000, 100);
  const animatedPages = useCountUp(uniquePages, 2000, 200);
  const animatedMobile = useCountUp(deviceStats.mobile, 2000, 300);
  const animatedDesktop = useCountUp(deviceStats.desktop, 2000, 400);
  const animatedTablet = useCountUp(deviceStats.tablet, 2000, 500);

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

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [views, pages, pageViews, devices, hourly] = await Promise.all([
        analyticsService.getTotalViews(selectedPeriod),
        analyticsService.getUniquePages(selectedPeriod),
        analyticsService.getPageViewsByRoute(selectedPeriod),
        analyticsService.getDeviceDistribution(selectedPeriod),
        analyticsService.getHourlyDistribution(selectedPeriod)
      ]);

      setTotalViews(views);
      setUniquePages(pages);
      setTopPages(pageViews.slice(0, 10));
      setDeviceStats(devices);
      setHourlyData(hourly);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

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
    { icon: FiImage, title: "Banners Hero", description: "Editar carrossel principal", path: "/admin/banners", gradient: "from-gray-600 to-gray-700" },
    { icon: FiPackage, title: "Pacotes", description: "Gerenciar pacotes de viagem", path: "/admin/pacotes", gradient: "from-zinc-600 to-zinc-700" },
    { icon: FiSettings, title: "Reservas", description: "Gerenciar reservas online", path: "/admin/reservas", gradient: "from-neutral-600 to-neutral-700" },
    { icon: FiMessageSquare, title: "Blog", description: "Gerenciar posts do blog", path: "/admin/blog", gradient: "from-stone-600 to-stone-700" },
    { icon: FiInfo, title: "Sobre Nós", description: "Editar página sobre", path: "/admin/edit-about", gradient: "from-slate-500 to-slate-600" },
    { icon: FiImage, title: "Logo", description: "Alterar logo do site", path: "/admin/edit-header", gradient: "from-gray-500 to-gray-600" },
    { icon: FiMail, title: "Rodapé", description: "Editar informações do footer", path: "/admin/edit-footer", gradient: "from-zinc-500 to-zinc-600" }
  ];

  // Get page name from path
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

  // Filter only public site routes
  const isPublicRoute = (path) => {
    return !path.startsWith('/admin');
  };

  // Calculate percentage
  const getDevicePercentage = (count) => {
    const total = deviceStats.mobile + deviceStats.desktop + deviceStats.tablet;
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  // Get peak hour
  const getPeakHour = () => {
    if (hourlyData.length === 0) return 'N/A';
    const peak = hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyData[0]);
    return peak.hour;
  };

  // Filter public pages only
  const publicPages = topPages.filter(page => isPublicRoute(page.page));

  return (
    <div className="ultra-modern-dashboard">
      {/* Floating Header */}
      <header className="dashboard-floating-header">
        <div className="header-left">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="header-logo" />
          ) : (
            <div className="header-logo-text">
              <FiZap />
              <span>Admin Panel</span>
            </div>
          )}
        </div>
        
        <div className="header-center">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Bem-vindo ao painel administrativo</p>
        </div>

        <div className="header-right">
          <button className="header-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* Period Selector */}
          <div className="period-selector-wrapper">
            <div className="period-selector">
              <button 
                className={selectedPeriod === 7 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(7)}
              >
                7 dias
              </button>
              <button 
                className={selectedPeriod === 30 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(30)}
              >
                30 dias
              </button>
              <button 
                className={selectedPeriod === 90 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(90)}
              >
                90 dias
              </button>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="analytics-grid">
            {/* Total Views Card */}
            <div className="analytics-card views-card">
              <div className="card-icon-wrapper">
                <div className="card-icon">
                  <FiEye />
                </div>
                <div className="card-icon-bg"></div>
              </div>
              <div className="card-content">
                <p className="card-label">Total de Visualizações</p>
                <h2 className="card-value">{loading ? '...' : animatedViews.toLocaleString()}</h2>
                <p className="card-sublabel">Últimos {selectedPeriod} dias</p>
              </div>
              <div className="card-decoration"></div>
            </div>

            {/* Unique Pages Card */}
            <div className="analytics-card pages-card">
              <div className="card-icon-wrapper">
                <div className="card-icon">
                  <FiTrendingUp />
                </div>
                <div className="card-icon-bg"></div>
              </div>
              <div className="card-content">
                <p className="card-label">Páginas Únicas</p>
                <h2 className="card-value">{loading ? '...' : animatedPages}</h2>
                <p className="card-sublabel">Diferentes rotas acessadas</p>
              </div>
              <div className="card-decoration"></div>
            </div>

            {/* Peak Hour Card */}
            <div className="analytics-card peak-card">
              <div className="card-icon-wrapper">
                <div className="card-icon">
                  <FiClock />
                </div>
                <div className="card-icon-bg"></div>
              </div>
              <div className="card-content">
                <p className="card-label">Horário de Pico</p>
                <h2 className="card-value">{loading ? '...' : getPeakHour()}</h2>
                <p className="card-sublabel">Maior tráfego do dia</p>
              </div>
              <div className="card-decoration"></div>
            </div>

            {/* Total Activity Card */}
            <div className="analytics-card activity-card">
              <div className="card-icon-wrapper">
                <div className="card-icon">
                  <FiActivity />
                </div>
                <div className="card-icon-bg"></div>
              </div>
              <div className="card-content">
                <p className="card-label">Atividade Total</p>
                <h2 className="card-value">{loading ? '...' : (deviceStats.mobile + deviceStats.desktop + deviceStats.tablet).toLocaleString()}</h2>
                <p className="card-sublabel">Acessos por dispositivo</p>
              </div>
              <div className="card-decoration"></div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="device-distribution-section">
            <h2 className="section-heading">
              <FiSmartphone />
              Distribuição por Dispositivo
            </h2>
            
            <div className="device-grid">
              <div className="device-card-modern mobile">
                <div className="device-header">
                  <FiSmartphone className="device-icon-svg" />
                  <span className="device-name">Mobile</span>
                </div>
                <div className="device-stats-wrapper">
                  <h3 className="device-number">{animatedMobile}</h3>
                  <div className="device-progress">
                    <div className="device-progress-bar" style={{ width: `${getDevicePercentage(deviceStats.mobile)}%` }}></div>
                  </div>
                  <p className="device-percent">{getDevicePercentage(deviceStats.mobile)}%</p>
                </div>
              </div>

              <div className="device-card-modern desktop">
                <div className="device-header">
                  <FiMonitor className="device-icon-svg" />
                  <span className="device-name">Desktop</span>
                </div>
                <div className="device-stats-wrapper">
                  <h3 className="device-number">{animatedDesktop}</h3>
                  <div className="device-progress">
                    <div className="device-progress-bar" style={{ width: `${getDevicePercentage(deviceStats.desktop)}%` }}></div>
                  </div>
                  <p className="device-percent">{getDevicePercentage(deviceStats.desktop)}%</p>
                </div>
              </div>

              <div className="device-card-modern tablet">
                <div className="device-header">
                  <FiTablet className="device-icon-svg" />
                  <span className="device-name">Tablet</span>
                </div>
                <div className="device-stats-wrapper">
                  <h3 className="device-number">{animatedTablet}</h3>
                  <div className="device-progress">
                    <div className="device-progress-bar" style={{ width: `${getDevicePercentage(deviceStats.tablet)}%` }}></div>
                  </div>
                  <p className="device-percent">{getDevicePercentage(deviceStats.tablet)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-heading">
              <FiZap />
              Acesso Rápido
            </h2>
            
            <div className="quick-actions-grid">
              {quickEditLinks.map((link, index) => (
                <button
                  key={index}
                  className={`quick-action-card ${link.gradient}`}
                  onClick={() => goTo(link.path)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="action-icon">
                    <link.icon />
                  </div>
                  <div className="action-content">
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </div>
                  <FiChevronRight className="action-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          {publicPages.length > 0 && (
            <div className="top-pages-section">
              <h2 className="section-heading">
                <FiTrendingUp />
                Páginas Mais Visitadas
              </h2>
              
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
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
