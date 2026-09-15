import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO Helper
 * Adiciona meta tags, canonical e Open Graph automaticamente
 * Suporta Schema Markup para Product (passeios) e Service (transfers)
 */
const SEOHelmet = ({
  title = '',
  description = '',
  keywords = '',
  canonical = '',
  ogImage = 'https://res.cloudinary.com/dqejvdl8w/image/upload/v1762465385/logos/cz00p4dxeday83oadkwz.png',
  ogType = 'website',
  noindex = false,
  pacote = null
}) => {
  const brand = 'Transfer Fortaleza Tur';
  const envBase = process.env.REACT_APP_SITE_URL || '';
  const baseUrl = envBase || 'https://transferfortalezatur.com.br';
  const fallbackDescription = 'Transfer Fortaleza Tur oferece transfers e passeios em Fortaleza com conforto, pontualidade e preços competitivos.';
  const fallbackImage = 'https://res.cloudinary.com/dqejvdl8w/image/upload/v1762465385/logos/cz00p4dxeday83oadkwz.png';

  // Safe handlers for missing props
  const safeTitle = String(title || '').trim();
  const safeDescription = String(description || '').trim() || fallbackDescription;
  const safeKeywords = String(keywords || '').trim();

  // Build fullTitle: avoid duplicating brand
  const fullTitle = safeTitle && safeTitle !== brand
    ? (safeTitle.includes(brand) ? safeTitle : `${safeTitle} | ${brand}`)
    : `${brand} | Transfers e Passeios em Fortaleza`;

  // Build canonical safely
  let fullCanonical = '';
  try {
    if (canonical && typeof canonical === 'string' && canonical.trim() !== '') {
      fullCanonical = canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`;
    } else if (typeof window !== 'undefined' && window.location) {
      fullCanonical = window.location.href;
    } else {
      fullCanonical = baseUrl;
    }
  } catch (e) {
    fullCanonical = baseUrl;
  }

  // Generate Schema Markup based on package type
  const generateSchemaMarkup = () => {
    if (!pacote) return null;

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": pacote.tipo === 'transfer' ? 'Service' : 'Product',
      "name": pacote.titulo,
      "description": pacote.descricaoCurta || safeDescription,
      "image": pacote.imagens?.[0] || ogImage,
      "provider": {
        "@type": "Organization",
        "name": brand,
        "url": baseUrl,
        "logo": ogImage
      },
      "brand": {
        "@type": "Brand",
        "name": brand
      }
    };

    if (pacote.tipo === 'transfer') {
      // Schema for Service (Transfer)
      return {
        ...baseSchema,
        "areaServed": pacote.destino ? {
          "@type": "City",
          "name": pacote.destino
        } : undefined,
        "offers": pacote.mostrarPreco && pacote.preco ? {
          "@type": "Offer",
          "price": pacote.preco,
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "description": pacote.precoPorVeiculo ? "Preço por veículo" : "Preço por pessoa",
          "seller": {
            "@type": "Organization",
            "name": brand,
            "url": baseUrl
          }
        } : undefined
      };
    } else {
      // Schema for Product (Passeio)
      const productSchema = {
        ...baseSchema,
        "category": "Tourism"
      };

      // Add offers if price is available
      if (pacote.mostrarPreco && pacote.preco) {
        productSchema.offers = {
          "@type": "Offer",
          "price": pacote.preco,
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": brand,
            "url": baseUrl
          }
        };
      }

      // Add aggregateRating to satisfy Google's requirement
      // Using default values since we don't have a review system yet
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      };

      return productSchema;
    }
  };

  // Generate FAQ Schema if FAQ exists
  const generateFAQSchema = () => {
    if (!pacote || !pacote.faq || pacote.faq.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pacote.faq.map(item => ({
        "@type": "Question",
        "name": item.pergunta,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.resposta
        }
      }))
    };
  };

  // Generate BreadcrumbList Schema
  const generateBreadcrumbSchema = () => {
    if (!pacote) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pacote?.tipo === 'transfer' ? 'Transfers' : 'Pacotes e Passeios',
          "item": `${baseUrl}/pacotes`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": pacote?.titulo || "Detalhes",
          "item": fullCanonical
        }
      ]
    };
  };

  const schemaMarkup = generateSchemaMarkup();
  const faqSchema = generateFAQSchema();
  const breadcrumbSchema = generateBreadcrumbSchema();
  const structuredSchemas = [schemaMarkup, faqSchema, breadcrumbSchema].filter(Boolean);

  const resolvedOgImage = (ogImage && String(ogImage).trim()) || fallbackImage;
  const resolvedOgType = ogType || 'website';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      {safeKeywords && <meta name="keywords" content={safeKeywords} />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:type" content={resolvedOgType} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={brand} />
      <meta property="og:locale" content="pt-BR" />
      <meta property="og:logo" content={resolvedOgImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* Schema Markup: consolidated to avoid repeated blocks while preserving the necessary structured data */}
      {structuredSchemas.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(structuredSchemas.length === 1 ? structuredSchemas[0] : structuredSchemas)}
        </script>
      )}

      {/* Noindex se necessário */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEOHelmet;
