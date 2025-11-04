// src/services/blogService.js
import { db } from '../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  startAfter
} from 'firebase/firestore';

/**
 * Gera um slug URL-friendly a partir de um título
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

/**
 * Busca todos os posts publicados com paginação
 */
export const getPublishedPosts = async (limitNum = 10, lastDoc = null) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    let q = query(
      postsRef,
      where('published', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(limitNum)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
};

/**
 * Busca os posts mais visualizados
 */
export const getMostViewedPosts = async (limitNum = 2) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('published', '==', true),
      orderBy('views', 'desc'),
      orderBy('publishedAt', 'desc'),
      limit(limitNum)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 getMostViewedPosts - Encontrados ${posts.length} posts publicados`);
    return posts;
  } catch (error) {
    console.error('❌ Erro ao buscar posts mais visualizados:', error);
    throw error;
  }
};

/**
 * Busca um post por slug
 */
export const getPostBySlug = async (slug) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(postsRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Erro ao buscar post por slug:', error);
    throw error;
  }
};

/**
 * Incrementa as visualizações de um post
 */
export const incrementPostViews = async (postId) => {
  try {
    console.log('📈 Tentando incrementar views para post:', postId);
    const postRef = doc(db, 'blogPosts', postId);
    
    // Verifica se o documento existe antes de atualizar
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      console.error('❌ Post não encontrado:', postId);
      return;
    }
    
    console.log('📊 Views antes:', postDoc.data().views || 0);
    
    await updateDoc(postRef, {
      views: increment(1)
    });
    
    console.log('✅ Views incrementadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao incrementar visualizações:', error);
    console.error('Detalhes:', error.message);
  }
};

/**
 * Busca posts por categoria
 */
export const getPostsByCategory = async (category, limitNum = 10) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(limitNum)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    throw error;
  }
};

/**
 * Busca posts por tag
 */
export const getPostsByTag = async (tag, limitNum = 10) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('published', '==', true),
      where('tags', 'array-contains', tag),
      orderBy('publishedAt', 'desc'),
      limit(limitNum)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar posts por tag:', error);
    throw error;
  }
};

/**
 * Busca posts relacionados (mesma categoria, excluindo o post atual)
 */
export const getRelatedPosts = async (postId, category, limitNum = 3) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(limitNum + 1)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(post => post.id !== postId)
      .slice(0, limitNum);
  } catch (error) {
    console.error('Erro ao buscar posts relacionados:', error);
    throw error;
  }
};

/**
 * Cria um novo post
 */
export const createPost = async (postData) => {
  try {
    const slug = postData.slug || generateSlug(postData.title);
    const postId = slug;

    const post = {
      ...postData,
      slug,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: postData.published ? serverTimestamp() : null
    };

    await setDoc(doc(db, 'blogPosts', postId), post);
    return { id: postId, ...post };
  } catch (error) {
    console.error('Erro ao criar post:', error);
    throw error;
  }
};

/**
 * Atualiza um post existente
 */
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    const updates = {
      ...postData,
      updatedAt: serverTimestamp()
    };

    // Se está publicando agora, adiciona publishedAt
    if (postData.published && !postData.publishedAt) {
      updates.publishedAt = serverTimestamp();
    }

    await updateDoc(postRef, updates);
    return { id: postId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    throw error;
  }
};

/**
 * Deleta um post
 */
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
};

/**
 * Busca todos os posts (para admin) com filtros
 */
export const getAllPostsAdmin = async (filters = {}) => {
  try {
    const postsRef = collection(db, 'blogPosts');
    let q = query(postsRef, orderBy('createdAt', 'desc'));

    if (filters.published !== undefined) {
      q = query(postsRef, where('published', '==', filters.published), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar todos os posts:', error);
    throw error;
  }
};

/**
 * Busca um post por ID (para admin)
 */
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return null;
    }

    return {
      id: postDoc.id,
      ...postDoc.data()
    };
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    throw error;
  }
};

/**
 * Busca todas as categorias únicas
 */
export const getAllCategories = async () => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const snapshot = await getDocs(postsRef);
    
    const categories = new Set();
    snapshot.docs.forEach(doc => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Busca todas as tags únicas
 */
export const getAllTags = async () => {
  try {
    const postsRef = collection(db, 'blogPosts');
    const snapshot = await getDocs(postsRef);
    
    const tags = new Set();
    snapshot.docs.forEach(doc => {
      const postTags = doc.data().tags || [];
      postTags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags).sort();
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    throw error;
  }
};
