# 🔗 Como Adicionar Links do Site no Google Meu Negócio

## ✅ O Que Foi Criado

### Página Google Hub
📍 **URL**: `https://transferfortalezatur.com.br/google`

Uma página especial que funciona como "hub" para visitantes do Google, com botões para:
- ✅ Ver Pacotes
- ✅ Fazer Reserva
- ✅ Destinos
- ✅ Fale Conosco
- ✅ WhatsApp, Telefone, Email

---

## 🎯 Como Configurar no Google Meu Negócio

### 1️⃣ **Link Principal do Site**

1. Acesse: [Google Business Profile](https://business.google.com/)
2. Faça login com sua conta Google
3. Selecione sua empresa
4. Clique em **"Editar perfil"**
5. Na seção **"Site"**, adicione:
   ```
   https://transferfortalezatur.com.br/google
   ```
6. Clique em **"Aplicar"**

### 2️⃣ **Adicionar Botão de Ação**

O Google permite adicionar um botão principal. Configure assim:

1. No perfil da empresa, clique em **"Adicionar botão de ação"**
2. Escolha uma opção:
   - **"Reserve"** → Link: `https://transferfortalezatur.com.br/reservas`
   - **"Saiba mais"** → Link: `https://transferfortalezatur.com.br/google`
   - **"Faça uma reserva"** → Link: `https://transferfortalezatur.com.br/reservas`

### 3️⃣ **Links Adicionais (Posts)**

Você pode criar posts com links específicos:

1. No Google Meu Negócio, clique em **"Adicionar postagem"**
2. Crie posts como:

**Exemplo 1: Pacotes**
```
Título: Conheça Nossos Pacotes de Viagem
Descrição: Explore os melhores destinos com preços especiais!
Botão: "Ver Pacotes"
Link: https://transferfortalezatur.com.br/pacotes
```

**Exemplo 2: Reservas**
```
Título: Reserve seu Transfer ou Passeio
Descrição: Faça sua reserva online de forma rápida e segura
Botão: "Reservar Agora"
Link: https://transferfortalezatur.com.br/reservas
```

**Exemplo 3: Hub Completo**
```
Título: Todas as Nossas Opções
Descrição: Veja pacotes, destinos, reservas e muito mais!
Botão: "Acessar"
Link: https://transferfortalezatur.com.br/google
```

---

## 📱 Benefícios da Página Google Hub

### Para Você (Empresa)
✅ **Rastreamento**: Sabe quem vem do Google
✅ **Conversão**: Links diretos para ações importantes
✅ **Profissional**: Página moderna e organizada
✅ **WhatsApp**: Botão direto com mensagem pré-definida

### Para o Cliente
✅ **Fácil**: Todas opções em um lugar
✅ **Rápido**: Botões grandes e claros
✅ **Confiável**: Badges de confiança (500+ clientes, 4.9★)
✅ **Contato**: Múltiplas formas de contato

---

## 🎨 Customizações Disponíveis

Se quiser personalizar a página `/google`:

### Alterar Número do WhatsApp
No arquivo `GoogleHub.jsx`, linha 15:
```jsx
const numero = "5585988776655"; // Seu número aqui
```

### Alterar Mensagem do WhatsApp
No arquivo `GoogleHub.jsx`, linha 16:
```jsx
const mensagem = "Olá! Vim pelo Google e gostaria de mais informações.";
```

### Alterar Estatísticas
No arquivo `GoogleHub.jsx`, linhas 83-95:
```jsx
<div className="trust-number">500+</div>
<div className="trust-label">Clientes Satisfeitos</div>
```

### Adicionar ou Remover Botões
No arquivo `GoogleHub.jsx`, no array `actions` (linhas 20-50):
```jsx
{
  icon: FiStar, // Ícone
  title: 'Avaliações', // Título
  description: 'Veja o que dizem sobre nós', // Descrição
  link: '/avaliacoes', // Link
  color: 'red', // Cor
  gradient: 'from-red-500 to-red-600' // Gradiente
}
```

---

## 📊 Analytics - Rastreamento

Para saber quantas pessoas vêm do Google:

### Google Analytics
A página já registra automaticamente as visitas. No Google Analytics você verá:
- **Origem**: google / organic
- **Página de entrada**: /google

### Google Tag Manager (Opcional)
Adicione eventos personalizados:
```javascript
// Clique em "Ver Pacotes"
dataLayer.push({
  'event': 'google_hub_click',
  'button': 'pacotes'
});
```

---

## 🚀 URLs Úteis para o Google

Use estes links no seu Google Meu Negócio:

| Destino | URL |
|---------|-----|
| **Hub Geral** | `https://transferfortalezatur.com.br/google` |
| **Pacotes** | `https://transferfortalezatur.com.br/pacotes` |
| **Reservas** | `https://transferfortalezatur.com.br/reservas` |
| **Destinos** | `https://transferfortalezatur.com.br/destinos` |
| **Contato** | `https://transferfortalezatur.com.br/contato` |
| **WhatsApp** | `https://wa.me/5585988776655` |

---

## 💡 Dicas para Maximizar Conversões

### 1. **Use o Hub como Link Principal**
Coloque `https://transferfortalezatur.com.br/google` como site principal no Google Meu Negócio.

### 2. **Crie Posts Semanais**
Faça posts no Google apontando para:
- Segunda: Pacotes
- Quarta: Reservas
- Sexta: Promoções especiais

### 3. **Responda Avaliações**
Sempre inclua o link do hub nas respostas:
```
"Obrigado pela avaliação! Conheça mais opções em transferfortalezatur.com.br/google"
```

### 4. **Fotos com CTA**
Nas fotos, adicione texto:
```
"Reserve Online → transferfortalezatur.com.br/google"
```

---

## 🎯 Checklist de Configuração

- [ ] Acessar Google Business Profile
- [ ] Adicionar `transferfortalezatur.com.br/google` como site
- [ ] Configurar botão de ação "Reserve"
- [ ] Criar primeiro post com link
- [ ] Testar todos os botões da página /google
- [ ] Configurar número do WhatsApp correto
- [ ] Verificar se analytics está funcionando
- [ ] Criar 3-5 posts com links diferentes

---

## 📞 Contatos que Aparecem na Página

A página mostra automaticamente:
- ☎️ **(85) 98877-6655** - Pode alterar no código
- 💬 **WhatsApp** - Abre chat direto
- ✉️ **Email** - contato@maiatur.com.br

---

## 🎨 Preview da Página

A página `/google` tem:

### Seção 1: Header
- Badge "Vindos do Google"
- Título grande "Bem-vindo à Maiatur!"
- Subtítulo explicativo

### Seção 2: Cards de Ação (4 botões)
1. 📦 **Ver Pacotes** (azul)
2. 📅 **Fazer Reserva** (verde)
3. 📍 **Destinos** (roxo)
4. 💬 **Fale Conosco** (laranja)

### Seção 3: Contato Rápido
- Botão WhatsApp (verde)
- Botão Telefone (azul)
- Botão Email (laranja)

### Seção 4: Badges de Confiança
- 500+ Clientes Satisfeitos
- 4.9★ Avaliação Google
- 24/7 Suporte

---

## ✅ Está Pronto!

A página `/google` está 100% funcional e pronta para ser usada no Google Meu Negócio.

**Próximo Passo**: Configure no Google Business Profile e comece a rastrear conversões!

---

## 🆘 Precisa de Ajuda?

Se precisar alterar cores, textos, botões ou adicionar novas funcionalidades, é só pedir!
