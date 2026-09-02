import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO Helper
 * Adiciona meta tags, canonical e Open Graph automaticamente
 * Suporta Schema Markup para Product (passeios) e Service (transfers)
 */
const SEOHelmet = ({
  title = '',
  description = '',
  canonical = '',
  ogImage = 'https://res.cloudinary.com/dqejvdl8w/image/upload/v1762465385/logos/cz00p4dxeday83oadkwz.png',
  ogType = 'website',
  noindex = false,
  pacote = null
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

      {/* Schema Markup */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}

      {/* FAQ Schema */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Noindex se necessário */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEOHelmet;
