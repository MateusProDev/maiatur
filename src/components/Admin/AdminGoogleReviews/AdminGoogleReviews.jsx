import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FaGoogle, FaStar, FaTrash, FaPlus, FaChevronDown, FaChevronUp, FaCloudUploadAlt } from 'react-icons/fa';
import { CLOUDINARY_CONFIG } from '../../../config/cloudinary';
import './AdminGoogleReviews.css';

const AdminGoogleReviews = () => {
  const [settings, setSettings] = useState({
    title: 'O Que Nossos Clientes Dizem',
    subtitle: 'Avaliações reais de viajantes satisfeitos',
    active: true,
    autoplay: true,
    autoplayDelay: 5000,
    googleUrl: '',
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    carousel: true,
    reviews: true
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', 'googleReviews');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(prevSettings => ({ ...prevSettings, ...docSnap.data() }));
      } else {
        // Initialize with default data
        const defaultSettings = {
          title: 'O Que Nossos Clientes Dizem',
          subtitle: 'Avaliações reais de viajantes satisfeitos',
          active: true,
          autoplay: true,
          autoplayDelay: 5000,
          googleUrl: '',
          reviews: []
        };
        await setDoc(docRef, defaultSettings);
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
      const docRef = doc(db, 'content', 'googleReviews');
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

  const addReview = () => {
    const newReview = {
      id: Date.now(),
      name: '',
      photo: 'https://via.placeholder.com/70',
      photoAlt: '',
      rating: 5,
      text: '',
      date: new Date().toLocaleDateString('pt-BR')
    };
    setSettings({
      ...settings,
      reviews: [...settings.reviews, newReview]
    });
  };

  const updateReview = (id, field, value) => {
    setSettings({
      ...settings,
      reviews: settings.reviews.map(review =>
        review.id === id ? { ...review, [field]: value } : review
      )
    });
  };

  const removeReview = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta avaliação?')) {
      setSettings({
        ...settings,
        reviews: settings.reviews.filter(review => review.id !== id)
      });
    }
  };

  const moveReview = (index, direction) => {
    const newReviews = [...settings.reviews];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newReviews.length) {
      [newReviews[index], newReviews[newIndex]] = [newReviews[newIndex], newReviews[index]];
      setSettings({ ...settings, reviews: newReviews });
    }
  };

  const handlePhotoUpload = async (reviewId, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Por favor, selecione apenas arquivos de imagem');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ A imagem deve ter no máximo 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setUploadingPhoto({ ...uploadingPhoto, [reviewId]: true });
      setMessage('📤 Enviando foto para Cloudinary...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'reviews');

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
      
      // Update review with new photo URL
      updateReview(reviewId, 'photo', data.secure_url);
      
      setMessage('✅ Foto enviada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage('❌ Erro ao enviar foto. Tente novamente.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto({ ...uploadingPhoto, [reviewId]: false });
    }
  };

  if (loading) {
    return (
      <div className="admin-google-reviews-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="admin-google-reviews">
      <div className="admin-google-reviews-header">
        <div className="header-content">
          <FaGoogle className="header-icon" />
          <div>
            <h1>Google Reviews</h1>
            <p>Configure o carrossel de avaliações do Google</p>
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

      <div className="admin-google-reviews-info-box">
        <h3>📍 Como Obter as Avaliações do Google?</h3>
        <ol>
          <li><strong>Encontre seu negócio no Google Maps</strong></li>
          <li><strong>Copie as avaliações manualmente</strong> e cole abaixo</li>
          <li><strong>Adicione o link do seu perfil</strong> para "Ver mais avaliações"</li>
          <li><strong>Atualize periodicamente</strong> com novas avaliações</li>
        </ol>
        <p><strong>Dica:</strong> Use fotos reais dos clientes (com permissão) para mais autenticidade.</p>
      </div>

      {/* General Settings */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('general')}>
          <h2>⚙️ Configurações Gerais</h2>
          {expandedSections.general ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        
        {expandedSections.general && (
          <div className="section-content">
            <div className="form-group">
              <label>Título da Seção</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Ex: O Que Nossos Clientes Dizem"
              />
            </div>

            <div className="form-group">
              <label>Subtítulo</label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                placeholder="Ex: Avaliações reais de viajantes satisfeitos"
              />
            </div>

            <div className="form-group">
              <label>Link do Google (Perfil Comercial)</label>
              <input
                type="url"
                value={settings.googleUrl}
                onChange={(e) => setSettings({ ...settings, googleUrl: e.target.value })}
                placeholder="https://g.page/sua-empresa?share"
              />
              <small>Cole o link do seu perfil no Google Meu Negócio</small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.active}
                  onChange={(e) => setSettings({ ...settings, active: e.target.checked })}
                />
                <span>Exibir seção de avaliações no site</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Carousel Settings */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('carousel')}>
          <h2>🎠 Configurações do Carrossel</h2>
          {expandedSections.carousel ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        
        {expandedSections.carousel && (
          <div className="section-content">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoplay}
                  onChange={(e) => setSettings({ ...settings, autoplay: e.target.checked })}
                />
                <span>Ativar rotação automática</span>
              </label>
            </div>

            {settings.autoplay && (
              <div className="form-group">
                <label>Intervalo de Rotação (milissegundos)</label>
                <input
                  type="number"
                  min="2000"
                  max="10000"
                  step="1000"
                  value={settings.autoplayDelay}
                  onChange={(e) => setSettings({ ...settings, autoplayDelay: parseInt(e.target.value) })}
                />
                <small>Recomendado: 5000ms (5 segundos)</small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews Management */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('reviews')}>
          <h2>⭐ Gerenciar Avaliações ({settings.reviews.length})</h2>
          {expandedSections.reviews ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        
        {expandedSections.reviews && (
          <div className="section-content">
            <button onClick={addReview} className="add-review-btn">
              <FaPlus /> Adicionar Nova Avaliação
            </button>

            <div className="reviews-list">
              {settings.reviews.length === 0 ? (
                <div className="empty-state">
                  <FaStar className="empty-icon" />
                  <p>Nenhuma avaliação adicionada ainda</p>
                  <small>Clique em "Adicionar Nova Avaliação" para começar</small>
                </div>
              ) : (
                settings.reviews.map((review, index) => (
                  <div key={review.id} className="review-item">
                    <div className="review-item-header">
                      <span className="review-number">#{index + 1}</span>
                      <div className="review-actions">
                        <button
                          onClick={() => moveReview(index, 'up')}
                          disabled={index === 0}
                          className="move-btn"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveReview(index, 'down')}
                          disabled={index === settings.reviews.length - 1}
                          className="move-btn"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeReview(review.id)}
                          className="remove-btn"
                          title="Remover avaliação"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="review-item-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nome do Cliente</label>
                          <input
                            type="text"
                            value={review.name}
                            onChange={(e) => updateReview(review.id, 'name', e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>

                        <div className="form-group">
                          <label>Avaliação (Estrelas)</label>
                          <select
                            value={review.rating}
                            onChange={(e) => updateReview(review.id, 'rating', parseInt(e.target.value))}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                            <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                            <option value={2}>⭐⭐ (2 estrelas)</option>
                            <option value={1}>⭐ (1 estrela)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Foto do Cliente</label>
                        <div className="photo-upload-container">
                          <label htmlFor={`photo-upload-${review.id}`} className="upload-btn">
                            <FaCloudUploadAlt />
                            <span>{uploadingPhoto[review.id] ? 'Enviando...' : 'Enviar Foto (Cloudinary)'}</span>
                            <input
                              id={`photo-upload-${review.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(review.id, e.target.files[0])}
                              disabled={uploadingPhoto[review.id]}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <small>Ou cole a URL abaixo (máx 5MB)</small>
                          <input
                            type="url"
                            value={review.photo}
                            onChange={(e) => updateReview(review.id, 'photo', e.target.value)}
                            placeholder="https://..."
                            disabled={uploadingPhoto[review.id]}
                          />
                          <input
                            type="text"
                            value={review.photoAlt || ''}
                            onChange={(e) => updateReview(review.id, 'photoAlt', e.target.value)}
                            placeholder="Texto alternativo da foto"
                            disabled={uploadingPhoto[review.id]}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Data da Avaliação</label>
                          <input
                            type="text"
                            value={review.date}
                            onChange={(e) => updateReview(review.id, 'date', e.target.value)}
                            placeholder="dd/mm/aaaa"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Texto da Avaliação</label>
                        <textarea
                          value={review.text}
                          onChange={(e) => updateReview(review.id, 'text', e.target.value)}
                          placeholder="Digite o comentário do cliente..."
                          rows={4}
                        />
                        <small>{review.text.length} caracteres</small>
                      </div>

                      {review.photo && (
                        <div className="photo-preview">
                          <img src={review.photo} alt={review.photoAlt || review.name || 'Foto do cliente'} />
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

export default AdminGoogleReviews;
