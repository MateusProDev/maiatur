// Script temporário para verificar posts do blog
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const checkBlogPosts = async () => {
  try {
    console.log('🔍 Verificando posts do blog...');
    const postsRef = collection(db, 'blogPosts');
    const snapshot = await getDocs(postsRef);
    
    console.log(`📊 Total de posts: ${snapshot.docs.length}`);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('📝 Post:', {
        id: doc.id,
        title: data.title,
        published: data.published,
        views: data.views || 0,
        hasPublishedAt: !!data.publishedAt
      });
    });
    
    const publishedPosts = snapshot.docs.filter(doc => doc.data().published === true);
    console.log(`✅ Posts publicados: ${publishedPosts.length}`);
    
    return {
      total: snapshot.docs.length,
      published: publishedPosts.length,
      posts: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (error) {
    console.error('❌ Erro ao verificar posts:', error);
    return null;
  }
};
