exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, message, page, timestamp } = body;

  const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1481523450630897739/x9v9yCanaJ6v4dCZaqK1sWEl4PmeZAgC3Ik-8WO6wm_daqZ_panaOEGCPWec4bv-E5D6';

  const discordBody = {
    embeds: [
      {
        title: 'Nuevo formulario Lift',
        color: 0x7c3aed,
        fields: [
          { name: 'Nombre', value: name || '-', inline: true },
          { name: 'Correo', value: email || '-', inline: true },
          { name: 'Mensaje', value: message || '-', inline: false },
          { name: 'Página', value: page || '-', inline: false },
        ],
        footer: { text: timestamp || new Date().toISOString() },
      },
    ],
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody),
    });

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      const errorText = await response.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'Discord webhook failed', details: errorText }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
