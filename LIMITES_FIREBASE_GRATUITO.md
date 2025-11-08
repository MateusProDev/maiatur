# 📊 Limites do Firebase Plano Gratuito (Spark Plan)

## 🆓 Resumo Geral

O Firebase oferece um **plano gratuito generoso** para projetos pequenos e médios. Seu site pode funcionar **100% grátis** se ficar dentro desses limites.

---

## 🔥 Firestore Database (Banco de Dados)

### Limites Diários:
- ✅ **50.000 leituras/dia** (reads)
- ✅ **20.000 escritas/dia** (writes)
- ✅ **20.000 exclusões/dia** (deletes)

### Limites Mensais:
- ✅ **1.5 milhões de leituras/mês**
- ✅ **600.000 escritas/mês**
- ✅ **600.000 exclusões/mês**

### Armazenamento:
- ✅ **1 GB de armazenamento**
- ✅ **10 GB/mês de transferência de rede**

### 📈 **Quantos acessos seu site aguenta?**

**Cenário típico por visita:**
- 1 página carregada = ~5-10 leituras no Firestore
  - Banners (1-3 leituras)
  - Pacotes (2-5 leituras)
  - Configurações (1-2 leituras)

**Cálculo conservador:**
```
50.000 leituras/dia ÷ 10 leituras/visita = 5.000 visitas/dia
5.000 visitas/dia × 30 dias = 150.000 visitas/mês
```

**Cálculo otimizado (com cache):**
```
50.000 leituras/dia ÷ 5 leituras/visita = 10.000 visitas/dia
10.000 visitas/dia × 30 dias = 300.000 visitas/mês
```

### ⚠️ **Operações que gastam mais:**
- ❌ **Admin Dashboard**: ~20-50 leituras por carregamento
- ❌ **Analytics**: 1 escrita por pageview
- ❌ **Blog**: 3-8 leituras por post
- ❌ **Busca/Filtros**: 5-20 leituras por consulta

---

## 🔐 Firebase Authentication

### Limites:
- ✅ **Usuários ilimitados** (sem limite de cadastros)
- ✅ **10.000 verificações de telefone/mês** (SMS)
- ✅ **Email/senha: ILIMITADO**
- ✅ **Google OAuth: ILIMITADO**

### 📱 **Quantos logins aguenta?**
```
ILIMITADO para email/senha e Google
Apenas SMS tem limite de 10.000/mês
```

---

## 📦 Cloud Storage (Imagens/Arquivos)

### Limites:
- ✅ **5 GB de armazenamento**
- ✅ **1 GB/dia de download** (20.000 downloads/dia)
- ✅ **20.000 uploads/dia**

### 🖼️ **Quantas imagens aguenta?**

**Armazenamento:**
```
5 GB ÷ 500 KB/imagem = ~10.000 imagens
5 GB ÷ 2 MB/imagem = ~2.500 imagens
```

**Downloads diários:**
```
1 GB/dia ÷ 500 KB/imagem = 2.000 downloads/dia
2.000 downloads × 30 = 60.000 downloads/mês
```

**Para seu site:**
- Banner: ~500 KB × 5 banners = 2.5 MB
- Pacotes: ~300 KB × 20 pacotes = 6 MB
- Blog: ~400 KB × 50 posts = 20 MB

**Total de imagens do site: ~30 MB** (bem abaixo do limite)

---

## 📊 Google Analytics 4

### Limites:
- ✅ **ILIMITADO** (sem limite de eventos)
- ✅ **500 eventos distintos**
- ✅ **25 parâmetros por evento**

### 📈 **Eventos no seu site:**
```
ILIMITADO - pode rastrear milhões de pageviews
```

---

## ⚡ Cloud Functions (Funções Serverless)

### Limites do Plano Gratuito:
- ✅ **2 milhões de invocações/mês**
- ✅ **400.000 GB-segundos/mês**
- ✅ **200.000 GHz-segundos/mês**
- ✅ **5 GB de tráfego de saída/mês**

### 🔧 **Funções no seu projeto:**
1. `enviar-email-reserva` (Brevo SMTP)
2. `mercadopago` (Webhook)

**Estimativa:**
```
2.000.000 invocações ÷ 30 dias = 66.666 invocações/dia
```

**Para seu site:**
- Email de reserva: ~100-500/dia = OK ✅
- Webhook Mercado Pago: ~50-200/dia = OK ✅

---

## 🌐 Firebase Hosting

### Limites:
- ✅ **10 GB de armazenamento**
- ✅ **360 MB/dia de transferência** (~10 GB/mês)

### 🚀 **Quantos acessos aguenta?**

**Tamanho típico do site:**
- HTML/CSS/JS: ~2 MB
- Imagens inline: ~3 MB
- **Total por visita: ~5 MB**

**Cálculo:**
```
360 MB/dia ÷ 5 MB/visita = 72 visitas/dia
10 GB/mês ÷ 5 MB/visita = 2.000 visitas/mês
```

**⚠️ ATENÇÃO:** Esse é o **gargalo principal** do plano gratuito!

