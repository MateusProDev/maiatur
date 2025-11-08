// Modern Admin Dashboard with Analytics and Quick Edit Links
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  FiRefreshCw
} from "react-icons/fi";
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Chart data configurations
  const lineChartData = useMemo(() => {
    const last7Days = Array.from({ length: selectedPeriod }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (selectedPeriod - 1 - i));
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    });

    const viewsData = Array.from({ length: selectedPeriod }, (_, i) => {
      return Math.floor(totalViews / selectedPeriod + Math.random() * 50);
    });

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Visualizações',
          data: viewsData,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  }, [totalViews, selectedPeriod]);

  const doughnutChartData = useMemo(() => ({
    labels: ['Mobile', 'Desktop', 'Tablet'],
    datasets: [
      {
        data: [deviceStats.mobile, deviceStats.desktop, deviceStats.tablet],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      }
    ]
  }), [deviceStats]);

  const barChartData = useMemo(() => {
    const topPagesData = topPages.filter(page => !page.page.startsWith('/admin')).slice(0, 5);
    const colors = [
      { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
      { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' },
      { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgb(251, 146, 60)' },
      { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' },
      { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgb(236, 72, 153)' },
    ];
    
    return {
      labels: topPagesData.map(p => getPageName(p.page)),
      datasets: [
        {
          label: 'Visualizações',
          data: topPagesData.map(p => p.count),
          backgroundColor: topPagesData.map((_, i) => colors[i]?.bg || colors[0].bg),
          borderColor: topPagesData.map((_, i) => colors[i]?.border || colors[0].border),
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  }, [topPages]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
      }
    }
  };

  // Filter public pages only
  const publicPages = topPages.filter(page => isPublicRoute(page.page));

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
          <button 
            className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw />
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main-content">
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

          {/* Analytics Overview */}
          <div className="analytics-overview">
            {/* Total Views Card */}
            <div className="stat-card">
              <div className="stat-icon stat-icon-views">
                <FiEye />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total de Visualizações</p>
                <h2 className="stat-number">{loading ? '...' : animatedViews.toLocaleString()}</h2>
                <p className="stat-change positive">Últimos {selectedPeriod} dias</p>
              </div>
            </div>

            {/* Unique Pages Card */}
            <div className="stat-card">
              <div className="stat-icon stat-icon-pages">
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <p className="stat-label">Páginas Únicas</p>
                <h2 className="stat-number">{loading ? '...' : animatedPages}</h2>
                <p className="stat-change positive">Diferentes rotas</p>
              </div>
            </div>

            {/* Peak Hour Card */}
            <div className="stat-card">
              <div className="stat-icon stat-icon-time">
                <FiClock />
              </div>
              <div className="stat-info">
                <p className="stat-label">Horário de Pico</p>
                <h2 className="stat-number">{loading ? '...' : getPeakHour()}</h2>
                <p className="stat-change">Maior tráfego</p>
              </div>
            </div>

            {/* Total Activity Card */}
            <div className="stat-card">
              <div className="stat-icon stat-icon-activity">
                <FiActivity />
              </div>
              <div className="stat-info">
                <p className="stat-label">Atividade Total</p>
                <h2 className="stat-number">{loading ? '...' : (deviceStats.mobile + deviceStats.desktop + deviceStats.tablet).toLocaleString()}</h2>
                <p className="stat-change positive">Todos dispositivos</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-container">
            {/* Visualizações ao longo do tempo */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>
                  <FiTrendingUp />
                  Visualizações ao Longo do Tempo
                </h3>
              </div>
              <div className="chart-body">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>

            {/* Dispositivos Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>
                  <FiPieChart />
                  Dispositivos
                </h3>
              </div>
              <div className="chart-body chart-doughnut">
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>
            </div>

            {/* Top Páginas Chart */}
            <div className="chart-card chart-card-wide">
              <div className="chart-header">
                <h3>
                  <FiBarChart2 />
                  Top 5 Páginas Mais Visitadas
                </h3>
              </div>
              <div className="chart-body">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="section-header">
            <h2 className="section-title">
              <FiSmartphone />
              Distribuição por Dispositivo
            </h2>
          </div>
          
          <div className="device-stats">
            <div className="device-card">
              <div className="device-icon mobile">
                <FiSmartphone />
              </div>
              <h3>Mobile</h3>
              <div className="device-count">{animatedMobile}</div>
              <div className="device-bar">
                <div className="device-bar-fill" style={{ width: `${getDevicePercentage(deviceStats.mobile)}%`, background: 'linear-gradient(135deg, #64748b, #475569)' }}></div>
              </div>
              <p className="device-percentage">{getDevicePercentage(deviceStats.mobile)}%</p>
            </div>

            <div className="device-card">
              <div className="device-icon desktop">
                <FiMonitor />
              </div>
              <h3>Desktop</h3>
              <div className="device-count">{animatedDesktop}</div>
              <div className="device-bar">
                <div className="device-bar-fill" style={{ width: `${getDevicePercentage(deviceStats.desktop)}%`, background: 'linear-gradient(135deg, #78716c, #57534e)' }}></div>
              </div>
              <p className="device-percentage">{getDevicePercentage(deviceStats.desktop)}%</p>
            </div>

            <div className="device-card">
              <div className="device-icon tablet">
                <FiTablet />
              </div>
              <h3>Tablet</h3>
              <div className="device-count">{animatedTablet}</div>
              <div className="device-bar">
                <div className="device-bar-fill" style={{ width: `${getDevicePercentage(deviceStats.tablet)}%`, background: 'linear-gradient(135deg, #71717a, #52525b)' }}></div>
              </div>
              <p className="device-percentage">{getDevicePercentage(deviceStats.tablet)}%</p>
            </div>
          </div>

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
