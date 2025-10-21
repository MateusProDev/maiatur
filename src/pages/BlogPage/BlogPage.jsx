// src/pages/BlogPage/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getPublishedPosts, getAllCategories } from '../../services/blogService';
import { FiCalendar, FiUser, FiTag, FiEye } from 'react-icons/fi';
import './BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, catsData] = await Promise.all([
        getPublishedPosts(50),
        getAllCategories()
      ]);
      setPosts(postsData.posts);
      setCategories(catsData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner fullScreen text="Carregando posts..." />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog - Maiatur | Dicas e Destinos de Viagem</title>
        <meta name="description" content="Descubra dicas exclusivas, destinos incríveis e tudo sobre viagens no blog da Maiatur." />
        <meta name="keywords" content="blog viagem, dicas de viagem, destinos turísticos, turismo" />
      </Helmet>

      <Header />
      
      <div className="blog-page">
        <div className="blog-hero">
          <div className="blog-hero-content">
            <h1>Blog Maiatur</h1>
            <p>Descubra os melhores destinos e dicas para sua próxima aventura</p>
          </div>
        </div>

        <div className="blog-container">
          <div className="blog-filters-bar">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {filteredPosts.map(post => (
              <article 
                key={post.id} 
                className="blog-card"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="blog-card-image">
                  <img src={post.featuredImage} alt={post.title} loading="lazy" />
                  {post.category && (
                    <span className="blog-card-category">{post.category}</span>
                  )}
                </div>
                
                <div className="blog-card-content">
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  
                  <div className="blog-card-meta">
                    <span><FiCalendar /> {formatDate(post.publishedAt)}</span>
                    <span><FiUser /> {post.author}</span>
                    <span><FiEye /> {post.views || 0}</span>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-card-tags">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag}><FiTag /> {tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="blog-empty">
              <p>Nenhum post encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogPage;
