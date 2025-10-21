// src/components/BlogPreview/BlogPreview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMostViewedPosts } from '../../services/blogService';
import { checkBlogPosts } from '../../utils/checkBlogPosts';
import { FiArrowRight, FiEye, FiCalendar } from 'react-icons/fi';
import './BlogPreview.css';

const BlogPreview = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
    // Debug: verificar todos os posts
    checkBlogPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getMostViewedPosts(2);
      console.log('📰 BlogPreview - Posts carregados:', data);
      setPosts(data);
    } catch (error) {
      console.error('❌ BlogPreview - Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Mostra loading enquanto carrega
  if (loading) {
    return (
      <section className="blog-preview-section">
        <div className="blog-preview-container">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando posts...</p>
        </div>
      </section>
    );
  }

  // Não mostra nada se não houver posts
  if (posts.length === 0) {
    console.log('ℹ️ BlogPreview - Nenhum post publicado encontrado');
    return null;
  }

  return (
    <section className="blog-preview-section">
      <div className="blog-preview-container">
        <div className="blog-preview-header">
          <div>
            <h2>Últimas do Blog</h2>
            <p>Dicas e destinos incríveis para sua próxima viagem</p>
          </div>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/blog')}
          >
            Ver Todos <FiArrowRight />
          </button>
        </div>

        <div className="blog-preview-grid">
          {posts.map(post => (
            <article 
              key={post.id} 
              className="blog-preview-card"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <div className="blog-preview-image">
                <img src={post.featuredImage} alt={post.title} loading="lazy" />
                <div className="blog-preview-stats">
                  <span><FiEye /> {post.views || 0}</span>
                </div>
              </div>
              
              <div className="blog-preview-content">
                {post.category && (
                  <span className="blog-preview-category">{post.category}</span>
                )}
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="blog-preview-footer">
                  <span><FiCalendar /> {formatDate(post.publishedAt)}</span>
                  <span className="read-more">Ler mais <FiArrowRight /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
