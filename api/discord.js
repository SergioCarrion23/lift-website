const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1481523450630897739/x9v9yCanaJ6v4dCZaqK1sWEl4PmeZAgC3Ik-8WO6wm_daqZ_panaOEGCPWec4bv-E5D6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  const { name, email, message, page, timestamp } = body;

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

  const response = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordBody),
  });

  if (response.ok) {
    return res.status(200).json({ success: true });
  } else {
    const errorText = await response.text();
    return res.status(500).json({ error: 'Discord webhook failed', details: errorText });
  }
}
