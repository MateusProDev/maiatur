import React, { useState, useEffect } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaGoogle, FaLock, FaEnvelope, FaUser, FaShieldAlt } from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar resultado do redirect do Google ao carregar a página
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const isAuthorized = await checkAuthorization(result.user.uid, result.user.email);
          
          if (!isAuthorized) {
            await auth.signOut();
            setError("Acesso solicitado! Aguarde a aprovação do administrador para acessar o painel.");
            return;
          }
          
          navigate("/admin/dashboard");
        }
      } catch (err) {
        console.error("Erro no redirect do Google:", err);
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          setError("Login cancelado.");
        } else {
          setError("Erro ao fazer login com Google. Tente novamente.");
        }
      }
    };

    handleRedirectResult();
  }, [navigate]);

  // Verificar se o usuário está autorizado
  const checkAuthorization = async (userId, userEmail) => {
    try {
      const userDoc = await getDoc(doc(db, 'authorizedUsers', userId));
      
      if (userDoc.exists() && userDoc.data().authorized === true) {
        return true;
      }
      
      // Se não existe, criar documento pendente de aprovação
      await setDoc(doc(db, 'authorizedUsers', userId), {
        email: userEmail,
        authorized: false,
        requestedAt: new Date().toISOString(),
        name: auth.currentUser?.displayName || name || 'Usuário',
      });
      
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAuthorized = await checkAuthorization(userCredential.user.uid, userCredential.user.email);
      
      if (!isAuthorized) {
        await auth.signOut();
        setError("Acesso negado. Aguarde a aprovação do administrador.");
        setLoading(false);
        return;
      }
      
      setLoading(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError("Usuário não encontrado. Crie uma conta primeiro.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Senha incorreta.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithRedirect(auth, provider);
      // O resultado será tratado no useEffect
    } catch (err) {
      setLoading(false);
      console.error("Erro ao iniciar login Google:", err);
      setError("Falha ao iniciar login com Google. Tente novamente.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar documento de autorização pendente
      await setDoc(doc(db, 'authorizedUsers', userCredential.user.uid), {
        email: userCredential.user.email,
        authorized: false,
        requestedAt: new Date().toISOString(),
        name: name || 'Usuário',
      });
      
      await auth.signOut();
      setSuccess("Conta criada! Aguarde a aprovação do administrador para acessar.");
      setRegisterMode(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setError("E-mail já cadastrado. Faça login.");
      } else if (err.code === 'auth/weak-password') {
        setError("Senha muito fraca. Use no mínimo 6 caracteres.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("E-mail de redefinição enviado!");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Erro ao enviar e-mail de redefinição. Verifique o e-mail digitado.");
    }
  };

  return (
    <div className="admin-login-unique-wrapper">
      <div className="admin-login-unique-panel">
        <div className="admin-login-header">
          <FaShieldAlt className="admin-login-shield-icon" />
          <h2 className="admin-login-unique-title">
            {resetMode ? 'Redefinir Senha' : registerMode ? 'Criar Conta' : 'Painel Administrativo'}
          </h2>
          <p className="admin-login-subtitle">
            {resetMode ? 'Digite seu e-mail para redefinir' : registerMode ? 'Solicite acesso ao painel' : 'Acesso restrito - Autorização necessária'}
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
                placeholder="E-mail para redefinir"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar redefinição"}
            </button>
            <button type="button" className="admin-login-unique-link-btn" onClick={() => setResetMode(false)}>
              ← Voltar para login
            </button>
          </form>
        ) : registerMode ? (
          <form className="admin-login-unique-form" onSubmit={handleRegister}>
            <div className="admin-login-unique-input-icon-group">
              <FaUser className="admin-login-unique-input-icon" />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Senha (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>
              {loading ? "Criando..." : "Solicitar Acesso"}
            </button>
            <button type="button" className="admin-login-unique-link-btn" onClick={() => setRegisterMode(false)}>
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
            
            <div className="admin-login-divider">
              <span>ou</span>
            </div>
            
            <button type="button" className="admin-login-unique-google-btn" onClick={handleGoogleLogin} disabled={loading}>
              <FaGoogle className="admin-login-unique-google-icon" /> Entrar com Google
            </button>
            
            <div className="admin-login-links">
              <button type="button" className="admin-login-unique-link-btn" onClick={() => setResetMode(true)}>
                Esqueci minha senha
              </button>
              <button type="button" className="admin-login-unique-link-btn" onClick={() => setRegisterMode(true)}>
                Criar nova conta
              </button>
            </div>
          </form>
        )}
        
        <div className="admin-login-info">
          <p><FaShieldAlt /> Acesso autorizado apenas para administradores</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
