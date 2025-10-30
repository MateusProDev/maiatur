# 🚀 INÍCIO RÁPIDO - 5 Minutos

## ⚡ Setup Express

### 1. Configure o .env.local (1 min)

```bash
# Copie o exemplo
cp .env.reservas.example .env.local

# Adicione suas configurações (mínimo):
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-aqui
REACT_APP_AGENCY_EMAIL=contato@maiatur.com.br
REACT_APP_AGENCY_PHONE_WHATS=558500000000
```

### 2. Inicie o App (30s)

```bash
npm start
```

### 3. Inicialize o Sistema (1 min)

1. Abra: http://localhost:3000/admin/inicializador
2. Clique: **"Inicializar Sistema"**
3. Aguarde mensagem de sucesso

### 4. Teste uma Reserva (2 min)

1. Vá para: http://localhost:3000/reservas
2. Clique em qualquer card (ex: "Passeio")
3. Preencha o formulário
4. Clique em "Confirmar Reserva"
5. Veja o modal de sucesso! 🎉

---

## ✅ Pronto!

O sistema está funcionando localmente.

### Próximos Passos:

**Agora (Desenvolvimento)**
- ✅ Sistema funcionando em localhost
- ✅ Pode criar reservas
- ✅ Dados salvos no Firestore
- ⚠️ E-mail/PDF não funcionam (precisa deploy functions)

**Depois (Produção)**
1. Configure SMTP no `functions/.env`
2. Deploy functions: `firebase deploy --only functions`
3. Deploy site: `npm run build && vercel --prod`
4. ✅ Sistema 100% operacional!

---

## 🔗 Links Úteis

- 📖 Documentação completa: `SISTEMA_RESERVAS_DOCS.md`
- 🛠️ Guia de setup: `SETUP_RESERVAS.md`
- ✅ Checklist: `CHECKLIST_COMPLETO.md`
- 📊 Resumo: `README_RESERVAS.md`

---

## 🆘 Problemas?

### "Não consegui inicializar"
- Verifique se Firebase está configurado
- Confira `src/firebase/firebaseConfig.js`

### "Erro ao criar reserva"
- Abra o console (F12)
- Verifique a aba "Console"
- Copie o erro e procure no Google

### "Modal não aparece"
- Reserva foi criada no Firestore?
- Verifique Firebase Console → Firestore

---

## 💡 Dica

Abra o Firebase Console e vá em **Firestore** para ver as reservas sendo criadas em tempo real!

---

**Qualquer dúvida, veja SETUP_RESERVAS.md** 📚
