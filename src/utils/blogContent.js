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

const normalizeHeadingText = (text = '') => String(text)
  .replace(/<[^>]*>/g, '')
  .replace(/&amp;/gi, '&')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const removeDuplicateBlogTitleHeading = (content = '', title = '') => {
  const text = String(content || '');
  const normalizedTitle = normalizeHeadingText(title);
  if (!text || !normalizedTitle) return text;

  const markdownHeading = text.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
  if (markdownHeading && normalizeHeadingText(markdownHeading[1]) === normalizedTitle) {
    return text.slice(markdownHeading[0].length).replace(/^\s+/, '');
  }

  const htmlHeading = text.match(/^\s*<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i);
  if (htmlHeading && normalizeHeadingText(htmlHeading[1]) === normalizedTitle) {
    return text.slice(htmlHeading[0].length).replace(/^\s+/, '');
  }

  return text;
};
