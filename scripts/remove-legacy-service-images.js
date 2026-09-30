const fs = require('fs');
const path = require('path');

/**
 * Script de limpeza das imagens locais legadas da seção de serviços.
 *
 * As três imagens abaixo foram substituídas pelas versões do Cloudinary
 * (f_auto,q_auto:eco), que pesam ~30-90 KiB em vez de ~1,4 MB cada.
 * Elas não são mais referenciadas pelo código, mas continuavam sendo
 * baixadas porque o fallback do componente as citava.
 *
 * Execute uma vez: node scripts/remove-legacy-service-images.js
 */
const LEGACY_IMAGES = [
  'aviaoservico.png',
  'jericoaquaraservico.png',
  'fortalezacityservico.png'
];

const PUBLIC_DIR = path.resolve(__dirname, '../public');

function main() {
  let removed = 0;
  let missing = 0;

  LEGACY_IMAGES.forEach((fileName) => {
    const filePath = path.join(PUBLIC_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`[cleanup] já ausente: public/${fileName}`);
      missing += 1;
      return;
    }

    const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);
    fs.unlinkSync(filePath);
    console.log(`[cleanup] removido: public/${fileName} (${sizeKb} KiB liberados)`);
    removed += 1;
  });

  console.log(`[cleanup] Removidos: ${removed} | Já ausentes: ${missing}`);
  console.log('[cleanup] Concluído. As imagens do Cloudinary continuam sendo usadas pela home.');
}

main();
