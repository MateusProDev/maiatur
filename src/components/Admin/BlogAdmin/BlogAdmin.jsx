// src/components/Admin/BlogAdmin/BlogAdmin.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSearch, FiSave, FiX, FiImage } from 'react-icons/fi';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from 'axios';
import { CLOUDINARY_CONFIG } from '../../../config/cloudinary';
import { createPost, updatePost, deletePost, getAllPostsAdmin, generateSlug } from '../../../services/blogService';
import './BlogAdmin.css';

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [currentPost, setCurrentPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    instagramUrl: '',
    author: 'Equipe Maiatur',
    category: '',
    tags: [],
    published: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogImage: ''
    }
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [tagInput, setTagInput] = useState('');

  // Configuração do editor Draft.js
  const editorToolbar = {
    options: ['inline', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough']
    },
    blockType: {
      inDropdown: true,
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
    },
    list: {
      options: ['unordered', 'ordered']
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, searchTerm, filterPublished]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPostsAdmin();
      setPosts(data);
    } catch (error) {
      showNotification('Erro ao carregar posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de publicação
    if (filterPublished !== 'all') {
      const isPublished = filterPublished === 'published';
      filtered = filtered.filter(post => post.published === isPublished);
    }

    setFilteredPosts(filtered);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleNewPost = () => {
    setCurrentPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      instagramUrl: '',
      author: 'Equipe Maiatur',
      category: '',
      tags: [],
      published: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogImage: ''
      }
    });
    setEditorState(EditorState.createEmpty());
    setIsEditing(true);
  };

  const handleEditPost = (post) => {
    setCurrentPost({
      ...post,
      tags: post.tags || [],
      seo: post.seo || {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogImage: ''
      }
    });
    
    // Converter HTML para EditorState
    if (post.content) {
      const contentBlock = htmlToDraft(post.content);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      }
    } else {
      setEditorState(EditorState.createEmpty());
    }
    
    setIsEditing(true);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      await deletePost(postId);
      showNotification('Post excluído com sucesso!', 'success');
      loadPosts();
    } catch (error) {
      showNotification('Erro ao excluir post', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'blog');

      const response = await axios.post(CLOUDINARY_CONFIG.apiUrl, formData);
      
      setCurrentPost(prev => ({
        ...prev,
        featuredImage: response.data.secure_url,
        seo: {
          ...prev.seo,
          ogImage: response.data.secure_url
        }
      }));
      
      showNotification('Imagem enviada com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao enviar imagem', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTitleChange = (title) => {
    const slug = generateSlug(title);
    setCurrentPost(prev => ({
      ...prev,
      title,
      slug,
      seo: {
        ...prev.seo,
        metaTitle: title
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentPost.tags.includes(tagInput.trim())) {
      setCurrentPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCurrentPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSavePost = async () => {
    // Converter EditorState para HTML
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    
    if (!currentPost.title || !htmlContent.trim()) {
      showNotification('Título e conteúdo são obrigatórios', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const postData = {
        ...currentPost,
        content: htmlContent
      };
      
      if (currentPost.id) {
        await updatePost(currentPost.id, postData);
        showNotification('Post atualizado com sucesso!', 'success');
      } else {
        await createPost(postData);
        showNotification('Post criado com sucesso!', 'success');
      }
      
      setIsEditing(false);
      setEditorState(EditorState.createEmpty());
      loadPosts();
    } catch (error) {
      showNotification('Erro ao salvar post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Não publicado';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading && !isEditing) {
    return (
      <div className="blog-admin-loading">
        <div className="spinner"></div>
        <p>Carregando posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-admin-container">
      {notification.show && (
        <div className={`blog-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {!isEditing ? (
        <div className="blog-admin-list">
          <div className="blog-admin-header">
            <h1>
              <FiEdit2 /> Gerenciar Blog
            </h1>
            <button className="btn-primary" onClick={handleNewPost}>
              <FiPlus /> Novo Post
            </button>
          </div>

          <div className="blog-filters">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>

          <div className="blog-stats">
            <div className="stat-card">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Total de Posts</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{posts.filter(p => p.published).length}</span>
              <span className="stat-label">Publicados</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{posts.filter(p => !p.published).length}</span>
              <span className="stat-label">Rascunhos</span>
            </div>
          </div>

          <div className="posts-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-image">
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} />
                  ) : (
                    <div className="no-image">
                      <FiImage />
                    </div>
                  )}
                  <div className={`post-status ${post.published ? 'published' : 'draft'}`}>
                    {post.published ? <FiEye /> : <FiEyeOff />}
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </div>
                </div>
                
                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  
                  <div className="post-meta">
                    <span className="post-category">{post.category}</span>
                    <span className="post-date">{formatDate(post.publishedAt)}</span>
                    <span className="post-views">{post.views || 0} visualizações</span>
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditPost(post)}
                    >
                      <FiEdit2 /> Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <FiTrash2 /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="empty-state">
              <FiEdit2 size={64} />
              <h3>Nenhum post encontrado</h3>
              <p>Crie seu primeiro post para começar!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="blog-admin-editor">
          <div className="editor-header">
            <h2>{currentPost.id ? 'Editar Post' : 'Novo Post'}</h2>
            <div className="editor-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                <FiX /> Cancelar
              </button>
              <button className="btn-primary" onClick={handleSavePost} disabled={loading}>
                <FiSave /> {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          <div className="editor-content">
            <div className="editor-main">
              <div className="form-group">
                <label>Título do Post *</label>
                <input
                  type="text"
                  value={currentPost.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Digite o título do post"
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug (URL)</label>
                <input
                  type="text"
                  value={currentPost.slug}
                  onChange={(e) => setCurrentPost({...currentPost, slug: e.target.value})}
                  placeholder="slug-do-post"
                />
                <small>URL: /blog/{currentPost.slug}</small>
              </div>

              <div className="form-group">
                <label>Conteúdo do Post *</label>
                <div className="editor-wrapper">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    toolbar={editorToolbar}
                    wrapperClassName="editor-wrapper-class"
                    editorClassName="editor-main-class"
                    toolbarClassName="editor-toolbar-class"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Resumo (Excerpt)</label>
                <textarea
                  value={currentPost.excerpt}
                  onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  placeholder="Breve descrição do post (recomendado para SEO)"
                  rows="3"
                />
              </div>
            </div>

            <div className="editor-sidebar">
              <div className="sidebar-section">
                <h3>Publicação</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentPost.published}
                    onChange={(e) => setCurrentPost({...currentPost, published: e.target.checked})}
                  />
                  <span>Publicar post</span>
                </label>
              </div>

              <div className="sidebar-section">
                <h3>Imagem Destacada</h3>
                {currentPost.featuredImage ? (
                  <div className="featured-image-preview">
                    <img src={currentPost.featuredImage} alt="Preview" />
                    <button 
                      className="btn-remove-image"
                      onClick={() => setCurrentPost({...currentPost, featuredImage: ''})}
                    >
                      <FiTrash2 /> Remover
                    </button>
                  </div>
                ) : (
                  <div className="upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="featuredImage"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="featuredImage">
                      {uploadingImage ? (
                        <>
                          <div className="spinner-small"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <FiImage />
                          <span>Enviar Imagem</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <h3>Post do Instagram</h3>
                <input
                  type="text"
                  value={currentPost.instagramUrl}
                  onChange={(e) => setCurrentPost({...currentPost, instagramUrl: e.target.value})}
                  placeholder="Cole o link do post do Instagram"
                />
                <small style={{color: '#94a3b8', fontSize: '0.85em', marginTop: '5px', display: 'block'}}>
                  Ex: https://www.instagram.com/p/ABC123/
                </small>
                {currentPost.instagramUrl && (
                  <div style={{marginTop: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '8px'}}>
                    <p style={{fontSize: '0.9em', color: '#64748b', margin: 0}}>
                      ✓ Post do Instagram será exibido no blog
                    </p>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <h3>Categoria</h3>
                <input
                  type="text"
                  value={currentPost.category}
                  onChange={(e) => setCurrentPost({...currentPost, category: e.target.value})}
                  placeholder="Ex: Destinos, Dicas, Cultura"
                />
              </div>

              <div className="sidebar-section">
                <h3>Tags</h3>
                <div className="tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Adicionar tag"
                  />
                  <button onClick={handleAddTag}>+</button>
                </div>
                <div className="tags-list">
                  {currentPost.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <h3>Autor</h3>
                <input
                  type="text"
                  value={currentPost.author}
                  onChange={(e) => setCurrentPost({...currentPost, author: e.target.value})}
                  placeholder="Nome do autor"
                />
              </div>

              <div className="sidebar-section seo-section">
                <h3>SEO</h3>
                
                <div className="form-group-small">
                  <label>Meta Título</label>
                  <input
                    type="text"
                    value={currentPost.seo.metaTitle}
                    onChange={(e) => setCurrentPost({
                      ...currentPost,
                      seo: {...currentPost.seo, metaTitle: e.target.value}
                    })}
                    placeholder="Título para SEO"
                    maxLength="60"
                  />
                  <small>{currentPost.seo.metaTitle?.length || 0}/60</small>
                </div>

                <div className="form-group-small">
                  <label>Meta Descrição</label>
                  <textarea
                    value={currentPost.seo.metaDescription}
                    onChange={(e) => setCurrentPost({
                      ...currentPost,
                      seo: {...currentPost.seo, metaDescription: e.target.value}
                    })}
                    placeholder="Descrição para SEO"
                    rows="3"
                    maxLength="160"
                  />
                  <small>{currentPost.seo.metaDescription?.length || 0}/160</small>
                </div>

                <div className="form-group-small">
                  <label>Palavras-chave</label>
                  <input
                    type="text"
                    value={currentPost.seo.keywords}
                    onChange={(e) => setCurrentPost({
                      ...currentPost,
                      seo: {...currentPost.seo, keywords: e.target.value}
                    })}
                    placeholder="palavra1, palavra2, palavra3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAdmin;

