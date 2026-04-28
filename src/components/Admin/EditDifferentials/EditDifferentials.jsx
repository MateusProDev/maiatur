import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FiAward, FiPlus, FiTrash, FiUpload, FiChevronDown, FiChevronUp, FiEdit3 } from 'react-icons/fi';
import { CLOUDINARY_CONFIG } from '../../../config/cloudinary';
import './EditDifferentials.css';

const EditDifferentials = () => {
  const [settings, setSettings] = useState({
    active: true,
    badge: 'Diferenciais',
    title: 'Por que escolher a Transfer Fortaleza Tur?',
    description: 'Mais de uma década transformando viagens em experiências memoráveis. Nossa dedicação é garantir que cada momento da sua jornada seja especial.',
    differentials: [],
    collageImages: {
      image1: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop',
      image2: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=500&fit=crop',
      image3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=600&fit=crop'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    differentials: true,
    collage: true
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', 'differentialsSection');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(prevSettings => ({ ...prevSettings, ...docSnap.data() }));
      } else {
        // Dados iniciais padrão
        const defaultSettings = {
          active: true,
          badge: 'Diferenciais',
          title: 'Por que escolher a Transfer Fortaleza Tur?',
          description: 'Mais de uma década transformando viagens em experiências memoráveis. Nossa dedicação é garantir que cada momento da sua jornada seja especial.',
          differentials: [
            {
              id: Date.now(),
              icon: 'shield',
              title: 'Segurança Total',
              description: 'Veículos vistoriados e motoristas experientes',
              image: ''
            },
            {
              id: Date.now() + 1,
              icon: 'smile',
              title: 'Atendimento Personalizado',
              description: 'Equipe dedicada para ajudar no planejamento da sua viagem',
              image: ''
            },
            {
              id: Date.now() + 2,
              icon: 'credit-card',
              title: 'Melhor Custo-Benefício',
              description: 'Preços justos sem taxas ocultas',
              image: ''
            },
            {
              id: Date.now() + 3,
              icon: 'heart',
              title: 'Paixão por Turismo',
              description: 'Cada viagem é única e especial para nós',
              image: ''
            }
          ],
          collageImages: {
            image1: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800&fit=crop',
            image2: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=500&fit=crop',
            image3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=600&fit=crop'
          }
        };
        await setDoc(docRef, defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'content', 'differentialsSection');
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addDifferential = () => {
    const newDifferential = {
      id: Date.now(),
      icon: 'star',
      title: '',
      description: '',
      image: ''
    };
    setSettings(prev => ({
      ...prev,
      differentials: [...prev.differentials, newDifferential]
    }));
  };

  const removeDifferential = (id) => {
    if (window.confirm('Deseja remover este diferencial?')) {
      setSettings(prev => ({
        ...prev,
        differentials: prev.differentials.filter(d => d.id !== id)
      }));
    }
  };

  const updateDifferential = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      differentials: prev.differentials.map(differential =>
        differential.id === id ? { ...differential, [field]: value } : differential
      )
    }));
  };

  const moveDifferential = (index, direction) => {
    const newDifferentials = [...settings.differentials];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newDifferentials.length) return;
    
    [newDifferentials[index], newDifferentials[newIndex]] = [newDifferentials[newIndex], newDifferentials[index]];
    setSettings(prev => ({ ...prev, differentials: newDifferentials }));
  };

  const handleImageUpload = async (differentialId, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ A imagem deve ter no máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Apenas imagens são permitidas');
      return;
    }

    try {
      setUploadingImage(prev => ({ ...prev, [differentialId]: true }));
      setMessage('📤 Fazendo upload da imagem...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'differentials');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      updateDifferential(differentialId, 'image', data.secure_url);
      setMessage('✅ Imagem enviada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage('❌ Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(prev => ({ ...prev, [differentialId]: false }));
    }
  };

  const handleCollageImageUpload = async (imageKey, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ A imagem deve ter no máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Apenas imagens são permitidas');
      return;
    }

    try {
      setUploadingImage(prev => ({ ...prev, [imageKey]: true }));
      setMessage('📤 Fazendo upload da imagem...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'collage');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        collageImages: {
          ...prev.collageImages,
          [imageKey]: data.secure_url
        }
      }));
      setMessage('✅ Imagem enviada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage('❌ Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(prev => ({ ...prev, [imageKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="edit-differentials-loading">
        <div className="spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="edit-differentials">
      <div className="edit-differentials-header">
        <div className="header-content">
          <FiAward className="header-icon" />
          <div>
            <h1>Gerenciar Seção Diferenciais</h1>
            <p>Configure os diferenciais exibidos na página inicial</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="save-btn"
        >
          {saving ? 'Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Configurações Gerais */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('general')}>
          <h2>⚙️ Configurações Gerais</h2>
          {expandedSections.general ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.general && (
          <div className="section-content">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.active}
                  onChange={(e) => setSettings({ ...settings, active: e.target.checked })}
                />
                <span>Exibir seção de diferenciais no site</span>
              </label>
            </div>

            <div className="form-group">
              <label>Badge/Etiqueta</label>
              <input
                type="text"
                value={settings.badge}
                onChange={(e) => setSettings({ ...settings, badge: e.target.value })}
                placeholder="Ex: Diferenciais"
              />
            </div>

            <div className="form-group">
              <label>Título da Seção</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Ex: Por que escolher a Transfer Fortaleza Tur?"
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Descrição da seção..."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gerenciar Diferenciais */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('differentials')}>
          <h2>🎯 Gerenciar Diferenciais ({settings.differentials.length})</h2>
          {expandedSections.differentials ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.differentials && (
          <div className="section-content">
            <button onClick={addDifferential} className="add-differential-btn">
              <FiPlus /> Adicionar Novo Diferencial
            </button>

            <div className="differentials-list">
              {settings.differentials.length === 0 ? (
                <div className="empty-state">
                  <FiEdit3 className="empty-icon" />
                  <p>Nenhum diferencial adicionado ainda</p>
                  <small>Clique em "Adicionar Novo Diferencial" para começar</small>
                </div>
              ) : (
                settings.differentials.map((differential, index) => (
                  <div key={differential.id} className="differential-item">
                    <div className="differential-item-header">
                      <span className="differential-number">#{index + 1}</span>
                      <div className="differential-actions">
                        <button
                          onClick={() => moveDifferential(index, 'up')}
                          disabled={index === 0}
                          className="move-btn"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDifferential(index, 'down')}
                          disabled={index === settings.differentials.length - 1}
                          className="move-btn"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeDifferential(differential.id)}
                          className="remove-btn"
                          title="Remover diferencial"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>

                    <div className="differential-item-content">
                      <div className="form-group">
                        <label>Ícone (nome do ícone react-icons/fi)</label>
                        <input
                          type="text"
                          value={differential.icon}
                          onChange={(e) => updateDifferential(differential.id, 'icon', e.target.value)}
                          placeholder="Ex: shield, smile, heart, star"
                        />
                        <small>Exemplos: shield, smile, heart, star, award, check-circle, etc.</small>
                      </div>

                      <div className="form-group">
                        <label>Título</label>
                        <input
                          type="text"
                          value={differential.title}
                          onChange={(e) => updateDifferential(differential.id, 'title', e.target.value)}
                          placeholder="Ex: Segurança Total"
                        />
                      </div>

                      <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                          value={differential.description}
                          onChange={(e) => updateDifferential(differential.id, 'description', e.target.value)}
                          placeholder="Descreva o diferencial..."
                          rows={2}
                        />
                      </div>

                      <div className="form-group">
                        <label>Imagem (opcional - se preenchida, substitui o ícone)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(differential.id, e.target.files[0])}
                          disabled={uploadingImage[differential.id]}
                          id={`upload-${differential.id}`}
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor={`upload-${differential.id}`} 
                          className="upload-btn"
                          style={{ opacity: uploadingImage[differential.id] ? 0.6 : 1 }}
                        >
                          <FiUpload />
                          {uploadingImage[differential.id] ? 'Enviando...' : 'Upload Cloudinary'}
                        </label>

                        {differential.image && (
                          <div className="image-preview">
                            <img src={differential.image} alt={differential.title} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gerenciar Imagens da Collage */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('collage')}>
          <h2>🖼️ Imagens da Collage (Lado Direito)</h2>
          {expandedSections.collage ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.collage && (
          <div className="section-content">
            <p className="section-description">Edite as 3 imagens exibidas no lado direito da seção de diferenciais (apenas em telas maiores).</p>
            
            <div className="collage-images-grid">
              <div className="collage-image-item">
                <label>Imagem 1 (Grande - Esquerda)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCollageImageUpload('image1', e.target.files[0])}
                  disabled={uploadingImage['image1']}
                  id={`upload-collage-1`}
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor={`upload-collage-1`} 
                  className="upload-btn"
                  style={{ opacity: uploadingImage['image1'] ? 0.6 : 1 }}
                >
                  <FiUpload />
                  {uploadingImage['image1'] ? 'Enviando...' : 'Upload Cloudinary'}
                </label>
                {settings.collageImages?.image1 && (
                  <div className="image-preview">
                    <img src={settings.collageImages.image1} alt="Collage Image 1" />
                  </div>
                )}
              </div>

              <div className="collage-image-item">
                <label>Imagem 2 (Média - Centro)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCollageImageUpload('image2', e.target.files[0])}
                  disabled={uploadingImage['image2']}
                  id={`upload-collage-2`}
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor={`upload-collage-2`} 
                  className="upload-btn"
                  style={{ opacity: uploadingImage['image2'] ? 0.6 : 1 }}
                >
                  <FiUpload />
                  {uploadingImage['image2'] ? 'Enviando...' : 'Upload Cloudinary'}
                </label>
                {settings.collageImages?.image2 && (
                  <div className="image-preview">
                    <img src={settings.collageImages.image2} alt="Collage Image 2" />
                  </div>
                )}
              </div>

              <div className="collage-image-item">
                <label>Imagem 3 (Média - Direita)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCollageImageUpload('image3', e.target.files[0])}
                  disabled={uploadingImage['image3']}
                  id={`upload-collage-3`}
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor={`upload-collage-3`} 
                  className="upload-btn"
                  style={{ opacity: uploadingImage['image3'] ? 0.6 : 1 }}
                >
                  <FiUpload />
                  {uploadingImage['image3'] ? 'Enviando...' : 'Upload Cloudinary'}
                </label>
                {settings.collageImages?.image3 && (
                  <div className="image-preview">
                    <img src={settings.collageImages.image3} alt="Collage Image 3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="footer-actions">
        <button onClick={handleSave} disabled={saving} className="save-btn-large">
          {saving ? 'Salvando...' : '💾 Salvar Todas as Alterações'}
        </button>
      </div>
    </div>
  );
};

export default EditDifferentials;
