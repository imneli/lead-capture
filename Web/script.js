function updateStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isError ? 'error' : 'success';
}

async function sendToDiscord(result, webhookUrl) {
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
                value: result.website ? `[Clique aqui](${result.website})` : "Não disponível",
                inline: false,
            },
            {
                name: "📍 Google Maps",
                value: result.link ? `[Clique aqui](${result.link})` : "Não disponível",
                inline: false,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: "Informações coletadas via Google Maps",
        },
    };

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

async function processFile() {
    const fileInput = document.getElementById('resultsFile');
    const webhookWithSite = document.getElementById('webhookWithSite').value;
    const webhookWithoutSite = document.getElementById('webhookWithoutSite').value;

    if (!webhookWithSite || !webhookWithoutSite) {
        updateStatus('Por favor, preencha ambas as webhooks URLs!', true);
        return;
    }

    if (!fileInput.files.length) {
        updateStatus('Por favor, selecione o arquivo results.json!', true);
        return;
    }

    try {
        const file = fileInput.files[0];
        const content = await file.text();
        const results = JSON.parse(content);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const webhookUrl = result.website ? webhookWithSite : webhookWithoutSite;

            updateStatus(`Enviando ${i + 1}/${results.length}: ${result.title}`);
            await sendToDiscord(result, webhookUrl);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit delay
        }

        updateStatus('✅ Todos os resultados foram enviados com sucesso!');
    } catch (error) {
        updateStatus(`❌ Erro: ${error.message}`, true);
    }
}