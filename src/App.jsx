import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { auth } from "./firebase/firebaseConfig";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import HomeUltraModern from "./pages/Home/HomeUltraModern";
import AboutPage from "./pages/AboutPage/AboutPage";
import PacotesListPage from "./pages/PacotesListPage/PacotesListPage";
import PacoteDetailPage from "./pages/PacoteDetailPage/PacoteDetailPage";
import CategoriaPage from "./pages/CategoriaPage/CategoriaPage";
import AvaliacoesPage from "./pages/AvaliacoesPage/AvaliacoesPage";
import Destinos from "./pages/Destinos/Destinos";
import Contato from "./pages/Contato/Contato";
import BlogPage from "./pages/BlogPage/BlogPage";
import BlogPostPage from "./pages/BlogPostPage/BlogPostPage";
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import AdminHelp from "./components/Admin/AdminHelp/AdminHelp";
import AdminPacotes from "./components/AdminPacotes/AdminPacotes";
import AdminReservas from "./components/Admin/AdminReservas/AdminReservas";
import AdminBanners from "./components/Admin/AdminBanners/AdminBanners";
import AdminEditPacote from "./components/Admin/AdminEditPacote/AdminEditPacote";
import AdminLinkInBio from "./components/Admin/AdminLinkInBio/AdminLinkInBio";
import AdminGoogleReviews from "./components/Admin/AdminGoogleReviews/AdminGoogleReviews";
import AdminServices from "./components/Admin/AdminServices/AdminServices";
import BlogAdmin from "./components/Admin/BlogAdmin/BlogAdmin";
import ViewUsers from "./components/Admin/Users/ViewUsers";
import AdminUsers from "./components/Admin/AdminUsers/AdminUsers";
import EditHeader from "./components/Admin/EditHeader/EditHeader";
// import EditBanner from "./components/Admin/EditBanner/EditBanner"; // Substituído por AdminBanners
import EditBoxes from "./components/Admin/EditBoxes/EditBoxes";
import EditAbout from "./components/Admin/EditAbout/EditAbout";
import EditFooter from "./components/Admin/EditFooter/EditFooter";
import AdminWhatsAppConfig from "./components/Admin/AdminWhatsAppConfig/AdminWhatsAppConfig";
import EditCarousel from "./components/Admin/EditCarousel/EditCarousel";
import EditHours from "./components/Admin/EditHours/EditHours";
import BannerAdmin from "./components/Admin/BannerAdmin/BannerAdmin";
import LinkInBio from "./components/LinkInBio/LinkInBio";
import GoogleHub from "./pages/GoogleHub/GoogleHub";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import { autoInitialize } from "./utils/firestoreUtils";
import analyticsService from "./services/analyticsService";

// Páginas do Sistema de Reservas
import ReservasPage from "./pages/ReservasPage/ReservasPage";
import PasseioPage from "./pages/PasseioPage/PasseioPage";
import TransferChegadaPage from "./pages/TransferChegadaPage/TransferChegadaPage";
import TransferChegadaSaidaPage from "./pages/TransferChegadaSaidaPage/TransferChegadaSaidaPage";
import TransferSaidaPage from "./pages/TransferSaidaPage/TransferSaidaPage";
import TransferEntreHoteisPage from "./pages/TransferEntreHoteisPage/TransferEntreHoteisPage";
import PoliticaPage from "./pages/PoliticaPage/PoliticaPage";
import InicializadorPage from "./pages/InicializadorPage/InicializadorPage";

// Contexto para controle global do loading
export const LoadingContext = React.createContext();

