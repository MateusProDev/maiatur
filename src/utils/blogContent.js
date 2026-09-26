export const isMarkdownContent = (content = '') => {
  const text = String(content || '').trim();

  if (!text) {
    return false;
  }

  if (/<[a-z][\s\S]*>/i.test(text)) {
    return false;
  }

  return /(^|\n)\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\*\*|__|\[.*\]\(.*\)|```)/m.test(text);
};

export const renderBlogContent = (content = '') => {
  const text = String(content || '').trim();

  if (!text) {
    return '';
  }

  return isMarkdownContent(text) ? text : text;
};

export const normalizeBlogContentHeadings = (content = '') => {
  const text = String(content || '');
  return text
    .replace(/^(\s{0,3})#(?=\s)/gm, '$1##')
    .replace(/<h1(\b[^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1\s*>/gi, '</h2>');
};
