import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'avaliacoes';

class AvaliacoesService {
  async criarAvaliacao(avaliacaoData) {
    try {
      if (!avaliacaoData.nota || !avaliacaoData.comentario || !avaliacaoData.nomeUsuario) {
        throw new Error('Dados obrigatórios não fornecidos (nota, comentário e nome)');
      }

      if (avaliacaoData.nota < 1 || avaliacaoData.nota > 5) {
        throw new Error('Nota deve estar entre 1 e 5');
      }

      const novaAvaliacao = {
        nota: Number(avaliacaoData.nota),
        comentario: avaliacaoData.comentario.trim(),
        nomeUsuario: avaliacaoData.nomeUsuario.trim(),
        userId: avaliacaoData.userId || null,
        emailUsuario: avaliacaoData.emailUsuario || null,
        avatarUsuario: avaliacaoData.avatarUsuario || null,
        status: avaliacaoData.status || 'aprovada',
        likes: 0,
        denuncias: 0,
        verificado: avaliacaoData.verificado || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), novaAvaliacao);
      return { id: docRef.id, ...novaAvaliacao };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  }

  async getAvaliacoes(options = {}) {
    try {
      const {
        limit: pageLimit = 6,
        filtroNota,
        status = 'aprovada',
        orderBy: orderByField = 'createdAt',
        direction = 'desc'
      } = options;

      const baseFilters = [collection(db, COLLECTION_NAME), where('status', '==', status)];
      if (filtroNota && filtroNota >= 1 && filtroNota <= 5) {
        baseFilters.push(where('nota', '==', filtroNota));
      }

      const dir = (direction && direction.toLowerCase() === 'asc') ? 'asc' : 'desc';

      // Server-side ordering only when ordering by createdAt (avoids composite index requirement)
      if (orderByField === 'createdAt') {
        const q = query(...baseFilters, orderBy('createdAt', dir), limit(pageLimit));
        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (err) {
          console.warn('getAvaliacoes: server query failed, falling back to createdAt desc:', err && err.message ? err.message : err);
          const fallbackQ = query(collection(db, COLLECTION_NAME), where('status', '==', status), orderBy('createdAt', 'desc'), limit(pageLimit));
          snapshot = await getDocs(fallbackQ);
        }

        const avaliacoes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const countQ = query(collection(db, COLLECTION_NAME), where('status', '==', status));
        const countSnap = await getCountFromServer(countQ);
        const total = countSnap.data().count;
        return { avaliacoes, total };
      }

      // Client-side ordering for other fields (small collections)
      const qNoOrder = query(...baseFilters);
      const snapshotNoOrder = await getDocs(qNoOrder);
      const avaliacoesAll = snapshotNoOrder.docs.map(d => ({ id: d.id, ...d.data() }));

      const multiplier = dir === 'asc' ? 1 : -1;
      const getTime = (item) => {
        const ts = item.createdAt;
        if (!ts) return 0;
        if (ts.seconds) return ts.seconds * 1000;
        if (ts instanceof Date) return ts.getTime();
        if (typeof ts === 'number') return ts;
        if (typeof ts === 'string') return new Date(ts).getTime() || 0;
        return 0;
      };

      avaliacoesAll.sort((a, b) => {
        const va = a[orderByField];
        const vb = b[orderByField];
        if (va === vb) return getTime(b) - getTime(a); // createdAt desc
        if (va == null) return 1 * multiplier;
        if (vb == null) return -1 * multiplier;
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * multiplier;
        return (va > vb ? 1 : -1) * multiplier;
      });

      const avaliacoes = avaliacoesAll.slice(0, pageLimit);
      const countQ = query(collection(db, COLLECTION_NAME), where('status', '==', status));
      const countSnap = await getCountFromServer(countQ);
      const total = countSnap.data().count;
      return { avaliacoes, total };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw error;
    }
  }

  subscribeAvaliacoes(options = {}, callback) {
    try {
      const {
        limit: pageLimit = 6,
        filtroNota,
        status = 'aprovada',
        orderBy: orderByField = 'createdAt',
        direction = 'desc'
      } = options;

      const dir = (direction && direction.toLowerCase() === 'asc') ? 'asc' : 'desc';

      // Build base query
      let q = collection(db, COLLECTION_NAME);
      q = query(q, where('status', '==', status));
      if (filtroNota && filtroNota >= 1 && filtroNota <= 5) {
        q = query(q, where('nota', '==', filtroNota));
      }

      if (orderByField === 'createdAt') {
        q = query(q, orderBy('createdAt', dir));
      } else {
        // order by createdAt on server and sort client-side for the requested field
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (pageLimit) q = query(q, limit(pageLimit));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          let avaliacoes = items;
          if (orderByField !== 'createdAt') {
            const multiplier = dir === 'asc' ? 1 : -1;
            const getTime = (item) => {
              const ts = item.createdAt;
              if (!ts) return 0;
              if (ts.seconds) return ts.seconds * 1000;
              if (ts instanceof Date) return ts.getTime();
              if (typeof ts === 'number') return ts;
              if (typeof ts === 'string') return new Date(ts).getTime() || 0;
              return 0;
            };

            avaliacoes = items.sort((a, b) => {
              const va = a[orderByField];
              const vb = b[orderByField];
              if (va === vb) return getTime(b) - getTime(a);
              if (va == null) return 1 * multiplier;
              if (vb == null) return -1 * multiplier;
              if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * multiplier;
              return (va > vb ? 1 : -1) * multiplier;
            });
          }

          // Try to get total count
          let total = items.length;
          try {
            const countQ = query(collection(db, COLLECTION_NAME), where('status', '==', status));
            const countSnap = await getCountFromServer(countQ);
            total = countSnap.data().count;
          } catch (err) {
            // ignore count errors
          }

          callback({ avaliacoes, total, snapshot });
        } catch (err) {
          console.error('subscribeAvaliacoes onSnapshot handler error', err);
          callback({ avaliacoes: [], total: 0, snapshot: null, error: err });
        }
      }, (err) => {
        console.error('subscribeAvaliacoes onSnapshot error', err);
        callback({ avaliacoes: [], total: 0, snapshot: null, error: err });
      });

      return unsubscribe;
    } catch (error) {
      console.error('subscribeAvaliacoes error', error);
      // Return a no-op unsubscribe
      return () => {};
    }
  }

  async getEstatisticas() {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'aprovada'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { media: 0, total: 0, distribuicao: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
      }

      const avaliacoes = snapshot.docs.map(d => d.data());
      const total = avaliacoes.length;
      const distribuicao = avaliacoes.reduce((acc, a) => {
        const nota = Math.round(a.nota) || 0;
        acc[nota] = (acc[nota] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      const soma = avaliacoes.reduce((s, a) => s + (a.nota || 0), 0);
      const media = total ? Math.round((soma / total) * 10) / 10 : 0;
      return { media, total, distribuicao };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const avaliacoesService = new AvaliacoesService();