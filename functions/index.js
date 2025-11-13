const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

admin.initializeApp();

// Configurações (usar Firebase Config ou .env)
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const AGENCY_INFO = {
  brand: process.env.AGENCY_BRAND || "Maiatur",
  email: process.env.AGENCY_EMAIL || "contato@transferfortalezatur.com.br",
  phone: process.env.AGENCY_PHONE_DISPLAY || "+55 (85) 0000-0000",
  cnpj: process.env.AGENCY_CNPJ || "00.000.000/0001-00",
};

// ==========================================
// FUNÇÃO 1: Trigger onCreate - Enviar E-mail
// ==========================================
exports.onReservaCreated = functions.firestore
  .document("reservas/{reservaId}")
  .onCreate(async (snap, context) => {
    const reserva = snap.data();
    const reservaId = context.params.reservaId;

    // Ignorar documento modelo
    if (reservaId === "_modelo" || reserva._isModelo) {
      console.log("Documento modelo ignorado");
      return null;
    }

    try {
      console.log(`Processando reserva ${reservaId}...`);

      // 1. Gerar PDF em memória
      const pdfBytes = await gerarVoucherPDF(reserva, reservaId);

      // 2. Enviar e-mail com anexo
      await enviarEmailComVoucher(reserva, reservaId, pdfBytes);

      console.log(`✅ Voucher enviado para reserva ${reservaId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao processar reserva ${reservaId}:`, error);
      // Não falhar silenciosamente - poderia gravar status de erro
      return null;
    }
  });

// ==========================================
// FUNÇÃO 2: HTTPS Function - Download Voucher
// ==========================================
exports.voucher = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Extrair ID da URL: /voucher/:id
  const reservaId = req.path.split("/").filter(Boolean).pop();

  if (!reservaId || reservaId === "voucher") {
    res.status(400).send("ID da reserva não fornecido");
    return;
  }

  try {
    const docRef = admin.firestore().collection("reservas").doc(reservaId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()._isModelo) {
      res.status(404).send("Reserva não encontrada");
      return;
    }

    const reserva = doc.data();

    // Gerar PDF em memória
    const pdfBytes = await gerarVoucherPDF(reserva, reservaId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="voucher-${reservaId}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Erro ao gerar voucher:", error);
    res.status(500).send("Erro ao gerar voucher");
  }
});

