# Deploy e Configuração - Favela Chique

## Configuração do Vercel

### 1. Primeira vez (Setup inicial)
```bash
npm install -g vercel
vercel login
```

### 2. Deploy
```bash
# Preview (teste)
npm run preview

# Produção
npm run deploy
```

### 3. Configuração das Variáveis de Ambiente no Vercel

No dashboard do Vercel, adicione estas variáveis de ambiente:

#### Firebase
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID` 
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

#### Mercado Pago
- `REACT_APP_MERCADO_PAGO_PUBLIC_KEY` (chave pública)
- `MERCADO_PAGO_ACCESS_TOKEN` (chave privada - APENAS para APIs serverless)

### 4. Configuração de Domínio Personalizado

1. No dashboard do Vercel, vá em Settings > Domains
2. Adicione o domínio: `20buscarvacationbeach.com.br`
3. Configure os DNS conforme instruções do Vercel

### 5. Verificar Deploy

Após o deploy, teste:
- [ ] Homepage carrega corretamente
- [ ] Login/logout funciona
- [ ] Admin area carrega
- [ ] Sistema de pagamento (teste com cartão de teste)
- [ ] API endpoints respondem (verificar Network tab)

### 6. Cartões de Teste Mercado Pago

**Visa aprovado:**
- Cartão: 4509 9535 6623 3704
- CVV: 123
- Vencimento: 11/25

**Mastercard aprovado:**
- Cartão: 5031 7557 3453 0604
- CVV: 123
- Vencimento: 11/25

**Cartão rejeitado:**
- Cartão: 4000 0000 0000 0002
- CVV: 123
- Vencimento: 11/25

### 7. Troubleshooting

#### CORS Error
Se ainda houver erro de CORS:
1. Verifique se o `vercel.json` está na raiz
2. Faça novo deploy: `vercel --prod`
3. Limpe cache do browser

#### API não encontrada (404)
1. Verifique se o arquivo `api/mercadopago.js` está presente
2. Confirme que o deploy incluiu a pasta `api/`
3. Verifique logs no dashboard do Vercel

#### Variáveis de ambiente
1. Confirme que todas as variáveis estão configuradas no dashboard
2. Redeploy após adicionar novas variáveis
3. Use `console.log` para verificar se as variáveis estão carregando

### 8. Monitoramento

- Dashboard Vercel: analytics e logs
- Console do navegador: erros de JavaScript
- Network tab: status das requisições API
- Mercado Pago Dashboard: transações

### 9. Backup das Configurações

Mantenha backup de:
- `.env` (local development)
- `.env.vercel` (referência para produção)
- `firebase.json`
- `vercel.json`

### 10. URLs Importantes

- **Produção:** https://20buscarvacationbeach.com.br
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Mercado Pago:** https://www.mercadopago.com.br/developers
- **Firebase Console:** https://console.firebase.google.com