**Solução:**
1. ✅ **Use Cloudinary** para hospedar imagens (sua configuração atual)
2. ✅ **Ative compressão GZIP** no Vercel/Firebase
3. ✅ **Lazy loading** para imagens
4. ✅ **Cache agressivo** de assets estáticos

---

## 🎯 Resumo: Limites Práticos para seu Site

### 📅 **Por Dia:**
| Recurso | Limite Gratuito | Seu Uso Estimado | Status |
|---------|-----------------|------------------|--------|
| Firestore Reads | 50.000 | 5.000-20.000 | ✅ OK |
| Firestore Writes | 20.000 | 500-2.000 | ✅ OK |
| Storage Downloads | 2.000 | 100-500 | ✅ OK |
| Hosting Transfer | 360 MB | 50-200 MB | ⚠️ Crítico |
| Cloud Functions | 66.666 | 100-500 | ✅ OK |

### 📊 **Capacidade Total (Estimativa Realista):**

**Com otimizações (Cloudinary + cache):**
```
🚀 5.000-10.000 visitantes únicos/dia
🚀 150.000-300.000 pageviews/mês
🚀 100% GRATUITO dentro dos limites
```

**Sem otimizações (tudo no Firebase):**
```
⚠️ 100-300 visitantes únicos/dia
⚠️ 3.000-9.000 pageviews/mês
⚠️ Limite de bandwidth do Hosting
```

---

## 💡 Dicas para Maximizar o Plano Gratuito

### 1. **Imagens no Cloudinary** ✅ (Já implementado)
```
Economiza ~90% do bandwidth do Firebase Hosting
Cloudinary gratuito: 25 GB/mês
```

### 2. **Cache Agressivo**
```javascript
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [{
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }]
      }
    ]
  }
}
```

### 3. **Lazy Loading de Imagens** ✅ (Já implementado)
```jsx
<img loading="lazy" src="..." />
```

### 4. **Otimizar Consultas Firestore**
```javascript
// ❌ Ruim: Busca tudo sempre
const docs = await getDocs(collection(db, 'posts'));

// ✅ Bom: Cache + limite
const q = query(collection(db, 'posts'), limit(10));
const cached = localStorage.getItem('posts');
```

### 5. **Desabilitar Analytics no Admin**
```javascript
// Não registrar views no painel admin
if (!window.location.pathname.includes('/admin')) {
  logEvent(analytics, 'page_view');
}
```

---

## 📈 Quando Fazer Upgrade?

### Plano Blaze (Pay-as-you-go):
Considere upgrade quando:

- ❌ **Mais de 50.000 leituras/dia consistentemente**
- ❌ **Mais de 360 MB/dia de bandwidth**
- ❌ **Mais de 10.000 visitantes únicos/dia**
- ❌ **Precisa de SLA e suporte premium**

**Custo estimado Blaze:**
```
100.000 visitantes/mês:
- Firestore: $3-8/mês
- Hosting: $5-15/mês
- Functions: $1-3/mês
- Storage: $1-2/mês
Total: ~$10-30/mês
```

---

## 🎯 Seu Status Atual

### ✅ **Configurações Otimizadas:**
1. ✅ Imagens no Cloudinary (não gasta Firebase)
2. ✅ Lazy loading implementado
3. ✅ Analytics otimizado (1 write/pageview)
4. ✅ Cache de dados no localStorage

### ⚠️ **Pontos de Atenção:**
1. ⚠️ Admin dashboard gasta muitas leituras (20-50/carregamento)
2. ⚠️ Blog views incrementa 1 write por acesso
3. ⚠️ Busca/filtros podem gerar muitas queries

### 🚀 **Capacidade Estimada:**
```
Com suas otimizações atuais:
📊 5.000-8.000 visitas/dia
📊 150.000-240.000 visitas/mês
💰 100% GRATUITO
```

---

## 🔍 Monitoramento

### Verificar uso no Firebase Console:

1. **Firestore:**
   - Console → Firestore → Usage
   - Veja reads/writes/deletes diários

2. **Hosting:**
   - Console → Hosting → Usage
   - Veja bandwidth usado

3. **Storage:**
   - Console → Storage → Usage
   - Veja armazenamento e downloads

4. **Functions:**
   - Console → Functions → Usage
   - Veja invocações e tempo de execução

### 📧 Alertas:
Configure alertas no Firebase quando chegar a:
- 80% do limite de reads
- 80% do limite de bandwidth
- 80% do limite de writes

---

## 📚 Links Úteis

- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Quotas](https://firebase.google.com/docs/firestore/quotas)
- [Cloudinary Pricing](https://cloudinary.com/pricing)
- [Vercel Bandwidth](https://vercel.com/docs/concepts/limits/overview)

---

## ✅ Conclusão

**Seu site está MUITO BEM configurado para o plano gratuito!**

Com Cloudinary para imagens e otimizações implementadas, você pode facilmente suportar:

🎉 **5.000-10.000 visitas/dia**
🎉 **150.000-300.000 visitas/mês**
🎉 **100% GRATUITO**

O Firebase só começará a cobrar se você ultrapassar os limites consistentemente, e mesmo assim, o custo seria baixo (~$10-30/mês para 100k visitas).
