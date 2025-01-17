const puppeteer = require('puppeteer');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('results.json', 'utf-8'));

// lembrando que o número de telefone deve ser digitado no formato +55DDDNumero, e outra, use por conta e risco, você tem chance de ser banido do WhatsApp Web por spam. 
// Então recomendo usar a versão para desenvolvedores do WhatsApp, o WhatsApp Business API, que é paga, mas é mais segura.

async function enviarMensagemWhatsApp(phone, message) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://web.whatsapp.com');
  console.log('Escaneie o QR Code do WhatsApp Web no navegador.');

  await page.waitForSelector('div[data-tab="3"]', { visible: true, timeout: 60000 });

  await page.click('div[data-tab="3"]');
  await page.type('div[data-tab="3"]', phone);
  await page.waitForTimeout(2000); 
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000); 

  const messageBoxSelector = 'div[data-tab="10"]';
  await page.waitForSelector(messageBoxSelector, { visible: true });
  await page.click(messageBoxSelector);
  await page.type(messageBoxSelector, message);
  await page.keyboard.press('Enter');

  console.log(`Mensagem enviada para ${phone}: ${message}`);

  await browser.close();
}

async function enviarMensagensAutomaticas() {
  for (const estabelecimento of data) {
    if (estabelecimento.phone) {
      const mensagem = `Olá, ${estabelecimento.title}! Sou um desenvolvedor autônomo e faço projetos Freelance, ofereço serviços de criação de sites profissionais e sistemas web para empresas, gostaria de saber se tem interesse, tenho portfolio de alguns sistemas que já programei, caso queira saber mais aguardo alguma resposta, obrigado!`;
      await enviarMensagemWhatsApp(estabelecimento.phone, mensagem);
      await new Promise((resolve) => setTimeout(resolve, 10000)); 
    }
  }
}

enviarMensagensAutomaticas().catch(console.error);