# 🎯 Como Inicializar os 3 Serviços

## Problema Identificado:
O Firestore tem apenas 1 serviço salvo, mas deveria ter 3.

---

## ✅ Solução Rápida (Via Console do Firebase):

### Passo 1: Acesse o Firestore
1. Vá para: https://console.firebase.google.com/project/maiatur/firestore
2. Navegue até: **Firestore Database** → **Data**

### Passo 2: Localize ou Crie o Documento
- Collection: `content`
- Document ID: `servicesSection`

### Passo 3: Edite o Campo `services` (Array)
Clique em **Edit** e substitua o array `services` por este:

```json
[
  {
    "id": 1731340800000,
    "title": "Transfers & Receptivo",
    "description": "Transporte seguro do aeroporto ao hotel com conforto e pontualidade",
    "image": "/aviaoservico.png",
    "color": "#21A657",
    "link": "/pacotes",
    "linkText": "Saiba mais"
  },
  {
    "id": 1731340800001,
    "title": "Passeios Privativos",
    "description": "Experiências exclusivas com roteiros personalizados para você",
    "image": "/jericoaquaraservico.png",
    "color": "#EE7C35",
    "link": "/pacotes",
    "linkText": "Saiba mais"
  },
  {
    "id": 1731340800002,
    "title": "City Tours",
    "description": "Conheça as principais atrações e cultura local com nossos guias",
    "image": "/fortalezacityservico.png",
    "color": "#F8C144",
    "link": "/pacotes",
    "linkText": "Saiba mais"
  }
]
```

### Passo 4: Certifique-se dos outros campos:
```
active: true (boolean)
badge: "Experiências Personalizadas" (string)
title: "Nossos Serviços" (string)
subtitle: "Cada detalhe pensado para tornar sua viagem perfeita" (string)
services: [array acima] (array)
```

### Passo 5: Salvar
Clique em **Update** para salvar.

---

## 🚀 Solução Alternativa (Via Script Node.js):

### Se você tiver Firebase Admin SDK configurado:

1. Execute o script:
```bash
node inicializar-servicos.js
```

2. Isso vai criar/atualizar automaticamente o documento com os 3 serviços.

---

## 🔍 Verificar se Funcionou:

1. Acesse: `/admin/services`
2. Você deve ver **"🎯 Gerenciar Serviços (3)"**
3. Os 3 cards devem aparecer:
   - Transfers & Receptivo (verde #21A657)
   - Passeios Privativos (laranja #EE7C35)
   - City Tours (amarelo #F8C144)

---

## 📋 Estrutura Completa do Documento:

```javascript
content/servicesSection
{
  "active": true,
  "badge": "Experiências Personalizadas",
  "title": "Nossos Serviços",
  "subtitle": "Cada detalhe pensado para tornar sua viagem perfeita",
  "services": [
    {
      "id": 1731340800000,
      "title": "Transfers & Receptivo",
      "description": "Transporte seguro do aeroporto ao hotel com conforto e pontualidade",
      "image": "/aviaoservico.png",
      "color": "#21A657",
      "link": "/pacotes",
      "linkText": "Saiba mais"
    },
    {
      "id": 1731340800001,
      "title": "Passeios Privativos",
      "description": "Experiências exclusivas com roteiros personalizados para você",
      "image": "/jericoaquaraservico.png",
      "color": "#EE7C35",
      "link": "/pacotes",
      "linkText": "Saiba mais"
    },
    {
      "id": 1731340800002,
      "title": "City Tours",
      "description": "Conheça as principais atrações e cultura local com nossos guias",
      "image": "/fortalezacityservico.png",
      "color": "#F8C144",
      "link": "/pacotes",
      "linkText": "Saiba mais"
    }
  ]
}
```

---

## ⚠️ Importante:

- **IDs únicos**: Cada serviço tem um ID diferente (importante para o React)
- **Cores**: Cada serviço tem sua cor de destaque
- **Imagens**: Certifique-se que as imagens existem na pasta `public/`

---

## 🎨 Depois de Configurar:

Você pode:
- ✅ Adicionar mais serviços pelo admin
- ✅ Editar títulos, descrições e cores
- ✅ Fazer upload de novas imagens via Cloudinary
- ✅ Reordenar com os botões ↑ ↓
- ✅ Remover serviços que não quiser

---

## 🔧 Se Tiver Problemas:

1. **Verifique o console do navegador** (F12) para erros
2. **Limpe o cache** do navegador
3. **Recarregue a página** `/admin/services`
4. Se ainda não funcionar, delete o documento `servicesSection` e deixe o sistema criar automaticamente na próxima vez que acessar o admin.
