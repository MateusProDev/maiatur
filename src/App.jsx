import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { auth } from "./firebase/firebaseConfig";
import { Box, CircularProgress, Typography } from "@mui/material";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import HomeUltraModern from "./pages/Home/HomeUltraModern";
import AboutPage from "./pages/AboutPage/AboutPage";
import PacotesListPage from "./pages/PacotesListPage/PacotesListPage";
import PacoteDetailPage from "./pages/PacoteDetailPage/PacoteDetailPage";
import AvaliacoesPage from "./pages/AvaliacoesPage/AvaliacoesPage";
import Destinos from "./pages/Destinos/Destinos";
import Contato from "./pages/Contato/Contato";
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import AdminPacotes from "./components/AdminPacotes/AdminPacotes";
import AdminEditPacote from "./components/Admin/AdminEditPacote/AdminEditPacote";
import ViewUsers from "./components/Admin/Users/ViewUsers";
import EditHeader from "./components/Admin/EditHeader/EditHeader";
import EditBanner from "./components/Admin/EditBanner/EditBanner";
import EditBoxes from "./components/Admin/EditBoxes/EditBoxes";
import EditAbout from "./components/Admin/EditAbout/EditAbout";
import EditFooter from "./components/Admin/EditFooter/EditFooter";
import AdminWhatsAppConfig from "./components/Admin/AdminWhatsAppConfig/AdminWhatsAppConfig";
import EditCarousel from "./components/Admin/EditCarousel/EditCarousel";
import EditHours from "./components/Admin/EditHours/EditHours";
import BannerAdmin from "./components/Admin/BannerAdmin/BannerAdmin";
import LoadingOverlay from "./components/LoadingOverlay/LoadingOverlay";
import { autoInitialize } from "./utils/firestoreUtils";

// Contexto para controle global do loading
export const LoadingContext = React.createContext();

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
    <LoadingContext.Provider value={{ setLoading }}>
      <AuthProvider>
        <Router>
          {(loading || initialLoad) && (
            <LoadingOverlay>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                  Carregando...
                </Typography>
              </Box>
            </LoadingOverlay>
          )}
          <ErrorBoundary>
            <Routes>
              {/* As rotas de motorista e usuário foram removidas conforme solicitado */}
              
              {/* Rotas Públicas */}
              <Route path="/" element={<HomeUltraModern />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pacotes" element={<PacotesListPage />} />
              <Route path="/avaliacoes" element={<AvaliacoesPage />} />
              <Route path="/destinos" element={<Destinos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/pacote/:pacoteSlug" element={<PacoteDetailPage />} />

              {/* Rotas Administrativas */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" />} />
              <Route path="/admin/pacotes" element={<ProtectedRoute><AdminPacotes /></ProtectedRoute>} />
              <Route path="/admin/pacotes/editar/:pacoteId" element={<ProtectedRoute><AdminEditPacote /></ProtectedRoute>} />
              <Route path="/admin/edit-header" element={<ProtectedRoute><EditHeader /></ProtectedRoute>} />
              <Route path="/admin/edit-banner" element={<ProtectedRoute><EditBanner /></ProtectedRoute>} />
              <Route path="/admin/edit-boxes" element={<ProtectedRoute><EditBoxes /></ProtectedRoute>} />
              <Route path="/admin/edit-about" element={<ProtectedRoute><EditAbout /></ProtectedRoute>} />
              <Route path="/admin/edit-footer" element={<ProtectedRoute><EditFooter /></ProtectedRoute>} />
              <Route path="/admin/edit-whatsapp" element={<ProtectedRoute><AdminWhatsAppConfig /></ProtectedRoute>} />
              <Route path="/admin/edit-carousel" element={<ProtectedRoute><EditCarousel /></ProtectedRoute>} />
              <Route path="/admin/edit-hours" element={<ProtectedRoute><EditHours /></ProtectedRoute>} />
              <Route path="/admin/banner-admin" element={<ProtectedRoute><BannerAdmin /></ProtectedRoute>} />
              <Route path="/admin/view-users" element={<ProtectedRoute><ViewUsers /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </LoadingContext.Provider>
  );
};

export default App;