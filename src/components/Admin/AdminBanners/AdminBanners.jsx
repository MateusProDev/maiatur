import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import axios from 'axios';
import { CLOUDINARY_CONFIG } from '../../../config/cloudinary';
import { db } from '../../../firebase/firebase';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiUpload,
  FiImage,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import './AdminBanners.css';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descricao: '',
    imagem: '',
    localizacao: '',
    botaoTexto: 'Ver Pacotes',
    botaoLink: '/pacotes',
    botaoSecundarioTexto: '',
    botaoSecundarioLink: '',
    ativo: true,
    ordem: 1
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const q = query(collection(db, 'banners'), orderBy('ordem', 'asc'));
      const querySnapshot = await getDocs(q);
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannersData);
    } catch (err) {
      console.error('Erro ao buscar banners:', err);
      alert('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📁 Arquivo selecionado:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size);

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      console.log('❌ Tipo de arquivo inválido:', file.type);
      return;
    }

    try {
      setUploading(true);
      console.log('🚀 Iniciando upload para Cloudinary...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'banners');
      
      console.log('📤 Fazendo upload do arquivo...');
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload: ${percentCompleted}%`);
          }
        }
      );
      
      const downloadURL = response.data.secure_url;
      console.log('✅ Upload concluído! URL:', downloadURL);
      
      setFormData(prev => ({ ...prev, imagem: downloadURL }));
      alert('✅ Imagem enviada com sucesso para Cloudinary!');
    } catch (err) {
      console.error('❌ Erro detalhado ao fazer upload:', err);
      console.error('Resposta do servidor:', err.response?.data);
      alert('Erro ao fazer upload da imagem: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setUploading(false);
      console.log('🏁 Upload finalizado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== DEBUG handleSubmit ===');
    console.log('formData.titulo:', formData.titulo);
    console.log('formData.imagem:', formData.imagem);
    console.log('formData completo:', formData);

    if (!formData.titulo || !formData.imagem) {
      alert('Título e imagem são obrigatórios');
      console.log('❌ Validação falhou');
      return;
    }

    try {
      setSaving(true);
      console.log('✅ Iniciando salvamento...');
      
      const bannerData = {
        ...formData,
        ordem: parseInt(formData.ordem) || 1,
        updatedAt: serverTimestamp()
      };

      if (editingBanner) {
        console.log('📝 Atualizando banner:', editingBanner.id);
        await setDoc(doc(db, 'banners', editingBanner.id), bannerData, { merge: true });
        alert('Banner atualizado com sucesso!');
      } else {
        console.log('🆕 Criando novo banner');
        bannerData.createdAt = serverTimestamp();
        const newDocRef = doc(collection(db, 'banners'));
        await setDoc(newDocRef, bannerData);
        alert('Banner criado com sucesso!');
      }

      console.log('✅ Banner salvo com sucesso!');
      resetForm();
      await fetchBanners();
    } catch (err) {
      console.error('❌ Erro ao salvar banner:', err);
      alert('Erro ao salvar banner: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      titulo: banner.titulo || '',
      subtitulo: banner.subtitulo || '',
      descricao: banner.descricao || '',
      imagem: banner.imagem || '',
      localizacao: banner.localizacao || '',
      botaoTexto: banner.botaoTexto || 'Ver Pacotes',
      botaoLink: banner.botaoLink || '/pacotes',
      botaoSecundarioTexto: banner.botaoSecundarioTexto || '',
      botaoSecundarioLink: banner.botaoSecundarioLink || '',
      ativo: banner.ativo !== undefined ? banner.ativo : true,
      ordem: banner.ordem || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Tem certeza que deseja excluir o banner "${banner.titulo}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'banners', banner.id));
      alert('Banner excluído com sucesso!');
      fetchBanners();
    } catch (err) {
      console.error('Erro ao excluir banner:', err);
      alert('Erro ao excluir banner');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await setDoc(
        doc(db, 'banners', banner.id),
        { ativo: !banner.ativo, updatedAt: serverTimestamp() },
        { merge: true }
      );
      fetchBanners();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      subtitulo: '',
      descricao: '',
      imagem: '',
      localizacao: '',
      botaoTexto: 'Ver Pacotes',
      botaoLink: '/pacotes',
      botaoSecundarioTexto: '',
      botaoSecundarioLink: '',
      ativo: true,
      ordem: 1
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  return (
    <div className="admin-banners-container">
      <div className="admin-banners-header">
        <h1>Gerenciar Banners do Hero</h1>
        <button 
          className="btn-add-banner"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><FiX /> Cancelar</> : <><FiPlus /> Novo Banner</>}
        </button>
      </div>

      {showForm && (
        <form className="banner-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Título *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ex: Descubra o Paraíso do Ceará"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Subtítulo</label>
              <input
                type="text"
                name="subtitulo"
                value={formData.subtitulo}
                onChange={handleInputChange}
                placeholder="Ex: Praias paradisíacas, cultura rica e hospitalidade única"
              />
            </div>

            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Ex: Explore as melhores praias do litoral cearense com conforto e segurança. Transfer exclusivo do aeroporto ao seu destino dos sonhos."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Localização</label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleInputChange}
                placeholder="Ex: Ceará, Brasil"
              />
            </div>

            <div className="form-group">
              <label>Ordem de Exibição</label>
              <input
                type="number"
                name="ordem"
                value={formData.ordem}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group full-width">
              <label>Imagem do Banner * (1920x1080px recomendado)</label>
              <div className="image-upload-area">
                {formData.imagem ? (
                  <div className="image-preview">
                    <img src={formData.imagem} alt="Preview" />
                    <button 
                      type="button"
                      className="btn-remove-image"
                      onClick={() => setFormData(prev => ({ ...prev, imagem: '' }))}
                    >
                      <FiX /> Remover
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <FiUpload />
                    <span>{uploading ? '⏳ Enviando... (aguarde)' : 'Clique para fazer upload da imagem'}</span>
                    {uploading && (
                      <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#64748b' }}>
                        Fazendo upload para Firebase Storage...
                      </div>
                    )}
                  </label>
                )}
              </div>
              <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>
                💡 Dica: Você também pode colar a URL da imagem abaixo
              </small>
              <input
                type="url"
                name="imagem"
                value={formData.imagem}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Texto do Botão Principal</label>
              <input
                type="text"
                name="botaoTexto"
                value={formData.botaoTexto}
                onChange={handleInputChange}
                placeholder="Ex: Ver Pacotes"
              />
            </div>

            <div className="form-group">
              <label>Link do Botão Principal</label>
              <input
                type="text"
                name="botaoLink"
                value={formData.botaoLink}
                onChange={handleInputChange}
                placeholder="/pacotes"
              />
            </div>

            <div className="form-group">
              <label>Texto do Botão Secundário (Opcional)</label>
              <input
                type="text"
                name="botaoSecundarioTexto"
                value={formData.botaoSecundarioTexto}
                onChange={handleInputChange}
                placeholder="Ex: Saiba Mais"
              />
            </div>

            <div className="form-group">
              <label>Link do Botão Secundário</label>
              <input
                type="text"
                name="botaoSecundarioLink"
                value={formData.botaoSecundarioLink}
                onChange={handleInputChange}
                placeholder="Ex: /sobre"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                />
                Banner ativo (visível no site)
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={resetForm} disabled={saving}>
              <FiX /> Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={saving || uploading}>
              {saving ? (
                <>⏳ Salvando...</>
              ) : (
                <><FiSave /> {editingBanner ? 'Atualizar Banner' : 'Criar Banner'}</>
              )}
            </button>
          </div>
        </form>
      )}

      {loading && !showForm ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando banners...</p>
        </div>
      ) : (
        <div className="banners-list">
          {banners.length === 0 ? (
            <div className="empty-state">
              <FiImage />
              <h3>Nenhum banner cadastrado</h3>
              <p>Clique em "Novo Banner" para começar</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className={`banner-card ${!banner.ativo ? 'inactive' : ''}`}>
                <div className="banner-card-image">
                  <img src={banner.imagem} alt={banner.titulo} />
                  {!banner.ativo && (
                    <div className="inactive-overlay">
                      <FiEyeOff /> Inativo
                    </div>
                  )}
                  <div className="banner-order-badge">#{banner.ordem}</div>
                </div>
                <div className="banner-card-content">
                  <h3>{banner.titulo}</h3>
                  {banner.subtitulo && <p className="banner-subtitle">{banner.subtitulo}</p>}
                  {banner.localizacao && (
                    <p className="banner-location">📍 {banner.localizacao}</p>
                  )}
                  <div className="banner-card-actions">
                    <button 
                      className={`btn-toggle ${banner.ativo ? 'active' : ''}`}
                      onClick={() => toggleStatus(banner)}
                      title={banner.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {banner.ativo ? <FiEye /> : <FiEyeOff />}
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(banner)}
                      title="Editar"
                    >
                      <FiEdit2 /> Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(banner)}
                      title="Excluir"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
