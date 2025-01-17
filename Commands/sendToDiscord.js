import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import rateLimit from "axios-rate-limit";

dotenv.config();

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
 console.error("❌ A URL da webhook do Discord não foi configurada no arquivo .env.");
 process.exit(1);
}

const http = rateLimit(axios.create(), {
 maxRequests: 30,
 perMilliseconds: 60000, 
 maxRPS: 0.5,
});

const formatLink = (url, text = "link") => {
 if (!url) return "Não disponível";
 return `[${text}](<${url}>)`;
};

const sendDiscordWebhook = async (result) => {
 
 const embedColor = !result.website ? 0x00FF00 : 0x2B82EA;

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
       value: result.link ? formatLink(`${result.link}`, "Clique aqui") : "Não disponível",
       inline: false,
     },
   ],
   timestamp: new Date().toISOString(),
   footer: {
     text: "Informações coletadas via Google Maps",
   },
 };

 try {
   await http.post(WEBHOOK_URL, {
     embeds: [embed],
   });
   console.log(`✅ Webhook enviado para: ${result.title}`);
 } catch (error) {
   if (error.response?.status === 429) {
     const retryAfter = error.response.data.retry_after || 5;
     console.log(`⏳ Rate limit atingido, aguardando ${retryAfter}s...`);
     await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
     return sendDiscordWebhook(result);
   }
   console.error(`❌ Erro ao enviar webhook para: ${result.title}`, error.message);
 }
};

const main = async () => {
 try {
   const data = fs.readFileSync("../results.json", "utf-8");
   const results = JSON.parse(data);

   if (!results || results.length === 0) {
     console.log("❌ Nenhum resultado encontrado no arquivo results.json.");
     return;
   }

   for (const result of results) {
     await sendDiscordWebhook(result);
     await new Promise((resolve) => setTimeout(resolve, 2000));
   }

   console.log("✅ Todos os resultados foram enviados para o Discord.");
 } catch (error) {
   console.error("❌ Erro ao processar o arquivo results.json:", error.message);
 }
};

main();