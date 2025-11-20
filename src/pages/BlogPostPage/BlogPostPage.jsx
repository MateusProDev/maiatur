// src/pages/BlogPostPage/BlogPostPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Carregar script do Instagram embed quando houver URL
  useEffect(() => {
    if (post?.instagramUrl) {
      // Remover carregamento dinâmico do script
      const timer = setTimeout(() => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [post]);

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

  // Extrair código embed do Instagram a partir da URL
  const getInstagramEmbedUrl = (url) => {
    if (!url) return null;
    
    // Limpar URL removendo parâmetros UTM
    const cleanUrl = url.split('?')[0];
    
    // Extrair o tipo (p ou reel) e código do post da URL
    // Aceita formatos: https://www.instagram.com/p/ABC123/ ou https://instagram.com/reel/XYZ789/
    const match = cleanUrl.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const tipo = match[1]; // 'p' ou 'reel'
      const codigo = match[2];
      return `https://www.instagram.com/${tipo}/${codigo}/`;
    }
    return null;
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
      <SEOHelmet
        title={post.seo?.metaTitle || post.title}
        description={post.seo?.metaDescription || post.excerpt}
        canonical={typeof window !== 'undefined' ? window.location.href : ''}
        ogImage={post.seo?.ogImage || post.featuredImage}
        ogType="article"
      />
      <Helmet>
        <meta name="keywords" content={post.seo?.keywords || post.tags?.join(', ')} />
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

            {/* Instagram Embed */}
            {post.instagramUrl && getInstagramEmbedUrl(post.instagramUrl) && (
              <div className="instagram-embed-container">
                <h3 style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: '#334155',
                  fontSize: '1.3em',
                  fontWeight: '600'
                }}>
                  📸 Confira também no Instagram
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '30px 0',
                  position: 'relative'
                }}>
                  <iframe
                    src={`${getInstagramEmbedUrl(post.instagramUrl)}embed/captioned/`}
                    width="540"
                    height="700"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen={true}
                    loading="lazy"
                    style={{
                      border: 'none',
                      overflow: 'hidden',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="Instagram Post"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
                <p style={{
                  textAlign: 'center',
                  fontSize: '0.9em',
                  color: '#64748b',
                  marginTop: '10px'
                }}>
                  👆 Clique no vídeo para assistir
                </p>
              </div>
            )}

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


