import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FiSettings, FiSave } from 'react-icons/fi';
import './AdminPacotesPage.css';

const AdminPacotesPage = () => {
  const [settings, setSettings] = useState({
    heroTitle: 'Descubra seu Próximo Destino',
    heroSubtitle: 'Pacotes exclusivos com os melhores preços e experiências inesquecíveis',
    searchPlaceholder: 'Buscar destino, cidade, país...'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', 'pacotesPage');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(prevSettings => ({ ...prevSettings, ...docSnap.data() }));
      } else {
        // Criar documento inicial com valores padrão
        await setDoc(docRef, settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'content', 'pacotesPage');
      await setDoc(docRef, settings);
      setMessage('✅ Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('❌ Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-pacotes-page-loading">
        <div className="spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="admin-pacotes-page">
      <div className="admin-pacotes-page-header">
        <div className="header-content">
          <FiSettings className="header-icon" />
          <div>
            <h1>Gerenciar Página de Pacotes</h1>
            <p>Configure os textos da página de listagem de pacotes</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="save-btn"
        >
          {saving ? 'Salvando...' : <><FiSave /> Salvar Alterações</>}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="section">
        <h2>⚙️ Configurações da Seção Hero</h2>
        
        <div className="form-group">
          <label>Título Principal</label>
          <input
            type="text"
            value={settings.heroTitle}
            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
            placeholder="Ex: Descubra seu Próximo Destino"
          />
          <small>Título grande no topo da página</small>
        </div>

        <div className="form-group">
          <label>Subtítulo</label>
          <textarea
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
            placeholder="Ex: Pacotes exclusivos com os melhores preços e experiências inesquecíveis"
            rows={3}
          />
          <small>Texto de descrição abaixo do título</small>
        </div>

        <div className="form-group">
          <label>Placeholder da Busca</label>
          <input
            type="text"
            value={settings.searchPlaceholder}
            onChange={(e) => setSettings({ ...settings, searchPlaceholder: e.target.value })}
            placeholder="Ex: Buscar destino, cidade, país..."
          />
          <small>Texto que aparece no campo de busca</small>
        </div>
      </div>

      <div className="footer-actions">
        <button onClick={handleSave} disabled={saving} className="save-btn-large">
          {saving ? 'Salvando...' : '💾 Salvar Todas as Alterações'}
        </button>
      </div>
    </div>
  );
};

export default AdminPacotesPage;