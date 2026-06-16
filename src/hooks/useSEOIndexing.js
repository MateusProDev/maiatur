/**
 * Hook personalizado para indexação automática de SEO
 * Integra com o serviço de indexação para solicitar indexação
 * quando pacotes são criados, editados ou removidos
 * 
 * Uso:
 * const { indexPacoteCreated, indexPacoteUpdated, indexPacoteDeleted } = useSEOIndexing();
 * 
 * Após criar/editar/remover um pacote:
 * await indexPacoteCreated(slug);
 */

import { useState, useCallback } from 'react';

/**
 * Hook para indexação automática de SEO
 */
export const useSEOIndexing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Solicita indexação via API endpoint
   * Isso evita expor credenciais do Google no frontend
   */
  const requestIndexing = useCallback(async (action, slug) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/seo-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          slug
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        console.log(`[SEO Indexing] ✅ ${action}: ${slug}`);
        return true;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error(`[SEO Indexing] ❌ Erro ao solicitar ${action}:`, err);
      setError(err.message);
      // Não lançar erro para não quebrar o fluxo principal
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Indexa um novo pacote (criação)
   */
  const indexPacoteCreated = useCallback(async (slug) => {
    return await requestIndexing('created', slug);
  }, [requestIndexing]);

  /**
   * Indexa um pacote atualizado (edição)
   */
  const indexPacoteUpdated = useCallback(async (slug) => {
    return await requestIndexing('updated', slug);
  }, [requestIndexing]);

  /**
   * Notifica remoção de um pacote
   */
  const indexPacoteDeleted = useCallback(async (slug) => {
    return await requestIndexing('deleted', slug);
  }, [requestIndexing]);

  return {
    indexPacoteCreated,
    indexPacoteUpdated,
    indexPacoteDeleted,
    loading,
    error,
    success,
    resetSuccess: () => setSuccess(false)
  };
};
