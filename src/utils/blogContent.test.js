import { isMarkdownContent, renderBlogContent, normalizeBlogContentHeadings } from './blogContent';

describe('blogContent helpers', () => {
  it('detecta markdown em textos comuns', () => {
    expect(isMarkdownContent('# Título\n\n- item 1')).toBe(true);
    expect(isMarkdownContent('<h1>Título</h1><p>conteúdo</p>')).toBe(false);
  });

  it('mantém conteúdo HTML legado sem quebrar a renderização', () => {
    const html = '<h2>História</h2><p>Texto antigo</p>';
    expect(renderBlogContent(html)).toBe(html);
  });

  it('rebaixa H1 do conteúdo do post sem alterar outros níveis', () => {
    expect(normalizeBlogContentHeadings('# Como chegar em Cumbuco?\n\n## Onde fica?'))
      .toBe('## Como chegar em Cumbuco?\n\n## Onde fica?');
    expect(normalizeBlogContentHeadings('<h1><strong>Meu post</strong></h1><h2>Conteúdo</h2>'))
      .toBe('<h2><strong>Meu post</strong></h2><h2>Conteúdo</h2>');
  });
});
