import React, { useState } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import { FaGoogle, FaLock, FaEnvelope } from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLoading(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Falha ao entrar com Google.");
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
        <h2 className="admin-login-unique-title">Painel Administrativo</h2>
        {error && <p className="admin-login-unique-error">{error}</p>}
        {success && <p className="admin-login-unique-success">{success}</p>}
        {!resetMode ? (
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
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
            <button type="button" className="admin-login-unique-google-btn" onClick={handleGoogleLogin} disabled={loading}>
              <FaGoogle className="admin-login-unique-google-icon" /> Entrar com Google
            </button>
            <button type="button" className="admin-login-unique-reset-link" onClick={() => setResetMode(true)}>
              Esqueci minha senha
            </button>
          </form>
        ) : (
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
            <button type="submit" className="admin-login-unique-btn" disabled={loading}>{loading ? "Enviando..." : "Enviar redefinição"}</button>
            <button type="button" className="admin-login-unique-reset-link" onClick={() => setResetMode(false)}>
              Voltar para login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
