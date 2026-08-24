# Adição de Imagens no Footer

## Alterações Realizadas

Adicionei suporte para 2 novas imagens no footer com reorganização da ordem:

1. **Tripadviser.jpg** - Já existente (movida para o topo)
2. **CADASTUR.png** - Já existente (abaixo do TripAdvisor)
3. **SEGURACA.png** - Adicionada com link clicável (abaixo do CADASTUR)
4. **CAD.png** - Removida (não está mais no footer)

## Arquivos Modificados

1. **src/components/Footer/Footer.jsx**
   - Reorganizada a ordem das imagens
   - TripAdvisor agora aparece primeiro
   - CADASTUR abaixo do TripAdvisor
   - SEGURACA abaixo do CADASTUR com link clicável
   - CAD.png removida do footer
   - Texto "Clique para conferir" abaixo da imagem SEGURACA

2. **src/components/Footer/FooterUltraModern.module.css**
   - Reduzido tamanho das imagens (de 80px para 50px)
   - TripAdvisor reduzido de 50px para 40px
   - Ajustados espaçamentos entre imagens
   - Reduzido tamanho do texto "Clique para conferir"
   - Ajustada largura máxima em desktop (de 800px para 400px)
   - Responsividade ajustada para as novas dimensões

## Funcionalidade da Imagem SEGURACA.png

A imagem SEGURACA.png:

- **É clicável**: Ao clicar, abre o link do Google Safe Browsing
- **Link**: `https://transparencyreport.google.com/safe-browsing/search?url=transferfortalezatur.com.br&hl=pt_BR`
- **Texto incentivador**: "Clique para conferir" aparece abaixo da imagem
- **Efeitos visuais**:
  - Hover com elevação sutil (translateY -2px)
  - Opacidade muda no hover
  - Texto fica mais brilhante no hover
  - Transições suaves

## Estrutura Final das Imagens no Footer

A ordem das imagens é:
1. Tripadviser.jpg (40px de altura)
2. CADASTUR.png (50px de altura)
3. SEGURACA.png (50px de altura) com link clicável e texto

## Estilos

### Dimensões das Imagens
- **TripAdvisor**: 40px de altura (desktop), responsivo (mobile)
- **CADASTUR**: 50px de altura (desktop), responsivo (mobile)
- **SEGURACA**: 50px de altura (desktop), responsivo (mobile)

### Comum a todas as imagens
- Largura responsiva em mobile
- Borda arredondada de 8px
- Transições suaves
- Alinhamento centralizado
- Object-fit: contain

### Link SEGURACA
- Estrutura flexbox vertical
- Imagem acima do texto
- Texto "Clique para conferir" em branco com opacidade
- Hover effects:
  - Elevação de 2px
  - Opacidade aumenta
  - Texto fica totalmente branco

### Responsividade
- **Mobile**: 
  - Fonte do texto: 9px
  - Imagens: 100% de largura, altura automática
  - Espaçamento reduzido
- **Desktop**: 
  - Fonte do texto: 10px
  - Imagens: máximo 400px de largura
  - Espaçamento normal

## Melhorias Visuais

- Imagens menores e mais proporcionais
- Espaçamento mais compacto entre elementos
- Melhor visualização em telas grandes
- Hierarquia visual mais clara
