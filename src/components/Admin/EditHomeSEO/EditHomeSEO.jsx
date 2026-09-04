import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FiArrowLeft, FiSave, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { seoData } from '../../../utils/seoData';
import './EditHomeSEO.css';

const defaultSettings = {
  title: seoData.home.title,
  description: seoData.home.description,
  keywords: ''
};

const EditHomeSEO = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'content', 'homeSeo'));
        if (snapshot.exists()) {
          setSettings({ ...defaultSettings, ...snapshot.data() });
        }
      } catch (error) {
        console.error('Erro ao carregar SEO da home:', error);
        setMessage('Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await setDoc(doc(db, 'content', 'homeSeo'), settings);
      setMessage('Configurações salvas com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar SEO da home:', error);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-home-seo-loading">Carregando configurações...</div>;
  }

  return (
    <main className="edit-home-seo">
      <header className="edit-home-seo-header">
        <button type="button" className="edit-home-seo-back" onClick={() => navigate('/admin')}>
          <FiArrowLeft /> Voltar ao painel
        </button>
        <div>
          <div className="edit-home-seo-title-row">
            <FiSearch />
            <h1>SEO da página inicial</h1>
          </div>
          <p>Edite os metadados exibidos nos resultados de busca da home.</p>
        </div>
      </header>

      <form className="edit-home-seo-form" onSubmit={handleSave}>
        <label>
          Meta title
          <input
            type="text"
            value={settings.title}
            onChange={(event) => handleChange('title', event.target.value)}
            maxLength={60}
            required
          />
        </label>

        <label>
          Meta description
          <textarea
            value={settings.description}
            onChange={(event) => handleChange('description', event.target.value)}
            maxLength={160}
            rows={5}
            required
          />
        </label>

        <label>
          Meta keywords
          <input
            type="text"
            value={settings.keywords}
            onChange={(event) => handleChange('keywords', event.target.value)}
            placeholder="fortaleza, transfer, passeios, turismo"
          />
          <small>Separe cada palavra-chave por vírgula.</small>
        </label>

        <div className="edit-home-seo-actions">
          {message && <span className="edit-home-seo-message">{message}</span>}
          <button type="submit" className="edit-home-seo-save" disabled={saving}>
            <FiSave /> {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditHomeSEO;