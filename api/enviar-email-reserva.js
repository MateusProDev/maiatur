const nodemailer = require("nodemailer");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// Configuração SMTP (usar variáveis de ambiente da Vercel)
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || "465");
  const secure = port === 465; // 465 = SSL/TLS, 587 = STARTTLS
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Gera versão texto simples para melhorar entregabilidade
function gerarTextoPlano(reserva, reservaId, tipoLabel) {
  const linhas = [];
  linhas.push(`Reserva confirmada - ${tipoLabel}`);
  linhas.push(`Número da reserva: #${reservaId.substring(0, 12).toUpperCase()}`);
  linhas.push("");
  linhas.push(`Responsável: ${reserva.responsavel.nome}`);
  linhas.push(`E-mail: ${reserva.responsavel.email}`);
  linhas.push(`Telefone: ${reserva.responsavel.ddi} ${reserva.responsavel.telefone}`);
  linhas.push("");
  if (reserva.passeio) {
    linhas.push(`Passeio: ${reserva.passeio.nome}`);
    if (reserva.passeio.data) linhas.push(`Data: ${new Date(reserva.passeio.data).toLocaleDateString('pt-BR')}`);
    if (reserva.passeio.horario) linhas.push(`Horário: ${reserva.passeio.horario}`);
    if (reserva.passeio.localEmbarque) linhas.push(`Local de embarque: ${reserva.passeio.localEmbarque}`);
  }
  if (reserva.detalhes) {
    if (reserva.detalhes.destinoTransfer) linhas.push(`Destino: ${reserva.detalhes.destinoTransfer}`);
    if (reserva.detalhes.origemTransfer) linhas.push(`Origem: ${reserva.detalhes.origemTransfer}`);
    if (reserva.detalhes.rotaTransfer) linhas.push(`Rota: ${reserva.detalhes.rotaTransfer}`);
    if (reserva.detalhes.tipoTransferVeiculo) linhas.push(`Veículo: ${reserva.detalhes.tipoTransferVeiculo}`);
    if (reserva.detalhes.dataHoraChegada) linhas.push(`Data/Hora Chegada: ${reserva.detalhes.dataHoraChegada}`);
    if (reserva.detalhes.dataHoraSaida) linhas.push(`Data/Hora Saída: ${reserva.detalhes.dataHoraSaida}`);
    if (reserva.detalhes.destino) linhas.push(`Endereço Destino: ${reserva.detalhes.destino}`);
    if (reserva.detalhes.localSaida) linhas.push(`Local Saída: ${reserva.detalhes.localSaida}`);
  }
  if (reserva.vooChegada || reserva.voo) {
    const voo = reserva.vooChegada || reserva.voo;
    if (voo.numeroVoo) linhas.push(`Voo: ${voo.numeroVoo}`);
  }
  linhas.push("");
  linhas.push(`Pagamento: ${reserva.pagamento.forma}`);
  linhas.push(`Valor total: R$ ${reserva.pagamento.valorTotal?.toFixed?.(2) || reserva.pagamento.valorTotal}`);
  linhas.push("");
  linhas.push("Voucher em anexo (PDF). Apresente no dia do serviço com documento com foto.");
  linhas.push("");
  linhas.push(`Atendimento: ${process.env.AGENCY_PHONE || ''} • ${process.env.AGENCY_EMAIL || ''}`);
  return linhas.join("\n");
}

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
  page.drawText("TRANSFER FORTALEZA TUR", {
    x: 50,
    y: yPos,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });
  
  yPos -= 20;
  // CNPJ removido temporariamente até obter o número correto
  // page.drawText("CNPJ: " + (process.env.AGENCY_CNPJ || "00.000.000/0001-00"), {
  //   x: 50,
  //   y: yPos,
  //   size: 10,
  //   font: font,
  // });
  // yPos -= 15;
  
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
  
  // Informações de Transfer
  if (reserva.detalhes) {
    page.drawText("DETALHES DO TRANSFER", {
      x: 50,
      y: yPos,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });
    
    yPos -= 25;
    
    // Destino/Origem/Rota do Transfer (pacote selecionado)
    if (reserva.detalhes.destinoTransfer) {
      page.drawText(`Destino: ${reserva.detalhes.destinoTransfer}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: fontBold,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.origemTransfer) {
      page.drawText(`Origem: ${reserva.detalhes.origemTransfer}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: fontBold,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.rotaTransfer) {
      page.drawText(`Rota: ${reserva.detalhes.rotaTransfer}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: fontBold,
      });
      yPos -= 18;
    }
    
    // Tipo de veículo
    if (reserva.detalhes.tipoTransferVeiculo) {
      page.drawText(`Veículo: ${reserva.detalhes.tipoTransferVeiculo}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    // Informações de chegada
    if (reserva.detalhes.dataHoraChegada) {
      page.drawText(`Data/Hora Chegada: ${reserva.detalhes.dataHoraChegada}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.numeroVoo || reserva.detalhes.numeroVooChegada) {
      const numVoo = reserva.detalhes.numeroVoo || reserva.detalhes.numeroVooChegada;
      page.drawText(`Voo: ${numVoo}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    // Informações de saída
    if (reserva.detalhes.dataHoraSaida) {
      page.drawText(`Data/Hora Saída: ${reserva.detalhes.dataHoraSaida}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.numeroVooSaida) {
      page.drawText(`Voo Saída: ${reserva.detalhes.numeroVooSaida}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    // Locais
    if (reserva.detalhes.destino) {
      page.drawText(`Endereço Destino: ${reserva.detalhes.destino}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.localSaida) {
      page.drawText(`Local Saída: ${reserva.detalhes.localSaida}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.hotelDestino) {
      page.drawText(`Hotel Destino: ${reserva.detalhes.hotelDestino}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.hotelPartida) {
      page.drawText(`Hotel Partida: ${reserva.detalhes.hotelPartida}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    // Entre hotéis
    if (reserva.detalhes.data) {
      page.drawText(`Data: ${reserva.detalhes.data}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
    
    if (reserva.detalhes.hora) {
      page.drawText(`Horário: ${reserva.detalhes.hora}`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 18;
    }
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
  const tipoLabel = tipoMap[reserva.tipo] || reserva.tipo;

  // Preferir remetente do seu domínio. Se AGENCY_FROM estiver setado, usa ele; caso contrário, cai no SMTP_USER
  const fromAddress = process.env.AGENCY_FROM || process.env.SMTP_USER;
  const replyTo = process.env.AGENCY_REPLY_TO || process.env.AGENCY_EMAIL || process.env.SMTP_USER;
  
  const mailOptions = {
    from: `"Transfer Fortaleza Tur" <${fromAddress}>`,
    replyTo,
    to: reserva.responsavel.email,
    subject: `✅ Reserva Confirmada - ${tipoLabel} - #${reservaId.substring(0, 8).toUpperCase()}`,
    text: gerarTextoPlano(reserva, reservaId, tipoLabel),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #1a4d7a 0%, #2980b9 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            font-size: 28px; 
            margin-bottom: 10px;
            font-weight: 600;
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.95;
          }
          .content { 
            background: #ffffff; 
            padding: 30px; 
          }
          .voucher-box { 
            background: linear-gradient(135deg, #fff5eb 0%, #ffe8d1 100%); 
            border: 3px solid #e67e22; 
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0; 
            text-align: center;
            box-shadow: 0 4px 6px rgba(230, 126, 34, 0.1);
          }
          .voucher-label {
            margin: 0; 
            color: #e67e22; 
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .voucher-number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #e67e22; 
            margin: 12px 0;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .voucher-note {
            margin: 12px 0 0 0; 
            font-size: 13px; 
            color: #666;
          }
          .info-box { 
            background: #f9fafb; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border-left: 4px solid #1a4d7a;
          }
          .info-box h3 { 
            color: #1a4d7a; 
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .info-box p { 
            margin: 10px 0;
            font-size: 15px;
          }
          .info-box strong {
            color: #1a4d7a;
          }
          .highlight-box {
            background: #fff9e6;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .highlight-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .contact-info {
            background: #e8f4f8;
            border-left: 4px solid #2980b9;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, #e67e22 0%, #1a4d7a 100%);
            margin: 25px 0;
            border: none;
          }
          .emoji-section {
            text-align: center; 
            margin: 30px 0 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
          }
          .emoji-section p:first-child {
            color: #555; 
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 10px;
          }
          .emoji-section p:last-child {
            font-size: 28px; 
            margin: 0;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            background-color: #f8f9fa;
            border-top: 3px solid #e67e22;
          }
          .footer p {
            margin: 8px 0;
          }
          .footer-brand {
            font-weight: 600;
            font-size: 16px;
            color: #1a4d7a;
            margin-bottom: 10px;
          }
          .footer-badges {
            color: #666;
            font-size: 14px;
            margin: 10px 0;
          }
          .footer-disclaimer {
            font-size: 11px; 
            color: #999; 
            margin-top: 20px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Reserva Confirmada!</h1>
            <p>Obrigado por escolher a Transfer Fortaleza Tur</p>
          </div>
          
          <div class="content">
            <div class="voucher-box">
              <p class="voucher-label">Número da Reserva</p>
              <div class="voucher-number">#${reservaId.substring(0, 12).toUpperCase()}</div>
              <p class="voucher-note">Guarde este número para referência</p>
            </div>

            <hr class="divider">
            
            <div class="info-box">
              <h3>📋 Detalhes da Reserva</h3>
              <p><strong>Tipo:</strong> ${tipoMap[reserva.tipo]}</p>
              <p><strong>Responsável:</strong> ${reserva.responsavel.nome}</p>
              <p><strong>Passageiros:</strong> ${reserva.quantidades.adultos} adulto(s)${reserva.quantidades.criancas > 0 ? ` + ${reserva.quantidades.criancas} criança(s)` : ''}</p>
              <p><strong>Valor Total:</strong> <span style="color: #27ae60; font-weight: 600;">R$ ${reserva.pagamento.valorTotal.toFixed(2)}</span></p>
            </div>
            
            <div class="highlight-box">
              <h3 style="color: #e67e22; margin: 0 0 12px 0; font-size: 18px;">📎 Voucher em Anexo</h3>
              <p style="margin-bottom: 12px;">Seu voucher está anexado a este email em formato PDF.</p>
              <p><strong style="color: #e67e22;">⚠️ Importante:</strong> Apresente o voucher impresso ou no celular no dia do serviço, juntamente com um documento com foto.</p>
            </div>
            
            <div class="info-box contact-info">
              <h3>📞 Precisa de Ajuda?</h3>
              <p>Nossa equipe está pronta para atendê-lo:</p>
              <p><strong>📱 WhatsApp:</strong> ${process.env.AGENCY_PHONE || '+55 (85) 0000-0000'}</p>
              <p><strong>📧 Email:</strong> ${process.env.AGENCY_EMAIL || 'contato@transferfortalezatur.com.br'}</p>
            </div>
            
            <div class="emoji-section">
              <p>Estamos ansiosos para recebê-lo!</p>
              <p>✈️ 🏖️ � ☀️</p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-brand">Transfer Fortaleza Tur</p>
            <p class="footer-badges">⭐ Google Avaliações 5 Estrelas • Empresa Certificada • Site Blindado 🔒</p>
            <p class="footer-disclaimer">
              Este é um email automático, por favor não responda.<br>
              Para contato, utilize nossos canais oficiais acima.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    envelope: {
      from: fromAddress,
      to: reserva.responsavel.email,
    },
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
