import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import rateLimit from "axios-rate-limit";

dotenv.config();

// Configurações das webhooks
const WEBHOOK_WITH_WEBSITE = process.env.DISCORD_WEBHOOK_URL_WITH_WEBSITE;
const WEBHOOK_WITHOUT_WEBSITE = process.env.DISCORD_WEBHOOK_URL_WITHOUT_WEBSITE;

// Verificação das variáveis de ambiente
if (!WEBHOOK_WITH_WEBSITE || !WEBHOOK_WITHOUT_WEBSITE) {
  console.error("❌ Configure as webhooks no .env:");
  console.error("DISCORD_WEBHOOK_URL_WITH_WEBSITE");
  console.error("DISCORD_WEBHOOK_URL_WITHOUT_WEBSITE");
  process.exit(1);
}

const http = rateLimit(axios.create(), {
  maxRequests: 30,
  perMilliseconds: 60000,
  maxRPS: 0.5
});

const formatLink = (url, text = "link") => {
  if (!url) return "Não disponível";
  return `[${text}](<${url}>)`;
};

const sendDiscordWebhook = async (result) => {
  try {
    const webhookUrl = result.website ? WEBHOOK_WITH_WEBSITE : WEBHOOK_WITHOUT_WEBSITE;
    const embedColor = result.website ? 0xFF0000 : 0x00FF00;

    const embed = {
      title: result.title || "Sem título",
      description: `Informações sobre **${result.title}**`,
      color: embedColor,
      thumbnail: {
        url: "https://cdn-icons-png.flaticon.com/512/5358/5358640.png",
      },
      fields: [
        {
          name: "📞 Telefone",
          value: result.phone || "Não disponível",
          inline: true,
        },
        {
          name: "📧 E-mail",
          value: result.email || "Não disponível",
          inline: true,
        },
        {
          name: "⭐ Avaliação",
          value: result.stars ? `${result.stars} estrelas` : "Não disponível",
          inline: true,
        },
        {
          name: "📝 Número de avaliações",
          value: result.reviews ? `${result.reviews} avaliações` : "Não disponível",
          inline: true,
        },
        {
          name: "🌐 Website",
          value: formatLink(result.website, "Clique aqui"),
          inline: false,
        },
        {
          name: "📍 Google Maps",
          value: result.link ? formatLink(result.link, "Clique aqui") : "Não disponível",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Informações coletadas via Google Maps",
      },
    };

    await http.post(webhookUrl, { embeds: [embed] });
    console.log(`✅ [${result.website ? 'COM SITE' : 'SEM SITE'}] ${result.title}`);

  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data.retry_after || 5;
      console.log(`⏳ Rate limit atingido, aguardando ${retryAfter}s...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return sendDiscordWebhook(result);
    }
    console.error(`❌ Erro ao enviar ${result.title}: ${error.message}`);
  }
};

const main = async () => {
  try {
    const data = fs.readFileSync("../results.json", "utf-8");
    const results = JSON.parse(data);
    
    if (!results?.length) {
      console.log("❌ Nenhum resultado encontrado");
      return;
    }

    const total = results.length;
    for (const [index, result] of results.entries()) {
      console.log(`📤 Enviando ${index + 1}/${total} - ${result.title}`);
      await sendDiscordWebhook(result);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("✅ Todos os resultados foram processados!");

  } catch (error) {
    console.error("❌ Erro fatal:", error.message);
  }
};

main();