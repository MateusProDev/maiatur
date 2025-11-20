import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO Helper
 * Adiciona meta tags, canonical e Open Graph automaticamente
 * Tornado mais resiliente: usa `REACT_APP_SITE_URL` se disponível
 */
const SEOHelmet = ({
  title = '',
  description = '',
  canonical = '',
  ogImage = 'https://res.cloudinary.com/dqejvdl8w/image/upload/v1762465385/logos/cz00p4dxeday83oadkwz.png',
  ogType = 'website',
  noindex = false
}) => {
  const brand = 'Transfer Fortaleza Tur';
  const envBase = process.env.REACT_APP_SITE_URL || '';
  const baseUrl = envBase || 'https://transferfortalezatur.com.br';

  // Safe handlers for missing props
  const safeTitle = String(title || '').trim();
  const safeDescription = String(description || '').trim();

  // Build fullTitle: avoid duplicating brand
  const fullTitle = safeTitle
    ? (safeTitle.includes(brand) ? safeTitle : `${safeTitle} | ${brand}`)
    : brand;

  // Build canonical safely
  let fullCanonical = '';
  try {
    if (canonical && typeof canonical === 'string') {
      fullCanonical = canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`;
    } else if (typeof window !== 'undefined' && window.location) {
      fullCanonical = window.location.href;
    } else {
      fullCanonical = baseUrl;
    }
  } catch (e) {
    fullCanonical = baseUrl;
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {safeDescription && <meta name="description" content={safeDescription} />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {safeDescription && <meta property="og:description" content={safeDescription} />}
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content={brand} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {safeDescription && <meta name="twitter:description" content={safeDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Noindex se necessário */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEOHelmet;
