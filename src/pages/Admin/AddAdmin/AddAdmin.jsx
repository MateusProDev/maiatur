import React, { useState } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import './AddAdmin.css';

const AddAdmin = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Verificar se já existe
      const q = query(collection(db, 'authorizedUsers'), where('email', '==', email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setMessage('❌ Este email já está autorizado como admin');
        setLoading(false);
        return;
      }

      // Adicionar novo admin
      await addDoc(collection(db, 'authorizedUsers'), {
        email: email,
        authorized: true,
        createdAt: serverTimestamp()
      });

      setMessage(`✅ Admin adicionado: ${email}`);
      setEmail('');
    } catch (error) {
      console.error('Erro:', error);
      setMessage('❌ Erro ao adicionar admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-admin-page">
      <div className="add-admin-container">
        <h1>Adicionar Novo Admin</h1>
        <p>Adicione um email para dar acesso ao painel administrativo</p>

        {message && <div className="add-admin-message">{message}</div>}

        <form onSubmit={addAdmin} className="add-admin-form">
          <input
            type="email"
            placeholder="Email do admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar Admin'}
          </button>
        </form>

        <div className="add-admin-info">
          <h3>Próximos passos:</h3>
          <ol>
            <li>Após adicionar, o usuário pode acessar /admin/login</li>
            <li>Deve clicar em "Esqueci minha senha" para criar a senha</li>
            <li>Após criar a senha, pode fazer login normalmente</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
