import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiSave, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiImage, FiLink, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import './AdminLinkInBio.css';

const iconOptions = [
  { value: 'instagram', label: '📷 Instagram', icon: '📷' },
  { value: 'facebook', label: '👍 Facebook', icon: '👍' },
  { value: 'tiktok', label: '🎵 TikTok', icon: '🎵' },
  { value: 'youtube', label: '▶️ YouTube', icon: '▶️' },
  { value: 'globe', label: '🌐 Website', icon: '🌐' },
  { value: 'blog', label: '📝 Blog', icon: '📝' },
  { value: 'mail', label: '📧 Email', icon: '📧' },
  { value: 'phone', label: '📞 Telefone', icon: '📞' },
  { value: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
  { value: 'mapPin', label: '📍 Localização', icon: '📍' },
  { value: 'tripadvisor', label: '🦉 TripAdvisor', icon: '🦉' },
  { value: 'googleReviews', label: '⭐ Avaliações Google', icon: '⭐' },
  { value: 'beachPark', label: '🎢 Beach Park', icon: '🎢' },
  { value: 'tickets', label: '🎫 Ingressos', icon: '🎫' },
  { value: 'externalLink', label: '🔗 Link Externo', icon: '🔗' }
];

const AdminLinkInBio = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    social: true,
    links: true,
    footer: true
  });

  const [bioData, setBioData] = useState({
    name: '',
    description: '',
    logo: '',
    socialLinks: [],
    links: [],
    footerText: ''
  });

  useEffect(() => {
    fetchBioData();
  }, []);

  const fetchBioData = async () => {
    setLoading(true);
    try {
      const bioRef = doc(db, 'content', 'linkInBio');
      const bioDoc = await getDoc(bioRef);
      
      if (bioDoc.exists()) {
        setBioData({
          name: bioDoc.data().name || '',
          description: bioDoc.data().description || '',
          logo: bioDoc.data().logo || '',
          socialLinks: bioDoc.data().socialLinks || [],
          links: bioDoc.data().links || [],
          footerText: bioDoc.data().footerText || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      const bioRef = doc(db, 'content', 'linkInBio');
      await setDoc(bioRef, bioData);
      
      setSaveMessage('✅ Link in Bio atualizado com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('❌ Erro ao salvar!');
      setTimeout(() => setSaveMessage(''), 3000);
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

  // Social Links
  const addSocialLink = () => {
    setBioData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { icon: 'instagram', url: '', label: '' }
      ]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setBioData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index) => {
    setBioData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  // Bio Links
  const addBioLink = () => {
    setBioData(prev => ({
      ...prev,
      links: [
        ...prev.links,
        {
          title: '',
          subtitle: '',
          url: '',
          icon: 'externalLink',
          active: true,
          highlighted: false,
          order: prev.links.length
        }
      ]
    }));
  };

  const updateBioLink = (index, field, value) => {
    setBioData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeBioLink = (index) => {
    setBioData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const moveLinkUp = (index) => {
    if (index === 0) return;
    
    setBioData(prev => {
      const newLinks = [...prev.links];
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
      return {
        ...prev,
        links: newLinks.map((link, i) => ({ ...link, order: i }))
      };
    });
  };

  const moveLinkDown = (index) => {
    if (index === bioData.links.length - 1) return;
    
    setBioData(prev => {
      const newLinks = [...prev.links];
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
      return {
        ...prev,
        links: newLinks.map((link, i) => ({ ...link, order: i }))
      };
    });
  };

  if (loading) {
    return (
      <div className="admin-bio-loading">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="admin-link-bio">
      <div className="admin-bio-header">
        <h1>🔗 Link in Bio</h1>
        <p>Configure sua página de links para Instagram</p>
        <a 
          href="/link-bio" 
          target="_blank" 
          rel="noopener noreferrer"
          className="preview-btn"
        >
          <FiEye /> Visualizar Página
        </a>
      </div>

      {saveMessage && (
        <div className={`save-notification ${saveMessage.includes('❌') ? 'error' : ''}`}>
          {saveMessage}
        </div>
      )}

      {/* Perfil */}
      <div className="admin-section">
        <div className="section-header" onClick={() => toggleSection('profile')}>
          <div className="section-title">
            <FiImage />
            <h2>Perfil</h2>
          </div>
          {expandedSections.profile ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.profile && (
          <div className="section-content">
            <div className="form-group">
              <label>Nome / Título</label>
              <input
                type="text"
                value={bioData.name}
                onChange={(e) => setBioData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="TranferFortalezaTur"
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={bioData.description}
                onChange={(e) => setBioData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Sua agência de viagens dos sonhos! ✈️"
                rows="3"
              />
            </div>

            <div className="info-box">
              <p>
                💡 <strong>Logo:</strong> A logo exibida é automaticamente a mesma do navbar/cabeçalho do site. 
                Para alterá-la, vá em <strong>Editar Header</strong> no dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Redes Sociais */}
      <div className="admin-section">
        <div className="section-header" onClick={() => toggleSection('social')}>
          <div className="section-title">
            <FiLink />
            <h2>Redes Sociais ({bioData.socialLinks.length})</h2>
          </div>
          {expandedSections.social ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.social && (
          <div className="section-content">
            {bioData.socialLinks.map((social, index) => (
              <div key={index} className="social-item">
                <div className="social-fields">
                  <select
                    value={social.icon}
                    onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="URL da rede social"
                    value={social.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Label (opcional)"
                    value={social.label}
                    onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                  />
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeSocialLink(index)}
                  title="Remover"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <button className="add-btn" onClick={addSocialLink}>
              <FiPlus /> Adicionar Rede Social
            </button>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="admin-section">
        <div className="section-header" onClick={() => toggleSection('links')}>
          <div className="section-title">
            <FiLink />
            <h2>Links / Botões ({bioData.links.length})</h2>
          </div>
          {expandedSections.links ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.links && (
          <div className="section-content">
            {bioData.links.map((link, index) => (
              <div key={index} className={`link-item ${!link.active ? 'inactive' : ''}`}>
                <div className="link-header">
                  <span className="link-order">#{index + 1}</span>
                  <input
                    type="text"
                    placeholder="Título do link"
                    value={link.title}
                    onChange={(e) => updateBioLink(index, 'title', e.target.value)}
                    className="link-title-input"
                  />
                  <div className="link-actions">
                    <button
                      className="action-btn"
                      onClick={() => moveLinkUp(index)}
                      disabled={index === 0}
                      title="Mover para cima"
                    >
                      <FiChevronUp />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => moveLinkDown(index)}
                      disabled={index === bioData.links.length - 1}
                      title="Mover para baixo"
                    >
                      <FiChevronDown />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => removeBioLink(index)}
                      title="Remover"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="link-fields">
                  <div className="field-row">
                    <div className="field">
                      <label>Subtítulo (opcional)</label>
                      <input
                        type="text"
                        placeholder="Descrição curta"
                        value={link.subtitle}
                        onChange={(e) => updateBioLink(index, 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Ícone</label>
                      <select
                        value={link.icon}
                        onChange={(e) => updateBioLink(index, 'icon', e.target.value)}
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateBioLink(index, 'url', e.target.value)}
                    />
                  </div>

                  <div className="link-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={link.active}
                        onChange={(e) => updateBioLink(index, 'active', e.target.checked)}
                      />
                      {link.active ? <FiEye /> : <FiEyeOff />}
                      Visível
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={link.highlighted}
                        onChange={(e) => updateBioLink(index, 'highlighted', e.target.checked)}
                      />
                      <FiStar />
                      Destacado
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button className="add-btn" onClick={addBioLink}>
              <FiPlus /> Adicionar Link
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="admin-section">
        <div className="section-header" onClick={() => toggleSection('footer')}>
          <div className="section-title">
            <FiImage />
            <h2>Rodapé</h2>
          </div>
          {expandedSections.footer ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.footer && (
          <div className="section-content">
            <div className="form-group">
              <label>Texto do Rodapé</label>
              <textarea
                value={bioData.footerText}
                onChange={(e) => setBioData(prev => ({ ...prev, footerText: e.target.value }))}
                placeholder="© 2025 - Todos os direitos reservados"
                rows="2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <button
        className="save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <div className="btn-spinner"></div>
            Salvando...
          </>
        ) : (
          <>
            <FiSave />
            Salvar Alterações
          </>
        )}
      </button>
    </div>
  );
};

export default AdminLinkInBio;
