import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FaCheck, FaTimes, FaTrash, FaUser, FaEnvelope, FaClock, FaShieldAlt } from 'react-icons/fa';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, authorized

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'authorizedUsers'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setLoading(false);
    }
  };

  const handleAuthorize = async (userId) => {
    try {
      await updateDoc(doc(db, 'authorizedUsers', userId), {
        authorized: true,
        authorizedAt: new Date().toISOString()
      });
      await loadUsers();
    } catch (error) {
      console.error('Erro ao autorizar usuário:', error);
      alert('Erro ao autorizar usuário');
    }
  };

  const handleRevoke = async (userId) => {
    if (!window.confirm('Tem certeza que deseja revogar o acesso?')) return;
    
    try {
      await updateDoc(doc(db, 'authorizedUsers', userId), {
        authorized: false,
        revokedAt: new Date().toISOString()
      });
      await loadUsers();
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      alert('Erro ao revogar acesso');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await deleteDoc(doc(db, 'authorizedUsers', userId));
      await loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.authorized;
    if (filter === 'authorized') return user.authorized;
    return true;
  });

  const pendingCount = users.filter(u => !u.authorized).length;
  const authorizedCount = users.filter(u => u.authorized).length;

  if (loading) {
    return (
      <div className="admin-users-container">
        <div className="loading-spinner">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1><FaShieldAlt /> Gerenciar Usuários Autorizados</h1>
        <p>Aprove ou revogue acesso ao painel administrativo</p>
      </div>

      <div className="admin-users-stats">
        <div className="user-stat">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="user-stat pending">
          <span className="stat-number">{pendingCount}</span>
          <span className="stat-label">Pendentes</span>
        </div>
        <div className="user-stat authorized">
          <span className="stat-number">{authorizedCount}</span>
          <span className="stat-label">Autorizados</span>
        </div>
      </div>

      <div className="admin-users-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Todos ({users.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pendentes ({pendingCount})
        </button>
        <button 
          className={filter === 'authorized' ? 'active' : ''} 
          onClick={() => setFilter('authorized')}
        >
          Autorizados ({authorizedCount})
        </button>
      </div>

      <div className="admin-users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <FaUser />
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className={`user-card ${user.authorized ? 'authorized' : 'pending'}`}>
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-info">
                <h3>{user.name || 'Usuário'}</h3>
                <p className="user-email"><FaEnvelope /> {user.email}</p>
                <p className="user-date">
                  <FaClock /> 
                  Solicitado em: {new Date(user.requestedAt).toLocaleDateString('pt-BR')}
                </p>
                {user.authorized && user.authorizedAt && (
                  <p className="user-authorized-date">
                    Autorizado em: {new Date(user.authorizedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="user-status">
                {user.authorized ? (
                  <span className="status-badge authorized">
                    <FaCheck /> Autorizado
                  </span>
                ) : (
                  <span className="status-badge pending">
                    <FaClock /> Pendente
                  </span>
                )}
              </div>
              <div className="user-actions">
                {!user.authorized ? (
                  <button 
                    className="btn-authorize" 
                    onClick={() => handleAuthorize(user.id)}
                    title="Autorizar acesso"
                  >
                    <FaCheck /> Autorizar
                  </button>
                ) : (
                  <button 
                    className="btn-revoke" 
                    onClick={() => handleRevoke(user.id)}
                    title="Revogar acesso"
                  >
                    <FaTimes /> Revogar
                  </button>
                )}
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(user.id)}
                  title="Excluir usuário"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
