const B2 = require("backblaze-b2");
const multiparty = require("multiparty");
const fs = require("fs");

module.exports = async (req, res) => {
  // Adicionar cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Origin", "https://20buscar.mabelsoft.com.br");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Lidar com requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  console.log("Iniciando upload...");

  const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
  });

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erro ao processar formulário:", err.message);
      return res.status(500).json({ error: "Erro ao processar formulário", details: err.message });
    }

    try {
      await b2.authorize();
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });
      if (!uploadUrlResponse.data) {
        throw new Error("Falha ao obter URL de upload");
      }
      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

      const productId = fields.productId ? fields.productId[0] : "default";
      const uploadedUrls = [];

      if (!files.images || files.images.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      for (const file of files.images) {
        const fileName = `${productId}-${Date.now()}-${file.originalFilename}`;
        const fileContent = fs.readFileSync(file.path);

        const uploadResponse = await b2.uploadFile({
          uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName,
          data: fileContent,
          contentType: file.headers["content-type"] || "image/jpeg",
        });
        if (!uploadResponse.data) {
          throw new Error("Falha no upload do arquivo");
        }

        // URL da imagem com o subdomínio correto
        const imageUrl = `https://imagens.mabelsoft.com.br/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
        uploadedUrls.push(imageUrl);
      }

      res.status(200).json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Erro no upload:", error.message);
      res.status(500).json({ error: "Erro no upload", details: error.message });
    }
  });
};
