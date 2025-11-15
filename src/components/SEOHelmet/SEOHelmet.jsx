import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO Helper
 * Adiciona meta tags, canonical e Open Graph automaticamente
 */
const SEOHelmet = ({
  title,
  description,
  canonical,
  ogImage = 'https://res.cloudinary.com/dqejvdl8w/image/upload/v1762465385/logos/cz00p4dxeday83oadkwz.png',
  ogType = 'website',
  noindex = false
}) => {
  const baseUrl = 'https://transferfortalezatur.com.br';
  const fullCanonical = canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`;
  const fullTitle = title.includes('Transfer Fortaleza Tur') ? title : `${title} | Transfer Fortaleza Tur`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Transfer Fortaleza Tur" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Noindex se necessário */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEOHelmet;
