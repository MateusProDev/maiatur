import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { seoData } from '../../utils/seoData';

/**
 * Route-level SEO defaults
 * Ensures a deterministic title/description/canonical is present immediately
 * based on the current pathname so crawlers and early renders see metadata.
 */
const RouteSEO = () => {
  const { pathname } = useLocation();

  const seoInfo = useMemo(() => {
    // Exact matches
    if (pathname === '/' || pathname === '') return seoData.home || {};
    if (pathname.startsWith('/pacotes')) return seoData.pacotes || {};
    if (pathname.startsWith('/destinos')) return seoData.destinos || {};
    if (pathname.startsWith('/contato')) return seoData.contato || {};
    if (pathname.startsWith('/blog')) return seoData.blog || {};
    if (pathname.startsWith('/avaliacoes')) return seoData.avaliacoes || {};
    if (pathname.startsWith('/reservas')) return seoData.reservas || {};
    if (pathname.startsWith('/politica')) return seoData.politica || {};

    // Categories: /categoria/:slug
    if (pathname.startsWith('/categoria')) {
      const parts = pathname.split('/').filter(Boolean);
      const slug = parts[1] || 'passeio';
      return (seoData.categorias && seoData.categorias[slug]) || {
        title: `${slug} - Transfer Fortaleza Tur`,
        description: '',
        canonical: pathname
      };
    }

    // Fallback: create sane defaults
    return {
      title: `${seoData.home?.title || 'Transfer Fortaleza Tur'}`,
      description: seoData.home?.description || '',
      canonical: pathname
    };
  }, [pathname]);

  // Immediate DOM fallback: write title and meta description synchronously
  useEffect(() => {
    try {
      const title = seoInfo.title || '';
      const description = seoInfo.description || '';
      if (title) {
        const safeTitle = title.includes('Transfer Fortaleza Tur') ? title : `${title} | Transfer Fortaleza Tur`;
        document.title = safeTitle;
      }

      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      if (description) meta.setAttribute('content', description);
    } catch (e) {
      // noop
    }
  }, [seoInfo]);

  // Ensure canonical is absolute when provided by seoData
  const canonical = seoInfo.canonical && seoInfo.canonical.startsWith('http')
    ? seoInfo.canonical
    : seoInfo.canonical || pathname;

  return (
    <SEOHelmet
      title={seoInfo.title}
      description={seoInfo.description}
      canonical={canonical}
    />
  );
};

export default RouteSEO;
