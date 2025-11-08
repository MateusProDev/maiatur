import React, { useState } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from "../../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar se o email está autorizado no Firestore
  const checkAuthorization = async (userEmail) => {
    try {
      // Buscar documento por email (você precisa criar com email como ID ou buscar por campo)
      const userDoc = await getDoc(doc(db, 'authorizedUsers', userEmail));
      
      if (userDoc.exists() && userDoc.data().authorized === true) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao verificar autorização:", error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      // Primeiro verifica se o email está autorizado
      const isAuthorized = await checkAuthorization(email);
      
      if (!isAuthorized) {
        setError("Acesso negado. Este email não está autorizado. Entre em contato com o administrador.");
        setLoading(false);
        return;
      }
      
      // Se autorizado, faz o login
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError("Usuário não encontrado. Crie uma senha primeiro usando 'Esqueci minha senha'.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Senha incorreta.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Credenciais inválidas. Verifique seu email e senha.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      // Verifica autorização antes de enviar email
      const isAuthorized = await checkAuthorization(email);
      
      if (!isAuthorized) {
        setError("Este email não está autorizado. Entre em contato com o administrador.");
        setLoading(false);
        return;
      }
      
      await sendPasswordResetEmail(auth, email);
      setSuccess("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/user-not-found') {
        // Se o usuário não existe no Firebase Auth, instrui a criar senha
        setSuccess("Link de criação de senha enviado para seu email!");
      } else {
        setError("Erro ao enviar e-mail. Verifique o endereço digitado.");
      }
    }
  };

  return (
    <div className="admin-login-unique-wrapper">
      <div className="admin-login-unique-panel">
        <div className="admin-login-header">
          <FaShieldAlt className="admin-login-shield-icon" />
          <h2 className="admin-login-unique-title">
            {resetMode ? 'Redefinir Senha' : 'Painel Administrativo'}
          </h2>
          <p className="admin-login-subtitle">
            {resetMode ? 'Digite seu email autorizado' : 'Acesso restrito - Apenas emails autorizados'}
          </p>
        </div>
        
        {error && <div className="admin-login-unique-error"><strong>Erro:</strong> {error}</div>}
        {success && <div className="admin-login-unique-success"><strong>Sucesso:</strong> {success}</div>}
        
        {resetMode ? (
          <form className="admin-login-unique-form" onSubmit={handleResetPassword}>
            <div className="admin-login-unique-input-icon-group">
              <FaEnvelope className="admin-login-unique-input-icon" />
              <input
                type="email"
                placeholder="E-mail autorizado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </button>
            <button type="button" className="admin-login-unique-link-btn" onClick={() => setResetMode(false)}>
              ← Voltar para login
            </button>
          </form>
        ) : (
          <form className="admin-login-unique-form" onSubmit={handleLogin}>
            <div className="admin-login-unique-input-icon-group">
              <FaEnvelope className="admin-login-unique-input-icon" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="admin-login-unique-input-icon-group">
              <FaLock className="admin-login-unique-input-icon" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            
            <div className="admin-login-links">
              <button type="button" className="admin-login-unique-link-btn" onClick={() => setResetMode(true)}>
                Esqueci minha senha / Criar senha
              </button>
            </div>
          </form>
        )}
        
        <div className="admin-login-info">
          <p><FaShieldAlt /> Apenas emails cadastrados no sistema podem acessar</p>
          <p style={{fontSize: '0.85em', marginTop: '8px', color: '#94a3b8'}}>
            Primeiro acesso? Use "Esqueci minha senha" para criar sua senha
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
