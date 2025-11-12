# 🚀 Adicionar Serviços 2 e 3 no Firestore

## 📋 Passo a Passo:

### 1. Acesse o Firebase Console
https://console.firebase.google.com/project/maiatur/firestore/databases/-default-/data/~2Fcontent~2FservicesSection

### 2. Clique em "Edit document" (ícone de lápis)

### 3. Localize o campo `services` (array)

Você vai ver algo assim:
```
services (array)
  └─ 0 (map)
      ├─ color: "#21A657"
      ├─ description: "Transporte seguro..."
      ├─ id: 1762897392422
      ├─ image: "/aviaoservico.png"
      ├─ link: "/pacotes"
      ├─ linkText: "Saiba mais"
      └─ title: "Transfers & Receptivo"
```

### 4. Clique no botão "+" ao lado de `services` para adicionar items

### 5. Adicione o Serviço 2 (Passeios Privativos):

Clique em **"Add item"** no array `services` e adicione um novo **map** com os campos:

```
Tipo: map
Índice: 1

Campos do map:
├─ color (string): "#EE7C35"
├─ description (string): "Experiências exclusivas com roteiros personalizados para você"
├─ id (number): 1762897392423
├─ image (string): "/jericoaquaraservico.png"
├─ link (string): "/pacotes"
├─ linkText (string): "Saiba mais"
└─ title (string): "Passeios Privativos"
```

### 6. Adicione o Serviço 3 (City Tours):

Clique novamente em **"Add item"** no array `services` e adicione outro **map**:

```
Tipo: map
Índice: 2

Campos do map:
├─ color (string): "#F8C144"
├─ description (string): "Conheça as principais atrações e cultura local com nossos guias"
├─ id (number): 1762897392424
├─ image (string): "/fortalezacityservico.png"
├─ link (string): "/pacotes"
├─ linkText (string): "Saiba mais"
└─ title (string): "City Tours"
```

### 7. Clique em "Update" para salvar

---

## ✅ Como Adicionar Cada Campo:

Ao criar um novo item no array (map):

1. Clique em **"Add field"**
2. Escolha o **Type** (string, number, etc)
3. Digite o **Field name** (color, description, id, etc)
4. Digite o **Value**
5. Repita para todos os campos
6. Clique **"Add"**

---

## 🎯 Estrutura Final (3 serviços):

```
services (array)
├─ 0 (map) - Transfers & Receptivo
│   ├─ color: "#21A657"
│   ├─ description: "Transporte seguro do aeroporto ao hotel com conforto e pontualidade"
│   ├─ id: 1762897392422
│   ├─ image: "/aviaoservico.png"
│   ├─ link: "/pacotes"
│   ├─ linkText: "Saiba mais"
│   └─ title: "Transfers & Receptivo"
│
├─ 1 (map) - Passeios Privativos
│   ├─ color: "#EE7C35"
│   ├─ description: "Experiências exclusivas com roteiros personalizados para você"
│   ├─ id: 1762897392423
│   ├─ image: "/jericoaquaraservico.png"
│   ├─ link: "/pacotes"
│   ├─ linkText: "Saiba mais"
│   └─ title: "Passeios Privativos"
│
└─ 2 (map) - City Tours
    ├─ color: "#F8C144"
    ├─ description: "Conheça as principais atrações e cultura local com nossos guias"
    ├─ id: 1762897392424
    ├─ image: "/fortalezacityservico.png"
    ├─ link: "/pacotes"
    ├─ linkText: "Saiba mais"
    └─ title: "City Tours"
```

---

## 🔍 Verificar se Funcionou:

1. Acesse: http://localhost:3000/admin/services
2. Deve aparecer: **"🎯 Gerenciar Serviços (3)"**
3. Você verá 3 cards:
   - ✅ Transfers & Receptivo (verde)
   - ✅ Passeios Privativos (laranja)
   - ✅ City Tours (amarelo)

---

## 📝 Dica Rápida:

Se for muito trabalhoso adicionar campo por campo, você pode:

### Opção Alternativa (Mais Rápida):

1. **Delete** o documento `servicesSection` completamente
2. **Salve** as alterações
3. **Acesse** `/admin/services` 
4. O sistema vai **recriar automaticamente** com os 3 serviços já configurados

Isso funciona porque o código tem os dados padrão no `AdminServices.jsx` que acabamos de atualizar! 🚀

---

## ⚠️ Importante:

- **IDs devem ser números únicos** (não string)
- **Cores no formato** `#RRGGBB` (com #)
- **Imagens devem existir** na pasta `public/` ou ser URLs completas
- **Todos os campos são obrigatórios**

---

## 🆘 Se Tiver Erro:

Console do navegador (F12) vai mostrar o erro específico. Me avise que eu ajudo! 😊
