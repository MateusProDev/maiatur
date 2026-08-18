# Guia de Prerendering da Página Inicial para SEO

## 🎯 Objetivo

Melhorar o SEO da página inicial através de prerendering, garantindo que o conteúdo dinâmico do Firebase seja incluído no HTML estático servido aos crawlers do Google.

## 📋 Como Funciona

### 1. **Análise do Problema**
A página inicial (`/`) carrega dados dinâmicos de múltiplas fontes:
- Pacotes em destaque (Firestore)
- Seção Boxes (Firestore)
- Transfer Beberibe (Firestore)
- FAQ Home (Firestore)
- Avaliações (Firestore)
- Outros componentes dinâmicos

Sem prerendering, os crawlers do Google recebem um HTML inicial vazio, dependendo de JavaScript para carregar o conteúdo.

### 2. **Solução Implementada**

O script `scripts/prerenderHome.js` usa Puppeteer para:
1. Servir o build localmente
2. Navegar até a página inicial
3. Esperar todo o conteúdo dinâmico carregar (3 segundos extras)
4. Capturar o HTML final com todos os dados
5. Sobrescrever o `index.html` com o HTML pré-renderizado

### 3. **Validação de Conteúdo**

O script verifica se o HTML pré-renderizado contém:
- Estrutura HTML válida
- Tags de SEO essenciais (meta description, og:title, canonical)
- Conteúdo de turismo/transfer/passeio
- Títulos e cabeçalhos

## 🚀 Como Usar

### Build Automático (Recomendado)

O prerendering da Home é executado automaticamente após cada build:

```bash
npm run build
```

O processo:
1. Executa o build normal do CRA
2. Prerenderiza páginas de pacotes (`prerenderPackages.js`)
3. Prerenderiza a página inicial (`prerenderHome.js`)

### Prerendering Manual

Para prerenderizar apenas a Home:

```bash
npm run prerender-home
```

Para prerenderizar tudo (pacotes + Home):

```bash
npm run prerender
```

## 📊 Conteúdo Dinâmico Incluído

O prerendering captura o conteúdo de:

### Componentes com dados do Firebase:
- **Pacotes em Destaque**: Títulos, preços, descrições, imagens
- **Outros Pacotes**: Lista completa de pacotes
- **Boxes**: Seções de serviços/informações
- **Transfer Beberibe**: Informações de transfer
- **FAQ Home**: Perguntas e respostas
- **Avaliações**: Reviews e ratings
- **Depoimentos**: Testemunhos

### Componentes estáticos:
- Header e navegação
- Banner hero
- Footer
- Links internos

## 🔍 Validações Realizadas

O script verifica:

1. **Estrutura HTML**
   - HTML válido e completo
   - Tags `<html>`, `<head>`, `<body>` presentes

2. **SEO Essentials**
   - Meta description
   - Open Graph tags (og:title)
   - Link canonical
   - Schema markup (JSON-LD)

3. **Conteúdo de Negócio**
   - Palavras-chave: transfer, passeio, turismo, Fortaleza
   - Títulos e descrições de pacotes
   - Informações de contato

## 🛡️ Backup Automático

O script cria automaticamente um backup do `index.html` original:
- Arquivo: `build/index.html.original`
- Criado apenas na primeira execução
- Permite restaurar o HTML original se necessário

## 📈 Benefícios para SEO

### 1. **First Contentful Paint (FCP)**
- Crawler recebe HTML completo imediatamente
- Não depende de JavaScript para conteúdo principal

### 2. **Índice de Conteúdo**
- Google indexa conteúdo completo dos pacotes
- Texto rico e estruturado disponível imediatamente

### 3. **Rich Snippets**
- Schema markup incluído no HTML estático
- Melhor visualização nos resultados de busca

### 4. **Performance**
- Reduz tempo de indexação
- Melhora Core Web Vitals para crawlers

## ⚠️ Considerações Importantes

### 1. **Atualização de Conteúdo**

Quando você atualizar conteúdo no Firebase:
- Execute `npm run build` novamente
- Ou execute `npm run prerender-home` para atualizar apenas a Home

### 2. **Deploy Automático**

No Vercel, o build é executado automaticamente em cada deploy, garantindo que o conteúdo esteja sempre atualizado.

### 3. **Desenvolvimento Local**

Durante desenvolvimento (`npm start`), o prerendering não é executado. O conteúdo é carregado dinamicamente como antes.

### 4. **Timeouts Configurados**

- Timeout de navegação: 120 segundos
- Timeout de espera de conteúdo: 30 segundos
- Espera extra para Firebase: 3 segundos

## 🔧 Troubleshooting

### Erro: "Build da CRA ainda não existe"
```bash
# Execute o build primeiro
npm run build
```

### Erro: "página inicial não contém conteúdo essencial"
- Verifique se o Firebase está retornando dados
- Verifique se os componentes estão carregando corretamente
- Aumente o timeout no script se necessário

### HTML não atualizou
- Verifique se o backup `index.html.original` existe
- Delete o backup e execute novamente
- Verifique permissões de escrita na pasta `build/`

## 📝 Exemplo de Output

```
[prerender-home] Iniciando prerender da página inicial...
[prerender-home] visitando /
[prerender-home] ok / -> build/index.html
[prerender-home] HTML size: 125432 bytes
[prerender-home] Conteúdo dinâmico incluído no HTML estático
[prerender-home] backup criado: build/index.html.original
[prerender-home] Página inicial pré-renderizada com sucesso
[prerender-home] Prerender da Home concluído com sucesso
```

## 🎯 Próximos Passos

1. **Monitorar SEO**: Use Google Search Console para verificar indexação
2. **Testar Crawlers**: Use ferramentas como "Rich Results Test" do Google
3. **Analisar Performance**: Verifique Core Web Vitals no PageSpeed Insights
4. **Atualizar Regularmente**: Execute build após atualizações significativas de conteúdo

## 📚 Recursos Adicionais

- Script de prerendering de pacotes: `scripts/prerenderPackages.js`
- Script de prerendering da Home: `scripts/prerenderHome.js`
- Configuração do build: `package.json`
- Documentação SEO: `SEO_GOOGLE_CONFIGURACAO.md`
