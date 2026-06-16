/**
 * API Endpoint para Indexação SEO
 * Recebe requisições do frontend e delega para o serviço de indexação
 * 
 * Este endpoint atua como proxy, evitando expor credenciais do Google no frontend
 * 
 * Actions:
 * - created: Indexa novo pacote
 * - updated: Indexa pacote atualizado
 * - deleted: Notifica remoção de pacote
 */

const seoIndexingService = require('../src/services/seoIndexingService');

export default async function handler(req, res) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, slug } = req.body;

  // Validar parâmetros
  if (!action || !slug) {
    return res.status(400).json({ 
      error: 'Missing required parameters: action and slug' 
    });
  }

  // Validar action
  const validActions = ['created', 'updated', 'deleted'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ 
      error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
    });
  }

  try {
    console.log(`[SEO Indexing API] Recebido: ${action} - ${slug}`);

    let result;
    
    switch (action) {
      case 'created':
        result = await seoIndexingService.indexPacoteCreated(slug);
        break;
      case 'updated':
        result = await seoIndexingService.indexPacoteUpdated(slug);
        break;
      case 'deleted':
        result = await seoIndexingService.indexPacoteDeleted(slug);
        break;
      default:
        throw new Error('Invalid action');
    }

    if (result) {
      res.status(200).json({ 
        success: true, 
        message: `Indexação solicitada com sucesso: ${action}` 
      });
    } else {
      // Se falhar, retorna sucesso anyway para não quebrar o fluxo
      // O erro já foi logado no serviço
      res.status(200).json({ 
        success: true, 
        message: `Indexação falhou silenciosamente (ver logs): ${action}`,
        warning: 'Indexing failed but operation continued'
      });
    }

  } catch (error) {
    console.error('[SEO Indexing API] Erro:', error);
    
    // Não retorna erro para não quebrar o fluxo principal
    // A indexação é um "nice to have", não crítico
    res.status(200).json({ 
      success: true, 
      message: 'Indexação falhou mas operação continuou',
      warning: error.message
    });
  }
}
