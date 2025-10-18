
import React, { useState, useContext, useEffect } from 'react';
import './AuthUsuario.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const AuthUsuario = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  // Redireciona para painel se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/usuario/painel', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.senha);
      } else {
        if (!form.nome.trim()) throw new Error('Nome é obrigatório.');
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.senha);
        await updateProfile(userCredential.user, { displayName: form.nome });
      }
      if (onAuthSuccess) onAuthSuccess();
      else navigate('/usuario/painel');
    } catch (err) {
      setError(err.message || (isLogin ? 'Email ou senha inválidos.' : 'Erro ao cadastrar. Verifique os dados.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (onAuthSuccess) onAuthSuccess();
      else navigate('/usuario/painel');
    } catch (err) {
      setError('Erro ao autenticar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError('');
    setForm({ nome: '', email: '', senha: '' });
  };

  if (authLoading) {
    return (
      <div className="auth-usuario-bg">
        <div className="auth-usuario-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-usuario-bg">
      <div className="auth-usuario-container">
        <form onSubmit={handleAuth} className="auth-usuario-form">
          <h2>{isLogin ? 'Login do Usuário' : 'Cadastro de Usuário'}</h2>
          {!isLogin && (
            <div className="input-group">
              <FiUser className="input-icon" />
              <input name="nome" type="text" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
            </div>
          )}
          <div className="input-group">
            <FiMail className="input-icon" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
          <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
            <FaGoogle className="google-icon" /> Entrar com Google
          </button>
          <div className="auth-toggle-link">
            <span>{isLogin ? 'Não tem cadastro?' : 'Já tem uma conta?'}</span>
            <button type="button" onClick={toggleMode} className="auth-link-btn">
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthUsuario;
