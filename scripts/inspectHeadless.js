const fs = require('fs');
const path = require('path');

async function findChromeExecutable() {
  const envPaths = [process.env.CHROME, process.env.CHROME_PATH, process.env.CHROMIUM_PATH].filter(Boolean);
  for (const p of envPaths) {
    if (!p) continue;
    try {
      await fs.promises.access(p);
      return p;
    } catch (e) {}
  }

  const platform = process.platform;
  const candidates = [];
  if (platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chrome.exe'
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else {
    candidates.push('/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium');
  }

  for (const p of candidates) {
    try {
      await fs.promises.access(p);
      return p;
    } catch (e) {}
  }
  return null;
}

async function main() {
  const base = 'https://transferfortalezatur.com.br';
  const urls = [base + '/', base + '/avaliacoes'];

  const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  let browser;

  try {
    const chromePath = await findChromeExecutable();
    let puppeteerPkg = null;

    try {
      // prefer puppeteer-core when we have a local chrome
      const pCore = require('puppeteer-core');
      if (chromePath) {
        console.log('Usando puppeteer-core com Chrome local em:', chromePath);
        browser = await pCore.launch(Object.assign({}, launchOptions, { executablePath: chromePath }));
      } else {
        // no local chrome — try full puppeteer
        try {
          puppeteerPkg = require('puppeteer');
          console.log('Nenhum Chrome local encontrado — usando `puppeteer` (Chromium bundulado) como fallback.');
          browser = await puppeteerPkg.launch(launchOptions);
        } catch (e) {
          console.error('Nenhum Chrome local encontrado e `puppeteer` não está instalado.');
          console.error('Instale um Chrome/Chromium local ou execute `npm install puppeteer` e tente novamente.');
          process.exit(2);
        }
      }
    } catch (e) {
      // puppeteer-core not installed; try puppeteer
      try {
        puppeteerPkg = require('puppeteer');
        console.log('Usando `puppeteer` (Chromium bundulado).');
        browser = await puppeteerPkg.launch(launchOptions);
      } catch (err) {
        console.error('Nem `puppeteer-core` nem `puppeteer` estão disponíveis. Instale um deles.');
        process.exit(2);
      }
    }

    await runWithBrowser(browser, urls);
  } catch (err) {
    console.error('Error during headless inspection:', err);
    process.exitCode = 2;
  } finally {
    if (browser) await browser.close();
  }
}

async function runWithBrowser(browserInstance, urlsList) {
  for (const url of urlsList) {
    const page = await browserInstance.newPage();
    page.setDefaultNavigationTimeout(60000);
    console.log(`\n===== URL: ${url} =====`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const headHTML = await page.evaluate(() => {
      const head = document.head ? document.head.innerHTML : '';
      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      return { title, description, canonical, robots, ogImage, head: head.slice(0, 10000) };
    });

    console.log(JSON.stringify(headHTML, null, 2));
    await page.close();
  }
}

main();
