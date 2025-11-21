/**
 * Metadados SEO para todas as páginas do site
 * Centraliza títulos, descrições e canonical URLs
 */

interface SeoPageData {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
}

interface SeoData {
  home: SeoPageData;
  sobre: SeoPageData;
  pacotes: SeoPageData;
  destinos: SeoPageData;
  contato: SeoPageData;
  blog: SeoPageData;
  avaliacoes: SeoPageData;
  reservas: SeoPageData;
  politica: SeoPageData;
  categorias: {
    passeio: SeoPageData;
    transfer: SeoPageData;
    'beach-park': SeoPageData;
  };
}

export const seoData: SeoData = {
  home: {
    title: 'Home - Transfer Fortaleza Tur',
    description: 'Transfers e passeios em Fortaleza: transfers do aeroporto, passeios turísticos e pacotes para Beach Park, Jericoacoara e Cumbuco. Reserve online com segurança e conforto.',
    canonical: '/'
  },
  
  sobre: {
    title: 'Sobre a Transfer Fortaleza Tur - Nossa História e Missão',
    description: 'Conheça a Transfer Fortaleza Tur: missão, valores e nossa história levando clientes aos melhores destinos do Ceará com segurança e conforto.',
    canonical: '/sobre',
    noindex: true
  },
  
  pacotes: {
    title: 'Nossos Pacotes - Transfer Fortaleza Tur',
    description: 'Descubra nossos pacotes de passeios e transfers em Fortaleza e região. Beach Park, Canoa Quebrada, Jericoacoara e muito mais!',
    canonical: '/pacotes',
    noindex: true
  },
  
  destinos: {
    title: 'Nossos Destinos - Transfer Fortaleza Tur',
    description: 'Explore os melhores destinos turísticos do Ceará: praias paradisíacas, dunas, lagoas e muito mais. Planeje sua viagem com a gente!',
    canonical: '/destinos',
    noindex: true
  },
  
  contato: {
    title: 'Fale Conosco - Transfer Fortaleza Tur',
    description: 'Fale conosco via WhatsApp, telefone ou e‑mail. Tire dúvidas, solicite orçamentos e reserve transfers e passeios com atendimento rápido e personalizado.',
    canonical: '/contato',
    noindex: true
  },
  
  blog: {
    title: 'Blog de Viagens - Transfer Fortaleza Tur',
    description: 'Artigos e dicas de viagem sobre os melhores destinos do Ceará. Guias e inspirações para planejar sua próxima viagem.',
    canonical: '/blog'
  },
  
  avaliacoes: {
    title: 'Depoimentos e Avaliações Reais dos Nossos Clientes - Transfer Fortaleza Tur',
    description: 'Confira avaliações e depoimentos de clientes sobre nossos transfers e passeios. Experiências reais que ajudam você a escolher com confiança.',
    canonical: '/avaliacoes',
    noindex: true
  },
  
  reservas: {
    title: 'Faça Sua Reserva de Transfer ou Passeio Online - Transfer Fortaleza Tur',
    description: 'Reserve seu transfer ou passeio em Fortaleza. Processo simples, pagamento seguro e confirmação rápida para garantir sua viagem.',
    canonical: '/reservas',
    noindex: true
  },
  politica: {
    title: 'Política de Reservas - Transfer Fortaleza Tur',
    description: 'Regras de reservas, cancelamento e pagamento da Transfer Fortaleza Tur. Transparência e informações claras para sua viagem.',
    canonical: '/politica',
    noindex: true
  },
  
  categorias: {
    passeio: {
      title: 'Passeios Turísticos Privativos em Fortaleza e Região - Transfer Fortaleza Tur',
      description: 'Pacotes de passeios em Fortaleza e região: roteiros privativos para Beach Park, Jericoacocha, Cumbuco, Paracuru e muito mais. Inclui transfer e guia local.',
      canonical: '/categoria/passeio',
      noindex: true
    },
    transfer: {
      title: 'Transfers e Traslados Privativos em Fortaleza - Transfer Fortaleza Tur',
      description: 'Transfers e traslados em Fortaleza: serviços privados do aeroporto, translados para praias e passeios com conforto e pontualidade.',
      canonical: '/categoria/transfer',
      noindex: true
    },
    'beach-park': {
      title: 'Passeios Completos para Beach Park com Transfer Incluso - Transfer Fortaleza Tur',
      description: 'Passeios para o Beach Park (Porto das Dunas) com transfer incluso. Translado confortável e ingressos em pacotes práticos para famílias.',
      canonical: '/categoria/beach-park',
      noindex: true
    }
  }
};

export default seoData;