// ==========================================
// HELPER: Gerar PDF do Voucher
// ==========================================
async function gerarVoucherPDF(reserva, reservaId) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  // Título
  page.drawText("VOUCHER DE RESERVA", {
    x: 50,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0, 0.4, 0.8),
  });

  page.drawText(AGENCY_INFO.brand, {
    x: width - 150,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: rgb(0, 0.4, 0.8),
  });

  y -= 30;

  // ID da Reserva
  page.drawText(`Reserva #${reservaId}`, {
    x: 50,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.8, 0, 0),
  });

  y -= 25;
  page.drawText(`Status: ${reserva.status?.toUpperCase() || "PENDENTE"}`, {
    x: 50,
    y,
    size: 12,
    font,
  });

  y -= 25;
  page.drawText(`Tipo: ${formatarTipo(reserva.tipo)}`, {
    x: 50,
    y,
    size: 12,
    font,
  });

  y -= 30;

  // Dados do Responsável
  y = desenharSecao(page, font, fontBold, "RESPONSÁVEL", y);
  y = desenharLinha(page, font, "Nome", reserva.responsavel?.nome, y);
  y = desenharLinha(page, font, "E-mail", reserva.responsavel?.email, y);
  y = desenharLinha(
    page,
    font,
    "Telefone",
    `${reserva.responsavel?.ddi} ${reserva.responsavel?.telefone}`,
    y
  );

  y -= 20;

  // Quantidades
  y = desenharSecao(page, font, fontBold, "PASSAGEIROS", y);
  y = desenharLinha(page, font, "Adultos", reserva.quantidades?.adultos, y);
  y = desenharLinha(page, font, "Crianças", reserva.quantidades?.criancas, y);
  if (reserva.quantidades?.malas > 0) {
    y = desenharLinha(page, font, "Malas", reserva.quantidades.malas, y);
  }

  y -= 20;

  // Detalhes específicos
  y = desenharSecao(page, font, fontBold, "DETALHES DO SERVIÇO", y);
  y = desenharDetalhes(page, font, reserva.tipo, reserva.detalhes, y);

  y -= 20;

  // Pagamento
  y = desenharSecao(page, font, fontBold, "PAGAMENTO", y);
  y = desenharLinha(page, font, "Forma", reserva.pagamento?.forma, y);
  y = desenharLinha(
    page,
    font,
    "Valor Total",
    `R$ ${reserva.pagamento?.valorTotal?.toFixed(2) || "0,00"}`,
    y
  );

  if (reserva.observacoes) {
    y -= 20;
    y = desenharSecao(page, font, fontBold, "OBSERVAÇÕES", y);
    page.drawText(reserva.observacoes, {
      x: 50,
      y: y - 15,
      size: 10,
      font,
      maxWidth: width - 100,
    });
    y -= 30;
  }

  // Rodapé
  y = 80;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 15;
  page.drawText(`${AGENCY_INFO.brand} - ${AGENCY_INFO.phone}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 12;
  page.drawText(`${AGENCY_INFO.email} - CNPJ: ${AGENCY_INFO.cnpj}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

function desenharSecao(page, font, fontBold, titulo, y) {
  page.drawText(titulo, {
    x: 50,
    y: y - 15,
    size: 12,
    font: fontBold,
    color: rgb(0, 0.4, 0.8),
  });
  return y - 30;
}

function desenharLinha(page, font, label, valor, y) {
  page.drawText(`${label}:`, {
    x: 50,
    y: y - 12,
    size: 10,
    font,
  });
  page.drawText(String(valor || "N/A"), {
    x: 180,
    y: y - 12,
    size: 10,
    font,
  });
  return y - 15;
}

function desenharDetalhes(page, font, tipo, detalhes, y) {
  if (!detalhes) return y;

  switch (tipo) {
    case "passeio":
      y = desenharLinha(page, font, "Passeio", detalhes.passeioDesejado, y);
      y = desenharLinha(page, font, "Tipo/Veículo", detalhes.tipoPasseioVeiculo, y);
      y = desenharLinha(page, font, "Data", detalhes.dataPasseio, y);
      y = desenharLinha(page, font, "Hora", detalhes.horaPasseio, y);
      y = desenharLinha(page, font, "Local de Saída", detalhes.localSaida, y);
      y = desenharLinha(page, font, "Hora de Saída", detalhes.horaSaida, y);
      y = desenharLinha(page, font, "Hora de Retorno", detalhes.horaRetorno, y);
      break;

    case "transfer_chegada":
      y = desenharLinha(page, font, "Tipo/Veículo", detalhes.tipoTransferVeiculo, y);
      y = desenharLinha(page, font, "Data/Hora Chegada", detalhes.dataHoraChegada, y);
      y = desenharLinha(page, font, "Nº Voo", detalhes.numeroVoo, y);
      y = desenharLinha(page, font, "Local Chegada", detalhes.localChegada, y);
      y = desenharLinha(page, font, "Destino", detalhes.destino, y);
      break;

    case "transfer_chegada_saida":
      y = desenharLinha(page, font, "Chegada", detalhes.dataHoraChegada, y);
      y = desenharLinha(page, font, "Voo Chegada", detalhes.numeroVooChegada, y);
      y = desenharLinha(page, font, "Hotel", detalhes.hotelDestino, y);
      y -= 5;
      y = desenharLinha(page, font, "Saída", detalhes.dataHoraSaida, y);
      y = desenharLinha(page, font, "Local Saída", detalhes.localSaida, y);
      y = desenharLinha(page, font, "Voo Saída", detalhes.numeroVooSaida, y);
      break;

    case "transfer_saida":
      y = desenharLinha(page, font, "Tipo/Veículo", detalhes.tipoTransferVeiculo, y);
      y = desenharLinha(page, font, "Data/Hora Saída", detalhes.dataHoraSaida, y);
      y = desenharLinha(page, font, "Local de Saída", detalhes.localSaida, y);
      y = desenharLinha(page, font, "Destino", detalhes.aeroportoDestino, y);
      break;

    case "transfer_entre_hoteis":
      y = desenharLinha(page, font, "Tipo/Veículo", detalhes.tipoTransferVeiculo, y);
      y = desenharLinha(page, font, "Data", detalhes.data, y);
      y = desenharLinha(page, font, "Hora", detalhes.hora, y);
      y = desenharLinha(page, font, "Hotel Partida", detalhes.hotelPartida, y);
      y = desenharLinha(page, font, "Hotel Destino", detalhes.hotelDestino, y);
      break;
  }

  return y;
}

function formatarTipo(tipo) {
  const tipos = {
    passeio: "Passeio",
    transfer_chegada: "Transfer de Chegada",
    transfer_chegada_saida: "Transfer Chegada e Saída",
    transfer_saida: "Transfer de Saída",
    transfer_entre_hoteis: "Transfer entre Hotéis",
  };
  return tipos[tipo] || tipo;
}

// ==========================================
// HELPER: Enviar E-mail com Voucher
// ==========================================
async function enviarEmailComVoucher(reserva, reservaId, pdfBytes) {
  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  const mailOptions = {
    from: `${AGENCY_INFO.brand} <${AGENCY_INFO.email}>`,
    to: reserva.responsavel?.email,
    cc: AGENCY_INFO.email,
    subject: `Voucher ${AGENCY_INFO.brand} – Reserva #${reservaId}`,
    html: gerarEmailHTML(reserva, reservaId),
    attachments: [
      {
        filename: `voucher-${reservaId}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`E-mail enviado para ${reserva.responsavel?.email}`);
}

function gerarEmailHTML(reserva, reservaId) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { margin: 10px 0; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${AGENCY_INFO.brand}</h1>
      <p>Confirmação de Reserva</p>
    </div>
    <div class="content">
      <h2>Olá, ${reserva.responsavel?.nome}!</h2>
      <p>Sua reserva foi confirmada com sucesso!</p>
      
      <div class="info">
        <span class="label">Reserva:</span> #${reservaId}
      </div>
      <div class="info">
        <span class="label">Tipo:</span> ${formatarTipo(reserva.tipo)}
      </div>
      <div class="info">
        <span class="label">Status:</span> ${reserva.status?.toUpperCase() || "PENDENTE"}
      </div>
      
      <p><strong>Seu voucher está em anexo.</strong></p>
      <p>Por favor, apresente este voucher no dia do serviço.</p>
      
      <p>Em caso de dúvidas, entre em contato:</p>
      <ul>
        <li>WhatsApp: ${AGENCY_INFO.phone}</li>
        <li>E-mail: ${AGENCY_INFO.email}</li>
      </ul>
    </div>
    <div class="footer">
      <p>${AGENCY_INFO.brand} - CNPJ: ${AGENCY_INFO.cnpj}</p>
      <p>Empresa Certificada · Top 3 Tripadvisor · Site Blindado</p>
    </div>
  </div>
</body>
</html>
  `;
}