// Analytics Tracker Component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analyticsService.trackPageView(location.pathname);
  }, [location]);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setLoading: setGlobalLoading } = React.useContext(LoadingContext);

  useEffect(() => {
    setGlobalLoading(true);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      setGlobalLoading(false);
    });
    return () => unsubscribe();
  }, [setGlobalLoading]);

  if (loading) return null;
  return user ? children : <Navigate to="/admin/login" />;
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500);
    
    // Inicializa estruturas do Firestore automaticamente
    autoInitialize();
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <LoadingContext.Provider value={{ setLoading }}>
        <AuthProvider>
          <Router>
            <AnalyticsTracker />
            {(loading || initialLoad) && (
              <LoadingSpinner 
                size="large" 
                text="Carregando experiências incríveis..." 
              fullScreen={true} 
            />
          )}
          <ErrorBoundary>
            <Routes>
              {/* As rotas de motorista e usuário foram removidas conforme solicitado */}
              
              {/* Rotas Públicas */}
              <Route path="/" element={<HomeUltraModern />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/pacotes" element={<PacotesListPage />} />
              <Route path="/categoria/:categoria" element={<CategoriaPage />} />
              <Route path="/avaliacoes" element={<AvaliacoesPage />} />
              <Route path="/destinos" element={<Destinos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/pacote/:pacoteSlug" element={<PacoteDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              {/* Rotas do Sistema de Reservas */}
              <Route path="/reservas" element={<ReservasPage />} />
              <Route path="/reservas/passeio" element={<PasseioPage />} />
              <Route path="/reservas/transfer-chegada" element={<TransferChegadaPage />} />
              <Route path="/reservas/transfer-chegada-e-saida" element={<TransferChegadaSaidaPage />} />
              <Route path="/reservas/transfer-saida" element={<TransferSaidaPage />} />
              <Route path="/reservas/transfer-entre-hoteis" element={<TransferEntreHoteisPage />} />
              <Route path="/politica" element={<PoliticaPage />} />
              <Route path="/inicializar" element={<InicializadorPage />} />

              {/* Rotas Administrativas */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" />} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/ajuda" element={<ProtectedRoute><AdminHelp /></ProtectedRoute>} />
              <Route path="/admin/inicializador" element={<ProtectedRoute><InicializadorPage /></ProtectedRoute>} />
              <Route path="/admin/pacotes" element={<ProtectedRoute><AdminPacotes /></ProtectedRoute>} />
              <Route path="/admin/pacotes/editar/:pacoteId" element={<ProtectedRoute><AdminEditPacote /></ProtectedRoute>} />
              <Route path="/admin/reservas" element={<ProtectedRoute><AdminReservas /></ProtectedRoute>} />
              <Route path="/admin/banners" element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
              <Route path="/admin/link-bio" element={<ProtectedRoute><AdminLinkInBio /></ProtectedRoute>} />
              <Route path="/admin/google-reviews" element={<ProtectedRoute><AdminGoogleReviews /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
              {/* Redirecionar rota antiga do banner para o novo sistema de carrossel */}
              <Route path="/admin/edit-banner" element={<Navigate to="/admin/banners" replace />} />
              <Route path="/admin/edit-header" element={<ProtectedRoute><EditHeader /></ProtectedRoute>} />
              <Route path="/admin/edit-boxes" element={<ProtectedRoute><EditBoxes /></ProtectedRoute>} />
              <Route path="/admin/edit-about" element={<ProtectedRoute><EditAbout /></ProtectedRoute>} />
              <Route path="/admin/edit-footer" element={<ProtectedRoute><EditFooter /></ProtectedRoute>} />
              <Route path="/admin/edit-whatsapp" element={<ProtectedRoute><AdminWhatsAppConfig /></ProtectedRoute>} />
              <Route path="/admin/edit-carousel" element={<ProtectedRoute><EditCarousel /></ProtectedRoute>} />
              <Route path="/admin/edit-hours" element={<ProtectedRoute><EditHours /></ProtectedRoute>} />
              <Route path="/admin/banner-admin" element={<ProtectedRoute><BannerAdmin /></ProtectedRoute>} />
              <Route path="/admin/view-users" element={<ProtectedRoute><ViewUsers /></ProtectedRoute>} />
              
              {/* Páginas Públicas */}
              <Route path="/link-bio" element={<LinkInBio />} />
              <Route path="/google" element={<GoogleHub />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </LoadingContext.Provider>
    </HelmetProvider>
  );
};

export default App;