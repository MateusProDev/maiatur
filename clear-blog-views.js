// Utilitário para limpar histórico de visualizações do blog
// Execute no console do navegador

function clearBlogViewsHistory() {
  let count = 0;
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('blog_post_viewed_')) {
      localStorage.removeItem(key);
      count++;
    }
  });
  
  console.log(`✅ ${count} visualizações de posts removidas do histórico`);
  console.log('Agora você pode visualizar os posts novamente e as views serão contabilizadas!');
}

// Execute a função
clearBlogViewsHistory();
