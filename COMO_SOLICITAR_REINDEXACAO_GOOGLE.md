# 🔍 Como Solicitar Re-indexação no Google Search Console

## Por que fazer isso?

O Google rastreou seu site pela última vez em **13/11/2025 às 00:30**.
Nosso último deploy com todas as correções SEO foi **HOJE (15/11/2025 às 12:25)**.

**O Google ainda está mostrando a versão antiga com os bugs!**

---

## 📝 Passo a Passo Detalhado:

### 1️⃣ Acesse o Google Search Console
```
https://search.google.com/search-console
```

### 2️⃣ Selecione a propriedade
- Clique em `transferfortalezatur.com.br`

### 3️⃣ Solicite indexação da HOME (MAIS IMPORTANTE!)

**URL:** `https://transferfortalezatur.com.br/`

a) No topo da tela, há uma barra de pesquisa "Inspecionar qualquer URL"
b) Cole a URL: `https://transferfortalezatur.com.br/`
c) Pressione ENTER
d) Aguarde o Google analisar (30-60 segundos)
e) Clique no botão **"SOLICITAR INDEXAÇÃO"**
f) Aguarde a confirmação (1-2 minutos)

### 4️⃣ Solicite indexação da página CONTATO

**URL:** `https://transferfortalezatur.com.br/contato`

Repita o processo acima com esta URL.

**Por que?** Esta página estava aparecendo quando clicavam no domínio principal.

### 5️⃣ Solicite indexação das outras páginas principais

Repita para cada uma:

```
https://transferfortalezatur.com.br/sobre
https://transferfortalezatur.com.br/pacotes
https://transferfortalezatur.com.br/destinos
https://transferfortalezatur.com.br/blog
https://transferfortalezatur.com.br/avaliacoes
```

### 6️⃣ (Opcional) Solicite para as categorias

```
https://transferfortalezatur.com.br/categoria/passeio
https://transferfortalezatur.com.br/categoria/transfer
https://transferfortalezatur.com.br/categoria/beach-park
```

---

## ⏱️ Quanto tempo leva?

- **Solicitação:** 2-3 minutos por URL
- **Google processar:** 24-48 horas
- **Cache limpar completamente:** 3-7 dias

---

## ✅ Como verificar se funcionou?

### Após 24 horas:

1. **Pesquise no Google:** `site:transferfortalezatur.com.br`
2. **Clique em cada resultado**
3. **Verifique:**
   - Clicar em "Transfer Fortaleza Tur" → deve ir para HOME (/)
   - Clicar em "Contato" → deve ir para CONTATO (/contato)
   - Clicar em "Sobre" → deve ir para SOBRE (/sobre)
   - etc.

### Verificar meta tags:

1. Abra qualquer página do site
2. Clique direito → "Exibir código-fonte"
3. Procure por `<meta property="og:url"`
4. Verifique se aponta para a URL correta da página

**Exemplo HOME:**
```html
<meta property="og:url" content="https://transferfortalezatur.com.br/" />
<link rel="canonical" href="https://transferfortalezatur.com.br/" />
```

**Exemplo CONTATO:**
```html
<meta property="og:url" content="https://transferfortalezatur.com.br/contato" />
<link rel="canonical" href="https://transferfortalezatur.com.br/contato" />
```

---

## 🚨 Se ainda não funcionar após 48h:

1. **Verifique o Coverage Report no Search Console:**
   - Menu lateral → "Indexação" → "Páginas"
   - Veja se há erros nas URLs

2. **Force cache clear do Google:**
   - Pesquise: `cache:https://transferfortalezatur.com.br/`
   - Se mostrar versão antiga, aguarde mais 24-48h

3. **Solicite novamente a indexação**

---

## 📊 Acompanhamento:

Anote aqui quando solicitar cada URL:

- [ ] HOME (/) - Solicitado em: ___/___/___ às ___:___
- [ ] Contato (/contato) - Solicitado em: ___/___/___ às ___:___
- [ ] Sobre (/sobre) - Solicitado em: ___/___/___ às ___:___
- [ ] Pacotes (/pacotes) - Solicitado em: ___/___/___ às ___:___
- [ ] Destinos (/destinos) - Solicitado em: ___/___/___ às ___:___
- [ ] Blog (/blog) - Solicitado em: ___/___/___ às ___:___
- [ ] Avaliações (/avaliacoes) - Solicitado em: ___/___/___ às ___:___

---

## 💡 Dicas Extras:

1. **Não abuse:** Google limita a quantidade de solicitações por dia (10-20)
2. **Priorize:** Comece pela HOME e páginas mais importantes
3. **Seja paciente:** O processo leva tempo, é normal
4. **Monitore:** Acompanhe o relatório de cobertura no Search Console

---

## ❓ Dúvidas Frequentes:

**Q: Por que preciso fazer isso manualmente?**
A: O Google rastreia automaticamente, mas pode levar semanas. A solicitação manual acelera para 24-48h.

**Q: Posso solicitar todas as páginas de uma vez?**
A: Não. Precisa ser uma por uma no Google Search Console.

**Q: E se eu não fizer nada?**
A: O Google vai re-rastrear eventualmente (1-4 semanas), mas o problema vai persistir até lá.

**Q: Preciso fazer isso toda vez que fizer um deploy?**
A: Não. Apenas quando fizer mudanças importantes em meta tags, titles ou canonical URLs.

---

✅ **Tudo pronto!** Agora é só seguir o passo a passo e aguardar 24-48h para ver os resultados.
