import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FiImage, FiPlus, FiTrash, FiUpload, FiChevronDown, FiChevronUp, FiSettings } from 'react-icons/fi';
import { CLOUDINARY_CONFIG } from '../../../config/cloudinary';
import './EditImageCarousel.css';

const EditImageCarousel = () => {
  const [settings, setSettings] = useState({
    active: true,
    speed: 50,
    images: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    images: true
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', 'imageCarouselSection');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(prevSettings => ({ ...prevSettings, ...docSnap.data() }));
      } else {
        // Dados iniciais padrão
        const defaultSettings = {
          active: true,
          speed: 50,
          images: [
            {
              id: Date.now(),
              url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
              alt: 'Praia paradisíaca'
            },
            {
              id: Date.now() + 1,
              url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
              alt: 'Pôr do sol na praia'
            },
            {
              id: Date.now() + 2,
              url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=400&fit=crop',
              alt: 'Destino turístico'
            },
            {
              id: Date.now() + 3,
              url: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=400&fit=crop',
              alt: 'Viagem inesquecível'
            },
            {
              id: Date.now() + 4,
              url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
              alt: 'Aventura'
            }
          ]
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
      const docRef = doc(db, 'content', 'imageCarouselSection');
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

  const addImage = () => {
    const newImage = {
      id: Date.now(),
      url: '',
      alt: ''
    };
    setSettings(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const removeImage = (id) => {
    if (window.confirm('Deseja remover esta imagem?')) {
      setSettings(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== id)
      }));
    }
  };

  const updateImage = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      images: prev.images.map(image =>
        image.id === id ? { ...image, [field]: value } : image
      )
    }));
  };

  const moveImage = (index, direction) => {
    const newImages = [...settings.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newImages.length) return;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setSettings(prev => ({ ...prev, images: newImages }));
  };

  const handleImageUpload = async (imageId, file) => {
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
      setUploadingImage(prev => ({ ...prev, [imageId]: true }));
      setMessage('📤 Fazendo upload da imagem...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'carousel');

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
      updateImage(imageId, 'url', data.secure_url);
      setMessage('✅ Imagem enviada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage('❌ Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(prev => ({ ...prev, [imageId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="edit-image-carousel-loading">
        <div className="spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="edit-image-carousel">
      <div className="edit-image-carousel-header">
        <div className="header-content">
          <FiImage className="header-icon" />
          <div>
            <h1>Gerenciar Carrossel de Imagens</h1>
            <p>Configure o carrossel de 3 fileiras exibido na página inicial</p>
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
                <span>Exibir carrossel no site</span>
              </label>
            </div>

            <div className="form-group">
              <label>Velocidade do Carrossel (segundos)</label>
              <input
                type="number"
                value={settings.speed}
                onChange={(e) => setSettings({ ...settings, speed: parseInt(e.target.value) || 50 })}
                min="10"
                max="200"
                step="5"
              />
              <small>Valores menores = mais rápido. Recomendado: 40-60 segundos</small>
            </div>
          </div>
        )}
      </div>

      {/* Gerenciar Imagens */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('images')}>
          <h2>🖼️ Gerenciar Imagens ({settings.images.length})</h2>
          {expandedSections.images ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.images && (
          <div className="section-content">
            <button onClick={addImage} className="add-image-btn">
              <FiPlus /> Adicionar Nova Imagem
            </button>

            <div className="images-list">
              {settings.images.length === 0 ? (
                <div className="empty-state">
                  <FiImage className="empty-icon" />
                  <p>Nenhuma imagem adicionada ainda</p>
                  <small>Clique em "Adicionar Nova Imagem" para começar</small>
                  <small>Recomendado: mínimo 5 imagens para melhor efeito visual</small>
                </div>
              ) : (
                settings.images.map((image, index) => (
                  <div key={image.id} className="image-item">
                    <div className="image-item-header">
                      <span className="image-number">#{index + 1}</span>
                      <div className="image-actions">
                        <button
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                          className="move-btn"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === settings.images.length - 1}
                          className="move-btn"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="remove-btn"
                          title="Remover imagem"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>

                    <div className="image-item-content">
                      <div className="form-group">
                        <label>Texto Alternativo (Alt)</label>
                        <input
                          type="text"
                          value={image.alt}
                          onChange={(e) => updateImage(image.id, 'alt', e.target.value)}
                          placeholder="Ex: Praia paradisíaca"
                        />
                      </div>

                      <div className="form-group">
                        <label>URL da Imagem</label>
                        <div className="image-upload-container">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(image.id, e.target.files[0])}
                            disabled={uploadingImage[image.id]}
                            id={`upload-${image.id}`}
                            style={{ display: 'none' }}
                          />
                          <label 
                            htmlFor={`upload-${image.id}`} 
                            className="upload-btn"
                            style={{ opacity: uploadingImage[image.id] ? 0.6 : 1 }}
                          >
                            <FiUpload />
                            {uploadingImage[image.id] ? 'Enviando...' : 'Upload Cloudinary'}
                          </label>
                          <input
                            type="url"
                            value={image.url}
                            onChange={(e) => updateImage(image.id, 'url', e.target.value)}
                            placeholder="https://..."
                            disabled={uploadingImage[image.id]}
                          />
                        </div>
                      </div>

                      {image.url && (
                        <div className="image-preview">
                          <img src={image.url} alt={image.alt} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
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

export default EditImageCarousel;
