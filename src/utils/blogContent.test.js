import { isMarkdownContent, renderBlogContent, removeDuplicateBlogTitleHeading } from './blogContent';

describe('blogContent helpers', () => {
  it('detecta markdown em textos comuns', () => {
    expect(isMarkdownContent('# Título\n\n- item 1')).toBe(true);
    expect(isMarkdownContent('<h1>Título</h1><p>conteúdo</p>')).toBe(false);
  });

  it('mantém conteúdo HTML legado sem quebrar a renderização', () => {
    const html = '<h2>História</h2><p>Texto antigo</p>';
    expect(renderBlogContent(html)).toBe(html);
  });

  it('remove somente o H1 inicial que repete o título do post', () => {
    expect(removeDuplicateBlogTitleHeading('# Como chegar em Cumbuco?\n\nConteúdo', 'Como chegar em Cumbuco?'))
      .toBe('Conteúdo');
    expect(removeDuplicateBlogTitleHeading('<h1><strong>Meu post</strong></h1><p>Conteúdo</p>', 'Meu post'))
      .toBe('<p>Conteúdo</p>');
    expect(removeDuplicateBlogTitleHeading('## Outro título\n\nConteúdo', 'Meu post'))
      .toBe('## Outro título\n\nConteúdo');
  });
});
