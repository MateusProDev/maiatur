// Modern Admin Dashboard with Analytics and Quick Edit Links
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import analyticsService from "../../../services/analyticsService";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiImage,
  FiPackage,
  FiInfo,
  FiMail,
  FiClock,
  FiMessageSquare,
  FiSettings,
  FiHome,
  FiTrendingUp,
  FiEye,
  FiUsers,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiArrowUp,
  FiArrowDown
} from "react-icons/fi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Analytics data
  const [totalViews, setTotalViews] = useState(0);
  const [uniquePages, setUniquePages] = useState(0);
  const [topPages, setTopPages] = useState([]);
  const [deviceStats, setDeviceStats] = useState({ mobile: 0, desktop: 0, tablet: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
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
  };

  const goTo = (path) => {
    setSidebarOpen(false);
    setTimeout(() => navigate(path), 100);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Quick edit links
  const quickEditLinks = [
    { icon: FiImage, title: "Banners Hero", description: "Editar carrossel principal", path: "/admin/banners", color: "#667eea" },
    { icon: FiPackage, title: "Pacotes", description: "Gerenciar pacotes de viagem", path: "/admin/pacotes", color: "#f093fb" },
    { icon: FiInfo, title: "Sobre Nós", description: "Editar página sobre", path: "/admin/edit-about", color: "#4facfe" },
    { icon: FiImage, title: "Logo", description: "Alterar logo do site", path: "/admin/edit-header", color: "#43e97b" },
    { icon: FiMessageSquare, title: "Boxes", description: "Editar boxes informativos", path: "/admin/edit-boxes", color: "#fa709a" },
    { icon: FiMail, title: "Rodapé", description: "Editar informações do footer", path: "/admin/edit-footer", color: "#fee140" },
    { icon: FiClock, title: "Horários", description: "Configurar horários", path: "/admin/edit-hours", color: "#30cfd0" },
    { icon: FiSettings, title: "Configurações", description: "Configurações gerais", path: "/admin/settings", color: "#a8edea" }
  ];

  // Get page name from path
  const getPageName = (path) => {
    const pageNames = {
      '/': 'Página Inicial',
      '/pacotes': 'Pacotes',
      '/sobre': 'Sobre Nós',
      '/contato': 'Contato',
      '/admin': 'Admin Dashboard',
      '/admin/banners': 'Admin Banners',
      '/admin/pacotes': 'Admin Pacotes',
      '/admin/edit-about': 'Editar Sobre',
      '/admin/edit-header': 'Editar Logo',
      '/admin/edit-boxes': 'Editar Boxes',
      '/admin/edit-footer': 'Editar Rodapé',
      '/admin/edit-hours': 'Editar Horários'
    };
    return pageNames[path] || path;
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

  return (
    <div className="modern-admin-dashboard">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>
            <FiSettings /> Admin
          </h2>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => goTo("/admin")} className="nav-item active">
            <FiHome /> Dashboard
          </button>
          <button onClick={() => goTo("/admin/banners")} className="nav-item">
            <FiImage /> Banners Hero
          </button>
          <button onClick={() => goTo("/admin/pacotes")} className="nav-item">
            <FiPackage /> Pacotes
          </button>
          <button onClick={() => goTo("/admin/edit-about")} className="nav-item">
            <FiInfo /> Sobre Nós
          </button>
          <button onClick={() => goTo("/admin/edit-header")} className="nav-item">
            <FiImage /> Logo
          </button>
          <button onClick={() => goTo("/admin/edit-boxes")} className="nav-item">
            <FiMessageSquare /> Boxes
          </button>
          <button onClick={() => goTo("/admin/edit-footer")} className="nav-item">
            <FiMail /> Rodapé
          </button>
          <button onClick={() => goTo("/admin/edit-hours")} className="nav-item">
            <FiClock /> Horários
          </button>
        </nav>

        <button onClick={handleLogout} className="logout-button">
          <FiLogOut /> Sair
        </button>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="mobile-logout">
          <FiLogOut />
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Bem-vindo ao Painel Administrativo</h1>
            <p>Gerencie seu site e visualize métricas de acesso</p>
          </div>
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

        {/* Analytics Overview */}
        <div className="analytics-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <FiEye />
            </div>
            <div className="stat-content">
              <h3>Total de Visualizações</h3>
              <p className="stat-number">{loading ? '...' : totalViews.toLocaleString()}</p>
              <span className="stat-label">Últimos {selectedPeriod} dias</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <h3>Páginas Únicas</h3>
              <p className="stat-number">{loading ? '...' : uniquePages}</p>
              <span className="stat-label">Diferentes rotas acessadas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>Horário de Pico</h3>
              <p className="stat-number">{loading ? '...' : getPeakHour()}</p>
              <span className="stat-label">Maior tráfego</span>
            </div>
          </div>
        </div>

        {/* Quick Edit Links */}
        <div className="section-container">
          <h2 className="section-title">
            <FiSettings /> Acesso Rápido às Edições
          </h2>
          <div className="quick-edit-grid">
            {quickEditLinks.map((link, index) => (
              <div
                key={index}
                className="quick-edit-card"
                onClick={() => goTo(link.path)}
              >
                <div className="quick-edit-icon" style={{ background: link.color }}>
                  <link.icon />
                </div>
                <div className="quick-edit-content">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="section-container">
          <h2 className="section-title">
            <FiSmartphone /> Distribuição por Dispositivo
          </h2>
          <div className="device-stats">
            <div className="device-card">
              <div className="device-icon mobile">
                <FiSmartphone />
              </div>
              <h3>Mobile</h3>
              <p className="device-count">{deviceStats.mobile}</p>
              <div className="device-bar">
                <div
                  className="device-bar-fill mobile"
                  style={{ width: `${getDevicePercentage(deviceStats.mobile)}%` }}
                ></div>
              </div>
              <span className="device-percentage">{getDevicePercentage(deviceStats.mobile)}%</span>
            </div>

            <div className="device-card">
              <div className="device-icon desktop">
                <FiMonitor />
              </div>
              <h3>Desktop</h3>
              <p className="device-count">{deviceStats.desktop}</p>
              <div className="device-bar">
                <div
                  className="device-bar-fill desktop"
                  style={{ width: `${getDevicePercentage(deviceStats.desktop)}%` }}
                ></div>
              </div>
              <span className="device-percentage">{getDevicePercentage(deviceStats.desktop)}%</span>
            </div>

            <div className="device-card">
              <div className="device-icon tablet">
                <FiTablet />
              </div>
              <h3>Tablet</h3>
              <p className="device-count">{deviceStats.tablet}</p>
              <div className="device-bar">
                <div
                  className="device-bar-fill tablet"
                  style={{ width: `${getDevicePercentage(deviceStats.tablet)}%` }}
                ></div>
              </div>
              <span className="device-percentage">{getDevicePercentage(deviceStats.tablet)}%</span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="section-container">
          <h2 className="section-title">
            <FiTrendingUp /> Páginas Mais Visitadas
          </h2>
          <div className="top-pages-list">
            {loading ? (
              <p className="loading-text">Carregando dados...</p>
            ) : topPages.length === 0 ? (
              <p className="no-data-text">Nenhum dado disponível ainda. O tracking começará automaticamente.</p>
            ) : (
              topPages.map((page, index) => (
                <div key={index} className="top-page-item">
                  <div className="page-rank">{index + 1}</div>
                  <div className="page-info">
                    <h4>{getPageName(page.page)}</h4>
                    <p>{page.page}</p>
                  </div>
                  <div className="page-count">
                    {page.count} {index === 0 && <FiArrowUp className="trending-icon up" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
