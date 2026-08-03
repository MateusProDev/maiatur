import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import SEOHelmet from '../../components/SEOHelmet/SEOHelmet';
import { useWhatsAppNumber } from '../../hooks/useWhatsAppNumber';
import TransferDetailContent from './TransferDetailContent';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { phoneNumber: whatsappNumber, loading: whatsappLoading } = useWhatsAppNumber();
  const navigate = useNavigate();

  const formatPacoteData = useCallback((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      descricaoCurta: data.descricaoCurta || '',
      preco: parseFloat(data.preco) || 0,
      precoOriginal: data.precoOriginal ? parseFloat(data.precoOriginal) : null,
      mostrarPreco: data.mostrarPreco === true,
      imagens: Array.isArray(data.imagens) ? data.imagens : [],
      slug: data.slug || pacoteSlug,
      destaque: data.destaque || false,
      tipo: data.tipo || 'passeio', // Default to 'passeio' for backward compatibility
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      // Campos específicos para transfer
      destino: data.destino || null,
      tempoPercurso: data.tempoPercurso || null,
      distancia: data.distancia || null,
      precoPorVeiculo: data.precoPorVeiculo || false,
      veiculos: Array.isArray(data.veiculos) ? data.veiculos : [],
      locaisAtendidos: Array.isArray(data.locaisAtendidos) ? data.locaisAtendidos : [],
      comodidades: Array.isArray(data.comodidades) ? data.comodidades : [],
      vantagens: Array.isArray(data.vantagens) ? data.vantagens : [],
      passosReserva: Array.isArray(data.passosReserva) ? data.passosReserva : [],
      faq: Array.isArray(data.faq) ? data.faq : [],
      localizacao: data.localizacao || null,
      // Campo para passeios
      destaques: Array.isArray(data.destaques) ? data.destaques : []
    };
  }, [pacoteSlug]);

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // DEBUG: Limpar cache temporariamente para forçar busca fresca
        const cacheKey = `pacote_${pacoteSlug}`;
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(`${cacheKey}_time`);
        console.log('�️ Cache limpo para debug');
        
        // Buscar do Firestore (sem cache por enquanto)
        const pacotesRef = collection(db, 'pacotes');
        const q = query(pacotesRef, where("slug", "==", pacoteSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const pacoteData = formatPacoteData(doc);
          console.log('📦 Pacote carregado:', pacoteData);
          console.log('📦 Tipo do pacote:', pacoteData.tipo);
          console.log('📦 Tem campos de transfer:', {
            destino: pacoteData.destino,
            veiculos: pacoteData.veiculos?.length,
            vantagens: pacoteData.vantagens?.length
          });
          setPacote(pacoteData);
          
          // Salvar no cache
          localStorage.setItem(cacheKey, JSON.stringify(pacoteData));
          localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          return;
        }
        
        setError("Pacote não encontrado");
      } catch (err) {
        console.error("Erro ao buscar pacote:", err);
        setError("Erro ao carregar pacote. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacote();
  }, [pacoteSlug, formatPacoteData]);

  // Removed unused handleAccordionChange

  const handleReserveWhatsApp = (customMessage = null) => {
    if (whatsappLoading) return;
    const message = customMessage || `Olá! Tenho interesse no pacote de viagem "${pacote.titulo}". Poderia me passar mais informações?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pacote.titulo,
          text: pacote.descricaoCurta,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você pode adicionar lógica para salvar no localStorage ou backend
  };

  // Renderização unificada para ambos os tipos
  const renderContent = () => {
    return (
      <TransferDetailContent
        pacote={pacote}
        onWhatsApp={handleReserveWhatsApp}
        whatsappLoading={whatsappLoading}
        onBack={() => navigate(-1)}
        onShare={handleShare}
        onFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    );
  };

  if (loading || whatsappLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner size="large" text="Carregando detalhes do pacote..." fullScreen={true} />
        <Footer />
      </>
    );
  }

  if (error || !pacote) {
    return (
      <>
        <Header />
        <div className="pdp-error-container">
          <div className="pdp-error-content">
            <h1>😕 Ops! Pacote não encontrado</h1>
            <p>{error || 'O pacote que você está procurando não existe ou foi removido.'}</p>
            <button onClick={() => navigate('/pacotes')} className="pdp-btn-back-home">
              <FiArrowLeft /> Voltar para Pacotes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHelmet
        title={`${pacote.titulo} - ${pacote.tipo === 'transfer' ? 'Transfers' : 'Pacotes e Passeios'}`}
        description={pacote.descricaoCurta || pacote.descricao?.substring(0, 160)}
        canonical={`/pacotes/${pacoteSlug}`}
        ogImage={pacote.imagemPrincipal || pacote.imagens?.[0]}
        ogType={pacote.tipo === 'transfer' ? 'service' : 'product'}
        pacote={pacote}
      />
      <Header />
      <div className="pdp-modern-container">
        {renderContent()}
      </div>
      <Footer />
    </>
  );
};

export default PacoteDetailPage;
