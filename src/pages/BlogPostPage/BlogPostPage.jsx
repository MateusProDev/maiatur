// src/pages/BlogPostPage/BlogPostPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getPostBySlug, incrementPostViews, getRelatedPosts } from '../../services/blogService';
import { useWhatsAppNumber } from '../../hooks/useWhatsAppNumber';
import { FiCalendar, FiUser, FiTag, FiArrowLeft, FiShare2, FiMessageCircle, FiHome } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { phoneNumber } = useWhatsAppNumber();

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await getPostBySlug(slug);
      
      if (!postData) {
        navigate('/blog');
        return;
      }

      setPost(postData);
      console.log('📊 Post carregado:', postData.title, '| Views atuais:', postData.views || 0);
      
      // Incrementar views sempre (para debug)
      try {
        await incrementPostViews(postData.id);
        console.log('✅ View incrementada com sucesso!');
      } catch (viewError) {
        console.error('❌ Erro ao incrementar view:', viewError);
      }

      if (postData.category) {
        const related = await getRelatedPosts(postData.id, postData.category, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Olá! Vi o post "${post.title}" no blog e gostaria de mais informações sobre pacotes de viagem.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading || !post) {
    return (
      <>
        <Header />
        <LoadingSpinner fullScreen text="Carregando post..." />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.seo?.metaTitle || post.title} - Transfer Fortaleza Tur</title>
        <meta name="description" content={post.seo?.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.seo?.keywords || post.tags?.join(', ')} />
        <meta property="og:title" content={post.seo?.metaTitle || post.title} />
        <meta property="og:description" content={post.seo?.metaDescription || post.excerpt} />
        <meta property="og:image" content={post.seo?.ogImage || post.featuredImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />
      
      <article className="blog-post-page">
        <div className="blog-post-header">
          <button className="back-button" onClick={() => navigate('/blog')}>
            <FiArrowLeft /> Voltar ao Blog
          </button>

          <div className="blog-post-hero">
            <img src={post.featuredImage} alt={post.title} />
            <div className="blog-post-hero-overlay">
              {post.category && <span className="post-category-badge">{post.category}</span>}
              <h1>{post.title}</h1>
              
              <div className="post-meta-info">
                <span><FiCalendar /> {formatDate(post.publishedAt)}</span>
                <span><FiUser /> {post.author}</span>
                <button className="share-button" onClick={handleShare}>
                  <FiShare2 /> Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="blog-post-container">
          <div className="blog-post-content">
            <div 
              className="post-body" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Call to Action - WhatsApp */}
            <div className="post-cta-box">
              <div className="cta-content">
                <FiMessageCircle className="cta-icon" />
                <div className="cta-text">
                  <h3>Gostou deste destino?</h3>
                  <p>Conheça nossos pacotes de viagem e monte sua experiência personalizada!</p>
                </div>
              </div>
              <div className="cta-buttons">
                <button className="cta-home-button" onClick={() => navigate('/')}>
                  <FiHome />
                  Ver Pacotes
                </button>
                <button className="cta-whatsapp-button" onClick={handleWhatsAppContact}>
                  <FaWhatsapp />
                  Fale Conosco
                </button>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                <FiTag />
                {post.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {relatedPosts.length > 0 && (
            <aside className="related-posts">
              <h3>Posts Relacionados</h3>
              <div className="related-posts-grid">
                {relatedPosts.map(related => (
                  <div 
                    key={related.id} 
                    className="related-post-card"
                    onClick={() => navigate(`/blog/${related.slug}`)}
                  >
                    <img src={related.featuredImage} alt={related.title} />
                    <h4>{related.title}</h4>
                    <p>{related.excerpt}</p>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </article>

      <Footer />
    </>
  );
};

export default BlogPostPage;
