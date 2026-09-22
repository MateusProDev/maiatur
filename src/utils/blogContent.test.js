import { isMarkdownContent, renderBlogContent } from './blogContent';

describe('blogContent helpers', () => {
  it('detecta markdown em textos comuns', () => {
    expect(isMarkdownContent('# Título\n\n- item 1')).toBe(true);
    expect(isMarkdownContent('<h1>Título</h1><p>conteúdo</p>')).toBe(false);
  });

  it('mantém conteúdo HTML legado sem quebrar a renderização', () => {
    const html = '<h2>História</h2><p>Texto antigo</p>';
    expect(renderBlogContent(html)).toBe(html);
  });
});
