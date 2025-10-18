import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarMotorista } from '../../utils/reservaApi'; // Ajuste o caminho se necessário
import { auth } from '../../firebase/firebaseConfig'; // Para login
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

import icons from '../MotoristaCadastro/icons';

import './AuthMotorista.css';

const AuthMotorista = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', telefone: '', modelo: '', cor: '', placa: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.email || !form.senha) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      navigate('/painel-motorista');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else {
        setError('Email ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.nome || !form.email || !form.senha || !form.telefone || !form.modelo || !form.cor || !form.placa) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }
    if (form.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }
    try {
      // Cria o usuário no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      // Salva os dados do motorista no Firestore usando o UID
      await cadastrarMotorista(form, cred.user.uid);
      // Faz login automaticamente
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      navigate('/painel-motorista');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email já cadastrado.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setError('Erro ao cadastrar. Verifique os dados ou tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm({
        nome: '', email: '', senha: '', telefone: '', modelo: '', cor: '', placa: ''
    });
  };

  return (
    <div className="auth-motorista-bg">
      <div className="auth-motorista-container">
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-motorista-form">
          <h2>{isLogin ? 'Login do Motorista' : 'Cadastro de Motorista'}</h2>
          
          {!isLogin && (
            <>
              <div className="input-group"><icons.UserIcon className="input-icon" /><input name="nome" type="text" placeholder="Nome completo" value={form.nome} onChange={handleChange} required /></div>
              <div className="input-group"><icons.PhoneIphoneIcon className="input-icon" /><input name="telefone" type="tel" placeholder="Telefone (WhatsApp)" value={form.telefone} onChange={handleChange} required /></div>
            </>
          )}
          
          <div className="input-group"><icons.EmailIcon className="input-icon" /><input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /></div>
          <div className="input-group"><icons.LockIcon className="input-icon" /><input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required /></div>

          {!isLogin && (
            <>
              <div className="input-group"><icons.DirectionsCarIcon className="input-icon" /><input name="modelo" type="text" placeholder="Modelo do carro" value={form.modelo} onChange={handleChange} required /></div>
              <div className="input-group"><icons.ColorLensIcon className="input-icon" /><input name="cor" type="text" placeholder="Cor do carro" value={form.cor} onChange={handleChange} required /></div>
              <div className="input-group"><icons.DriveEtaIcon className="input-icon" /><input name="placa" type="text" placeholder="Placa do carro" value={form.placa} onChange={handleChange} required /></div>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
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

export default AuthMotorista;
