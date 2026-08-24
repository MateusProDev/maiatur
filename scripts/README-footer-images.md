# Adição de Imagens no Footer

## Alterações Realizadas

Adicionei suporte para 2 novas imagens abaixo da imagem CADASTUR no footer:

1. **CAD.png** - Já adicionada (arquivo existe em `src/assets/CAD.png`)
2. **SEGURACA.png** - Adicionada com link clicável (arquivo existe em `src/assets/SEGURACA.png`)

## Arquivos Modificados

1. **src/components/Footer/Footer.jsx**
   - Adicionada a imagem CAD.png
   - Adicionada a imagem SEGURACA.png com link clicável
   - Texto "Clique para conferir" abaixo da imagem SEGURACA

2. **src/components/Footer/FooterUltraModern.module.css**
   - Adicionados estilos para `.cad-img`
   - Adicionados estilos para `.seguraca-link` (link clicável)
   - Adicionados estilos para `.seguraca-img` (imagem)
   - Adicionados estilos para `.seguraca-text` (texto "Clique para conferir")
   - Responsividade ajustada para as novas imagens

## Funcionalidade da Imagem SEGURACA.png

A imagem SEGURACA.png agora:

- **É clicável**: Ao clicar, abre o link do Google Safe Browsing
- **Link**: `https://transparencyreport.google.com/safe-browsing/search?url=transferfortalezatur.com.br&hl=pt_BR`
- **Texto incentivador**: "Clique para conferir" aparece abaixo da imagem
- **Efeitos visuais**:
  - Hover com elevação (translateY)
  - Opacidade muda no hover
  - Texto fica mais brilhante no hover
  - Transições suaves

## Estrutura Final das Imagens no Footer

A ordem das imagens é:
1. CADASTUR.png (já existente)
2. CAD.png (já adicionada)
3. SEGURACA.png (adicionada com link clicável)
4. Tripadviser.jpg (já existente)

## Estilos

### Imagens CAD.png e SEGURACA.png
- Altura de 80px em desktop
- Largura responsiva em mobile
- Borda arredondada de 8px
- Transições suaves
- Alinhamento centralizado

### Link SEGURACA
- Estrutura flexbox vertical
- Imagem acima do texto
- Texto "Clique para conferir" em branco com opacidade
- Hover effects:
  - Elevação de 3px
  - Opacidade aumenta
  - Texto fica totalmente branco

### Responsividade
- Mobile: Fonte do texto reduzida para 11px
- Desktop: Fonte do texto em 12px
- Imagens se ajustam automaticamente ao container
