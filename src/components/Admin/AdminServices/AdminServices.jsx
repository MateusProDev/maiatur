import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { FiSettings, FiPlus, FiTrash, FiUpload, FiChevronDown, FiChevronUp, FiImage, FiAlertTriangle } from 'react-icons/fi';
import { CLOUDINARY_CONFIG, createCloudinaryUploadFormData } from '../../../config/cloudinary';
import './AdminServices.css';
import './MissingImagesAlert.css';

/*
 * Imagens padrão dos serviços, servidas pelo Cloudinary (f_auto,q_auto:eco).
 * Os PNGs locais antigos foram removidos por pesarem ~1,4 MB cada.
 */
const SERVICES_DEFAULT_IMAGE = {
  transfer: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/q459tqsslmbtdmp5hojb.jpg',
  passeio: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/fniea42zhtccycew2ogm.jpg',
  citytour: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/awotkycgcb1cyqzezj6x.jpg'
};

/**
 * Uma imagem é considerada "faltando" quando o campo está vazio, aponta para
 * um placeholder ou para um caminho local legado que não existe mais.
 * Nesses casos o card mostra o aviso magenta.
 */
const isImageMissing = (image) => {
  if (!image || typeof image !== 'string') return true;
  const value = image.trim();
  if (!value) return true;
  if (value.includes('placeholder.com')) return true;
  if (value.includes('via.placeholder')) return true;
  // Caminhos locais legados (PNGs removidos) começam com "/" e terminam em .png
  if (value.startsWith('/') && /\.(png|jpe?g)$/i.test(value)) return true;
  return false;
};

