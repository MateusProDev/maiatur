# 💳 Configuração Mercado Pago - Guia Completo

## 📋 Opções de Implementação

### Opção 1: Vercel Functions (Recomendado) ✅
- **Não precisa de API separada na Render**
- Usa funções serverless da Vercel
- Mais simples e integrado
- Gratuito até certo limite

### Opção 2: API na Render 
- Servidor Node.js separado
- Mais controle, mas mais complexo
- Custo adicional

## 🚀 Implementação Escolhida: Vercel Functions

### 1. Estrutura de Arquivos Criada:
```
/api/
  ├── mercadopago.js          # Criar preferências de pagamento
  └── webhook/
      └── mercadopago.js      # Processar confirmações
```

### 2. Configuração das Variáveis de Ambiente na Vercel:

#### Acesse: [Vercel Dashboard](https://vercel.com/dashboard)
1. Vá no seu projeto
2. Settings → Environment Variables
3. Adicione as seguintes variáveis:

```bash
# Desenvolvimento (Sandbox)
MERCADO_PAGO_ACCESS_TOKEN=TEST-your-access-token-here
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=TEST-your-public-key-here

# Produção (quando estiver pronto)
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-production-access-token
# REACT_APP_MERCADO_PAGO_PUBLIC_KEY=APP_USR-your-production-public-key
```

### 3. Como Obter as Chaves do Mercado Pago:

1. **Acesse:** https://www.mercadopago.com.br/developers/panel/app
2. **Faça login** na sua conta Mercado Pago
3. **Crie uma aplicação:**
   - Nome: "Sistema de Viagens Favela Chique"
   - Modelo de negócio: Marketplace
   - Produtos: Checkout Pro

4. **Obtenha as chaves:**
   - **Access Token:** Para o backend (funções serverless)
   - **Public Key:** Para o frontend (React)

5. **Modo Sandbox (Teste):**
   - Use as chaves que começam com `TEST-`
   - Para testar pagamentos sem dinheiro real

6. **Modo Produção:**
   - Use as chaves que começam com `APP_USR-`
   - Para receber pagamentos reais

### 4. Configuração do Webhook na Vercel:

Após fazer deploy, configure no Mercado Pago:
- **URL do Webhook:** `https://sua-url.vercel.app/api/webhook/mercadopago`
- **Eventos:** `payment`

### 5. URLs de Retorno:

As URLs são configuradas automaticamente:
- **Sucesso:** `https://sua-url.vercel.app/pagamento/sucesso`
- **Erro:** `https://sua-url.vercel.app/pagamento/erro`
- **Pendente:** `https://sua-url.vercel.app/pagamento/pendente`

## 🔧 Próximos Passos:

1. ✅ **Arquivos criados** (já feito)
2. 🔄 **Obter chaves do Mercado Pago**
3. 🔄 **Configurar variáveis na Vercel**
4. 🔄 **Fazer deploy e testar**

## 💡 Vantagens da Abordagem Atual:

- **Sem custo adicional** (usa Vercel Functions)
- **Segurança:** Chaves privadas no servidor
- **Simplicidade:** Tudo integrado no mesmo projeto
- **Escalabilidade:** Serverless se adapta automaticamente
- **Webhooks:** Confirmação automática de pagamentos

## 🎯 Resumo:

**NÃO, você não precisa de uma API na Render!** 

A implementação atual usa Vercel Functions que funcionam como uma API serverless integrada ao seu projeto. É mais simples, seguro e econômico.
