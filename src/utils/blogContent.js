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
