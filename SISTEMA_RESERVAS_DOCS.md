# Sistema de Reservas Maiatur - Documentação

## 📋 Visão Geral

Sistema de reservas online integrado ao projeto existente da Maiatur, usando:
- **Frontend**: React (Create React App) + React Router + React Hook Form + Zod
- **Backend**: Firebase Firestore + Cloud Functions (Node 18)
- **PDF**: Gerado em memória com pdf-lib
- **E-mail**: Nodemailer (SMTP gratuito)

## 🗂️ Estrutura Criada

```
src/
├── types/
│   └── reservas.ts              # Tipos TypeScript
├── schemas/
│   └── reservasSchemas.ts       # Validações Zod
├── services/
│   └── reservasService.ts       # Lógica de negócio
├── components/
│   └── Reservas/
│       ├── CamposComuns.tsx     # Componentes reutilizáveis
│       ├── CamposComuns.css
│       ├── ModalSucessoReserva.tsx
│       └── ModalSucessoReserva.css
├── pages/
│   ├── ReservasPage/            # Página principal (5 cards)
│   │   ├── ReservasPage.tsx
│   │   └── ReservasPage.css
│   ├── PasseioPage/
│   │   ├── PasseioPage.tsx
│   │   └── PasseioPage.css
│   ├── TransferChegadaPage/
│   │   └── TransferChegadaPage.tsx
│   ├── TransferChegadaSaidaPage/
│   │   └── (a criar)
│   ├── TransferSaidaPage/
│   │   └── (a criar)
│   └── TransferEntreHoteisPage/
│       └── (a criar)
```

## 🔧 Variáveis de Ambiente

### Frontend (.env.local)

```env
# Firebase
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
REACT_APP_FIREBASE_API_KEY=sua-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_APP_ID=seu-app-id

# Agência
REACT_APP_BRAND_NAME=Maiatur
REACT_APP_AGENCY_EMAIL=contato@maiatur.com.br
REACT_APP_AGENCY_PHONE_DISPLAY="+55 (85) 0000-0000"
REACT_APP_AGENCY_PHONE_WHATS=558500000000
REACT_APP_AGENCY_CNPJ="00.000.000/0001-00"
REACT_APP_TZ=America/Fortaleza
```

### Backend (functions/.env ou Firebase Config)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu.email@gmail.com
SMTP_PASS=app-password-aqui
AGENCY_EMAIL=contato@maiatur.com.br
AGENCY_BRAND=Maiatur
AGENCY_PHONE_DISPLAY="+55 (85) 0000-0000"
AGENCY_CNPJ="00.000.000/0001-00"
TZ=America/Fortaleza
```

## 🗄️ Estrutura Firestore

### Coleção: `reservas`

```javascript
{
  tipo: "passeio" | "transfer_chegada" | "transfer_chegada_saida" | "transfer_saida" | "transfer_entre_hoteis",
  status: "pendente" | "confirmada" | "cancelada",
  responsavel: {
    nome: string,
    email: string,
    ddi: string,
    telefone: string (só números)
  },
  quantidades: {
    adultos: number,
    criancas: number,
    malas?: number
  },
  passageiros: [
    {
      nome: string,
      docTipo: "CPF" | "RG",
      docNumero: string,
      idade?: number
    }
  ],
  pagamento: {
    forma: "Dinheiro" | "Pix" | "Cartão" | "Link" | "Outro",
    valorTotal: number
  },
  observacoes: string,
  detalhes: object (varia por tipo),
  criadoEm: Timestamp
}
```

### Coleção: `listas`

```javascript
// listas/passeios
{
  items: ["Beach Park", "Cumbuco", "Jericoacoara", ...]
}

// listas/veiculos
{
  items: ["Carro até 4 pessoas", "Van até 10 pessoas", "Micro-ônibus até 20 pessoas", ...]
}
```

## 🚀 Integração no App.jsx

Adicione as rotas no seu App.jsx:

```jsx
import ReservasPage from "./pages/ReservasPage/ReservasPage";
import PasseioPage from "./pages/PasseioPage/PasseioPage";
import TransferChegadaPage from "./pages/TransferChegadaPage/TransferChegadaPage";
// ... outros imports

// Dentro do <Routes>:
<Route path="/reservas" element={<ReservasPage />} />
<Route path="/reservas/passeio" element={<PasseioPage />} />
<Route path="/reservas/transfer-chegada" element={<TransferChegadaPage />} />
<Route path="/reservas/transfer-chegada-e-saida" element={<TransferChegadaSaidaPage />} />
<Route path="/reservas/transfer-saida" element={<TransferSaidaPage />} />
<Route path="/reservas/transfer-entre-hoteis" element={<TransferEntreHoteisPage />} />
```

## 🔐 Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservas/{id} {
      allow create: if true;  // Público pode criar
      allow read, update, delete: if false;  // Só admin
    }
    match /listas/{doc} {
      allow read: if true;  // Público lê
      allow write: if false;  // Só admin escreve
    }
  }
}
```

## 📦 Dependências Instaladas

```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "date-fns": "^2.x",
  "date-fns-tz": "^2.x",
  "react-input-mask": "^2.x"
}
```

## ⚙️ Cloud Functions (A Implementar)

### 1. Trigger onCreate (functions/index.js)

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

admin.initializeApp();

exports.onReservaCreated = functions.firestore
  .document("reservas/{reservaId}")
  .onCreate(async (snap, context) => {
    const reserva = snap.data();
    const reservaId = context.params.reservaId;

    // 1. Gerar PDF em memória
    const pdfBytes = await gerarVoucherPDF(reserva, reservaId);

    // 2. Enviar e-mail com anexo
    await enviarEmailComVoucher(reserva, reservaId, pdfBytes);

    console.log(`Voucher enviado para reserva ${reservaId}`);
  });
```

### 2. HTTPS Function para Download (functions/index.js)

```javascript
exports.voucher = functions.https.onRequest(async (req, res) => {
  const reservaId = req.path.split("/").pop();
  
  const docRef = admin.firestore().collection("reservas").doc(reservaId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return res.status(404).send("Reserva não encontrada");
  }

  const reserva = doc.data();
  const pdfBytes = await gerarVoucherPDF(reserva, reservaId);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="voucher-${reservaId}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});
```

## 🎨 Personalização

- Logo está em `/public/maiatur-logo.png`
- Para functions, copie para `functions/assets/maiatur-logo.png`
- Ajuste cores nos CSS de cada página
- Labels e textos seguem exatamente o especificado

## ✅ Próximos Passos

1. Completar os 3 formulários restantes
2. Criar página `/politica` (placeholder)
3. Criar admin inicializador (`/admin/inicializador`)
4. Implementar Cloud Functions
5. Testar fluxo completo
6. Deploy

## 📱 WhatsApp Integration

Formato da mensagem:
```
Olá! Gostaria de confirmar minha reserva #[ID]
Tipo: [Tipo de Reserva]
Data: [Data]
...
```

## 🔗 Links Úteis

- Firebase Console: https://console.firebase.google.com
- Deploy Functions: `firebase deploy --only functions`
- Deploy Firestore Rules: `firebase deploy --only firestore:rules`