const AdminServices = () => {
  const [settings, setSettings] = useState({
    active: true,
    badge: 'Experiências Personalizadas',
    title: 'Nossos Serviços',
    subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    services: true
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', 'servicesSection');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(prevSettings => ({ ...prevSettings, ...docSnap.data() }));
      } else {
        // Dados iniciais padrão
        const defaultSettings = {
          active: true,
          badge: 'Experiências Personalizadas',
          title: 'Nossos Serviços',
          subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
          services: [
            {
              id: Date.now(),
              title: 'Transfers & Receptivo',
              description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
              image: SERVICES_DEFAULT_IMAGE.transfer,
              alt: 'Transfer e receptivo em Fortaleza',
              color: '#21A657',
              link: '/pacotes',
              linkText: 'Saiba mais'
            },
            {
              id: Date.now() + 1,
              title: 'Passeios Privativos',
              description: 'Experiências exclusivas com roteiros personalizados para você',
              image: SERVICES_DEFAULT_IMAGE.passeio,
              alt: 'Passeio privativo',
              color: '#EE7C35',
              link: '/pacotes',
              linkText: 'Saiba mais'
            },
            {
              id: Date.now() + 2,
              title: 'City Tours',
              description: 'Conheça as principais atrações e cultura local com nossos guias',
              image: SERVICES_DEFAULT_IMAGE.citytour,
              alt: 'City tour em Fortaleza',
              color: '#F8C144',
              link: '/pacotes',
              linkText: 'Saiba mais'
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
      const docRef = doc(db, 'content', 'servicesSection');
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

  const addService = () => {
    const newService = {
      id: Date.now(),
      title: '',
      description: '',
      image: '',
      alt: '',
      color: '#667eea',
      link: '/pacotes',
      linkText: 'Saiba mais'
    };
    setSettings(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const removeService = (id) => {
    if (window.confirm('Deseja remover este serviço?')) {
      setSettings(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== id)
      }));
    }
  };

  const updateService = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === id ? { ...service, [field]: value } : service
      )
    }));
  };

  const moveService = (index, direction) => {
    const newServices = [...settings.services];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newServices.length) return;
    
    [newServices[index], newServices[newIndex]] = [newServices[newIndex], newServices[index]];
    setSettings(prev => ({ ...prev, services: newServices }));
  };

  const handleImageUpload = async (serviceId, file) => {
    if (!file) return;

    // Validação
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ A imagem deve ter no máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Apenas imagens são permitidas');
      return;
    }

    try {
      setUploadingImage(prev => ({ ...prev, [serviceId]: true }));
      setMessage('📤 Fazendo upload da imagem...');

      const formData = createCloudinaryUploadFormData(file, 'services');

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
      updateService(serviceId, 'image', data.secure_url);
      setMessage('✅ Imagem enviada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage('❌ Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  /* Quantas imagens ainda faltam — o aviso some conforme cada uma é enviada. */
  const missingImagesCount = settings.services.filter(s => isImageMissing(s.image)).length;

  if (loading) {
    return (
      <div className="admin-services-loading">
        <div className="spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="admin-services">
      <div className="admin-services-header">
        <div className="header-content">
          <FiSettings className="header-icon" />
          <div>
            <h1>Gerenciar Seção de Serviços</h1>
            <p>Configure os serviços exibidos na página inicial</p>
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

      {/* Aviso de imagens faltantes — um item por imagem */}
      {missingImagesCount > 0 && (
        <div className="admin-services-missing-alert" role="alert">
          <div className="missing-alert-header">
            <FiAlertTriangle className="missing-alert-icon" />
            <strong>
              {missingImagesCount === 1
                ? '1 serviço está sem imagem'
                : `${missingImagesCount} serviços estão sem imagem`}
            </strong>
          </div>
          <p className="missing-alert-text">
            Os cards abaixo estão marcados em magenta no site. Envie a imagem de cada um
            para que o aviso desapareça.
          </p>
          <ul className="missing-alert-list">
            {settings.services.map((service, index) =>
              isImageMissing(service.image) ? (
                <li key={service.id}>
                  <span className="missing-alert-item">
                    #{index + 1} {service.title || 'Serviço sem título'}
                  </span>
                  <label htmlFor={`upload-quick-${service.id}`} className="missing-alert-btn">
                    <FiUpload /> Adicionar imagem
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id={`upload-quick-${service.id}`}
                    style={{ display: 'none' }}
                    disabled={uploadingImage[service.id]}
                    onChange={(e) => handleImageUpload(service.id, e.target.files[0])}
                  />
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      <div className="admin-services-info-box">
        <h3>📸 Como usar o Cloudinary</h3>
        <ol>
          <li><strong>Clique no botão de upload</strong> em cada serviço</li>
          <li><strong>Selecione uma imagem</strong> (máximo 5MB)</li>
          <li><strong>Aguarde o upload</strong> - a URL será automaticamente atualizada</li>
          <li><strong>Salve as alterações</strong> para aplicar no site</li>
        </ol>
        <p><strong>Dica:</strong> Use imagens de alta qualidade (mínimo 800x600px) para melhor visualização.</p>
      </div>

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
                <span>Exibir seção de serviços no site</span>
              </label>
            </div>

            <div className="form-group">
              <label>Badge/Etiqueta</label>
              <input
                type="text"
                value={settings.badge}
                onChange={(e) => setSettings({ ...settings, badge: e.target.value })}
                placeholder="Ex: Experiências Personalizadas"
              />
              <small>Texto pequeno acima do título</small>
            </div>

            <div className="form-group">
              <label>Título da Seção</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Ex: Nossos Serviços"
              />
            </div>

            <div className="form-group">
              <label>Subtítulo</label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                placeholder="Ex: Cada detalhe pensado para tornar sua viagem perfeita"
              />
            </div>
          </div>
        )}
      </div>

      {/* Gerenciar Serviços */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('services')}>
          <h2>🎯 Gerenciar Serviços ({settings.services.length})</h2>
          {expandedSections.services ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.services && (
          <div className="section-content">
            <button onClick={addService} className="add-service-btn">
              <FiPlus /> Adicionar Novo Serviço
            </button>

            <div className="services-list">
              {settings.services.length === 0 ? (
                <div className="empty-state">
                  <FiImage className="empty-icon" />
                  <p>Nenhum serviço adicionado ainda</p>
                  <small>Clique em "Adicionar Novo Serviço" para começar</small>
                </div>
              ) : (
                settings.services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`service-item ${isImageMissing(service.image) ? 'service-item--missing-image' : ''}`}
                  >
                    <div className="service-item-header">
                      <span className="service-number">#{index + 1}</span>
                      {isImageMissing(service.image) && (
                        <span className="service-missing-flag">
                          <FiAlertTriangle /> Sem imagem
                        </span>
                      )}
                      <div className="service-actions">
                        <button
                          onClick={() => moveService(index, 'up')}
                          disabled={index === 0}
                          className="move-btn"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveService(index, 'down')}
                          disabled={index === settings.services.length - 1}
                          className="move-btn"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeService(service.id)}
                          className="remove-btn"
                          title="Remover serviço"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>

                    <div className="service-item-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Título do Serviço</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => updateService(service.id, 'title', e.target.value)}
                            placeholder="Ex: Transfers & Receptivo"
                          />
                        </div>

                        <div className="form-group">
                          <label>Cor de Destaque</label>
                          <div className="color-input-wrapper">
                            <input
                              type="color"
                              value={service.color}
                              onChange={(e) => updateService(service.id, 'color', e.target.value)}
                            />
                            <input
                              type="text"
                              value={service.color}
                              onChange={(e) => updateService(service.id, 'color', e.target.value)}
                              placeholder="#667eea"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                          value={service.description}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          placeholder="Descreva o serviço..."
                          rows={3}
                        />
                        <small>{service.description.length} caracteres</small>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Link do Botão</label>
                          <input
                            type="text"
                            value={service.link}
                            onChange={(e) => updateService(service.id, 'link', e.target.value)}
                            placeholder="/pacotes"
                          />
                        </div>

                        <div className="form-group">
                          <label>Texto do Botão</label>
                          <input
                            type="text"
                            value={service.linkText}
                            onChange={(e) => updateService(service.id, 'linkText', e.target.value)}
                            placeholder="Saiba mais"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Imagem do Serviço</label>
                        <div className="image-upload-container">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(service.id, e.target.files[0])}
                            disabled={uploadingImage[service.id]}
                            id={`upload-${service.id}`}
                            style={{ display: 'none' }}
                          />
                          <label 
                            htmlFor={`upload-${service.id}`} 
                            className="upload-btn"
                            style={{ opacity: uploadingImage[service.id] ? 0.6 : 1 }}
                          >
                            <FiUpload />
                            {uploadingImage[service.id] ? 'Enviando...' : 'Upload Cloudinary'}
                          </label>
                          <input
                            type="url"
                            value={service.image}
                            onChange={(e) => updateService(service.id, 'image', e.target.value)}
                            placeholder="https://..."
                            disabled={uploadingImage[service.id]}
                          />
                          <input
                            type="text"
                            value={service.alt || ''}
                            onChange={(e) => updateService(service.id, 'alt', e.target.value)}
                            placeholder="Texto alternativo da imagem"
                            disabled={uploadingImage[service.id]}
                          />
                        </div>
                      </div>

                      {isImageMissing(service.image) ? (
                        <div className="image-missing-preview">
                          <FiAlertTriangle />
                          <span>Sem imagem — este card aparece em magenta no site</span>
                        </div>
                      ) : (
                        <div className="image-preview">
                          <img
                            src={service.image}
                            alt={service.alt || service.title || 'Imagem do serviço'}
                            onError={(e) => {
                              e.currentTarget.parentElement.classList.add('image-preview--broken');
                            }}
                          />
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

export default AdminServices;
