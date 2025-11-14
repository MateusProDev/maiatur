import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { auth } from "./firebase/firebaseConfig";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import { autoInitialize } from "./utils/firestoreUtils";
import analyticsService from "./services/analyticsService";

// Lazy load components for code splitting
const HomeUltraModern = lazy(() => import("./pages/Home/HomeUltraModern"));
const AboutPage = lazy(() => import("./pages/AboutPage/AboutPage"));
const PacotesListPage = lazy(() => import("./pages/PacotesListPage/PacotesListPage"));
const PacoteDetailPage = lazy(() => import("./pages/PacoteDetailPage/PacoteDetailPage"));
const CategoriaPage = lazy(() => import("./pages/CategoriaPage/CategoriaPage"));
const AvaliacoesPage = lazy(() => import("./pages/AvaliacoesPage/AvaliacoesPage"));
const Destinos = lazy(() => import("./pages/Destinos/Destinos"));
const Contato = lazy(() => import("./pages/Contato/Contato"));
const BlogPage = lazy(() => import("./pages/BlogPage/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage/BlogPostPage"));
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard/AdminDashboard"));
const AdminHelp = lazy(() => import("./components/Admin/AdminHelp/AdminHelp"));
const AdminPacotes = lazy(() => import("./components/AdminPacotes/AdminPacotes"));
const AdminReservas = lazy(() => import("./components/Admin/AdminReservas/AdminReservas"));
const AdminBanners = lazy(() => import("./components/Admin/AdminBanners/AdminBanners"));
const AdminEditPacote = lazy(() => import("./components/Admin/AdminEditPacote/AdminEditPacote"));
const AdminLinkInBio = lazy(() => import("./components/Admin/AdminLinkInBio/AdminLinkInBio"));
const AdminGoogleReviews = lazy(() => import("./components/Admin/AdminGoogleReviews/AdminGoogleReviews"));
const AdminServices = lazy(() => import("./components/Admin/AdminServices/AdminServices"));
const BlogAdmin = lazy(() => import("./components/Admin/BlogAdmin/BlogAdmin"));
const ViewUsers = lazy(() => import("./components/Admin/Users/ViewUsers"));
const AdminUsers = lazy(() => import("./components/Admin/AdminUsers/AdminUsers"));
const EditHeader = lazy(() => import("./components/Admin/EditHeader/EditHeader"));
const EditBoxes = lazy(() => import("./components/Admin/EditBoxes/EditBoxes"));
const EditAbout = lazy(() => import("./components/Admin/EditAbout/EditAbout"));
const EditFooter = lazy(() => import("./components/Admin/EditFooter/EditFooter"));
const AdminWhatsAppConfig = lazy(() => import("./components/Admin/AdminWhatsAppConfig/AdminWhatsAppConfig"));
const EditCarousel = lazy(() => import("./components/Admin/EditCarousel/EditCarousel"));
const EditHours = lazy(() => import("./components/Admin/EditHours/EditHours"));
const BannerAdmin = lazy(() => import("./components/Admin/BannerAdmin/BannerAdmin"));
const LinkInBio = lazy(() => import("./components/LinkInBio/LinkInBio"));
const GoogleHub = lazy(() => import("./pages/GoogleHub/GoogleHub"));

// Páginas do Sistema de Reservas
const ReservasPage = lazy(() => import("./pages/ReservasPage/ReservasPage"));
const PasseioPage = lazy(() => import("./pages/PasseioPage/PasseioPage"));
const TransferChegadaPage = lazy(() => import("./pages/TransferChegadaPage/TransferChegadaPage"));
const TransferChegadaSaidaPage = lazy(() => import("./pages/TransferChegadaSaidaPage/TransferChegadaSaidaPage"));
const TransferSaidaPage = lazy(() => import("./pages/TransferSaidaPage/TransferSaidaPage"));
const TransferEntreHoteisPage = lazy(() => import("./pages/TransferEntreHoteisPage/TransferEntreHoteisPage"));
const PoliticaPage = lazy(() => import("./pages/PoliticaPage/PoliticaPage"));
const InicializadorPage = lazy(() => import("./pages/InicializadorPage/InicializadorPage"));

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
            <Suspense fallback={
              <LoadingSpinner 
                size="large" 
                text="Carregando..." 
                fullScreen={true} 
              />
            }>
              <main role="main">
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
              </main>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </LoadingContext.Provider>
    </HelmetProvider>
  );
};

export default App;