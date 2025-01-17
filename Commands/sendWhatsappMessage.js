const twilio = require('twilio');
const data = require('../results.json');

const accountSid = 'SUA_ACCOUNT_SID'; 
const authToken = 'SEU_AUTH_TOKEN';
const client = new twilio(accountSid, authToken);

function sendMessage(telefone, mensagem) {
  client.messages.create({
    body: mensagem,
    to: `+55${telefone}`,  
    from: 'SEU_NUMERO_TWILIO'  
  })
  .then((message) => console.log(`Mensagem enviada para ${telefone}: ${message.sid}`))
  .catch((err) => console.error(`Erro ao enviar mensagem para ${telefone}:`, err));
}

function sendAutomaticMessages() {
  data.forEach(estabelecimento => {
    if (estabelecimento.phone) {
      const mensagem = `Olá, ${estabelecimento.title}! Oferecemos serviços de criação de sites profissionais. Gostaria de saber mais? Visite nosso site ou responda esta mensagem.`;
      sendMessage(estabelecimento.phone, mensagem);
    }
  });
}

sendAutomaticMessages();