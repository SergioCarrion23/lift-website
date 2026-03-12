const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1481476406037840058/s2BjeP9nNOhMlCYfvNTdJYLK1hM8PoMYPSO0DBezHBRaa9wapfhGoj3VekGnJbHwVyXT';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, page, timestamp } = req.body;

  const body = {
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
        footer: { text: timestamp },
      },
    ],
  };

  const response = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(500).json({ error: 'Discord webhook failed' });
  }
}
