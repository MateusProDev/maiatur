const nodemailer = require("nodemailer");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// Configuração SMTP (usar variáveis de ambiente da Vercel)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Gerar PDF do Voucher
async function gerarVoucherPDF(reserva, reservaId) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const primaryColor = rgb(0.1, 0.3, 0.6);
  const accentColor = rgb(0.9, 0.5, 0.1);
  
  let yPos = height - 80;
  
  // Header
  page.drawText("VOUCHER DE RESERVA", {
    x: 50,
    y: yPos,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 10;
  page.drawRectangle({
    x: 50,
    y: yPos - 5,
    width: width - 100,
    height: 2,
    color: accentColor,
  });
  
  yPos -= 40;
  
  // Informações da Agência
  page.drawText("MAIATUR TURISMO", {
    x: 50,
    y: yPos,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 20;
  page.drawText("CNPJ: " + (process.env.AGENCY_CNPJ || "00.000.000/0001-00"), {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 15;
  page.drawText("Telefone: " + (process.env.AGENCY_PHONE || "+55 (85) 0000-0000"), {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 40;
  
  // Número da Reserva
  page.drawRectangle({
    x: 50,
    y: yPos - 35,
    width: width - 100,
    height: 50,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText("Nº DA RESERVA:", {
    x: 60,
    y: yPos - 10,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(reservaId.substring(0, 12).toUpperCase(), {
    x: 60,
    y: yPos - 28,
    size: 18,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 60;
  
  // Tipo de Reserva
  const tipoMap = {
    passeio: "PASSEIO",
    transfer_chegada: "TRANSFER DE CHEGADA",
    transfer_saida: "TRANSFER DE SAÍDA",
    transfer_chegada_saida: "TRANSFER CHEGADA + SAÍDA",
    transfer_entre_hoteis: "TRANSFER ENTRE HOTÉIS"
  };
  
  page.drawText("TIPO DE SERVIÇO:", {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(tipoMap[reserva.tipo] || reserva.tipo.toUpperCase(), {
    x: 50,
    y: yPos - 18,
    size: 14,
    font: fontBold,
    color: accentColor,
  });
  
  yPos -= 50;
  
  // Dados do Responsável
  page.drawText("RESPONSÁVEL PELA RESERVA", {
    x: 50,
    y: yPos,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 25;
  page.drawText(`Nome: ${reserva.responsavel.nome}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 18;
  page.drawText(`E-mail: ${reserva.responsavel.email}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 18;
  page.drawText(`Telefone: ${reserva.responsavel.ddi} ${reserva.responsavel.telefone}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 35;
  
  // Quantidade de Passageiros
  page.drawText("PASSAGEIROS", {
    x: 50,
    y: yPos,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 25;
  page.drawText(`Adultos: ${reserva.quantidades.adultos}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  if (reserva.quantidades.criancas > 0) {
    page.drawText(`Crianças: ${reserva.quantidades.criancas}`, {
      x: 200,
      y: yPos,
      size: 10,
      font: font,
    });
  }
  
  if (reserva.quantidades.malas > 0) {
    page.drawText(`Malas: ${reserva.quantidades.malas}`, {
      x: 350,
      y: yPos,
      size: 10,
      font: font,
    });
  }
  
  yPos -= 35;
  
  // Informações Específicas
  if (reserva.passeio) {
    page.drawText("DETALHES DO PASSEIO", {
      x: 50,
      y: yPos,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });
    
    yPos -= 25;
    page.drawText(`Passeio: ${reserva.passeio.nome}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
    
    yPos -= 18;
    page.drawText(`Data: ${new Date(reserva.passeio.data).toLocaleDateString('pt-BR')}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
    
    yPos -= 18;
    page.drawText(`Horário: ${reserva.passeio.horario}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
    
    yPos -= 18;
    page.drawText(`Local de Embarque: ${reserva.passeio.localEmbarque}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
  }
  
  if (reserva.voo || reserva.vooChegada) {
    const voo = reserva.voo || reserva.vooChegada;
    
    page.drawText("INFORMAÇÕES DO VOO", {
      x: 50,
      y: yPos,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });
    
    yPos -= 25;
    page.drawText(`Número do Voo: ${voo.numeroVoo}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
    
    yPos -= 18;
    const dataVoo = voo.dataChegada || voo.dataSaida;
    page.drawText(`Data: ${new Date(dataVoo).toLocaleDateString('pt-BR')}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
    
    yPos -= 18;
    const horarioVoo = voo.horarioChegada || voo.horarioSaida;
    page.drawText(`Horário: ${horarioVoo}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
    });
  }
  
  yPos -= 35;
  
  // Valor
  page.drawText("PAGAMENTO", {
    x: 50,
    y: yPos,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 25;
  page.drawText(`Forma de Pagamento: ${reserva.pagamento.forma}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
  });
  
  yPos -= 18;
  page.drawText(`Valor Total: R$ ${reserva.pagamento.valorTotal.toFixed(2)}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: fontBold,
  });
  
  // Footer
  yPos = 60;
  page.drawText("Este voucher é válido apenas com apresentação de documento com foto.", {
    x: 50,
    y: yPos,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  yPos -= 15;
  page.drawText("Em caso de dúvidas, entre em contato conosco.", {
    x: 50,
    y: yPos,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Enviar Email
async function enviarEmail(reserva, reservaId, pdfBytes) {
  const transporter = createTransporter();
  
  const tipoMap = {
    passeio: "Passeio",
    transfer_chegada: "Transfer de Chegada",
    transfer_saida: "Transfer de Saída",
    transfer_chegada_saida: "Transfer Chegada + Saída",
    transfer_entre_hoteis: "Transfer entre Hotéis"
  };
  
  const mailOptions = {
    from: `"Maiatur Turismo" <${process.env.SMTP_USER}>`,
    to: reserva.responsavel.email,
    subject: `✅ Reserva Confirmada - ${tipoMap[reserva.tipo]} - #${reservaId.substring(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a4d7a 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .voucher-box { background: white; border: 2px solid #e67e22; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .voucher-number { font-size: 24px; font-weight: bold; color: #e67e22; margin: 10px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
          .btn { display: inline-block; background: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Reserva Confirmada!</h1>
            <p>Obrigado por escolher a Maiatur Turismo</p>
          </div>
          
          <div class="content">
            <div class="voucher-box">
              <p style="margin: 0; color: #666;">Número da Reserva</p>
              <div class="voucher-number">#${reservaId.substring(0, 12).toUpperCase()}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Guarde este número para referência</p>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1a4d7a; margin-top: 0;">📋 Detalhes da Reserva</h3>
              <p><strong>Tipo:</strong> ${tipoMap[reserva.tipo]}</p>
              <p><strong>Responsável:</strong> ${reserva.responsavel.nome}</p>
              <p><strong>Passageiros:</strong> ${reserva.quantidades.adultos} adulto(s)${reserva.quantidades.criancas > 0 ? ` + ${reserva.quantidades.criancas} criança(s)` : ''}</p>
              <p><strong>Valor Total:</strong> R$ ${reserva.pagamento.valorTotal.toFixed(2)}</p>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1a4d7a; margin-top: 0;">📎 Voucher em Anexo</h3>
              <p>Seu voucher está anexado a este email em formato PDF.</p>
              <p><strong>⚠️ Importante:</strong> Apresente o voucher impresso ou no celular no dia do serviço, juntamente com um documento com foto.</p>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1a4d7a; margin-top: 0;">📞 Precisa de Ajuda?</h3>
              <p>Nossa equipe está pronta para atendê-lo:</p>
              <p>📱 WhatsApp: ${process.env.AGENCY_PHONE || '+55 (85) 0000-0000'}</p>
              <p>📧 Email: ${process.env.AGENCY_EMAIL || 'contato@maiatur.com.br'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">Estamos ansiosos para recebê-lo!</p>
              <p style="font-size: 20px; margin: 10px 0;">✈️ 🏖️ 🎉</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Maiatur Turismo</strong></p>
            <p>Top 3 no Tripadvisor • Empresa Certificada • Site Blindado</p>
            <p style="font-size: 11px; color: #999; margin-top: 15px;">
              Este é um email automático, por favor não responda.<br>
              Para contato, utilize nossos canais oficiais acima.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `voucher-${reservaId.substring(0, 8)}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`✅ Email enviado para ${reserva.responsavel.email}`);
}

// Handler da Vercel
module.exports = async (req, res) => {
  // Permitir apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  try {
    const { reserva, reservaId } = req.body;
    
    if (!reserva || !reservaId) {
      return res.status(400).json({ error: "Dados incompletos" });
    }
    
    // Gerar PDF
    console.log(`Gerando voucher para reserva ${reservaId}...`);
    const pdfBytes = await gerarVoucherPDF(reserva, reservaId);
    
    // Enviar email
    console.log(`Enviando email para ${reserva.responsavel.email}...`);
    await enviarEmail(reserva, reservaId, pdfBytes);
    
    return res.status(200).json({
      success: true,
      message: "Email enviado com sucesso!",
    });
    
  } catch (error) {
    console.error("Erro ao processar reserva:", error);
    return res.status(500).json({
      error: "Erro ao enviar email",
      details: error.message,
    });
  }
};
