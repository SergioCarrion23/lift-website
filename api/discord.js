const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1481476406037840058/s2BjeP9nNOhMlCYfvNTdJYLK1hM8PoMYPSO0DBezHBRaa9wapfhGoj3VekGnJbHwVyXT';

export default async function handler(req, res) {
  console.log('Method:', req.method);
  
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

  console.log('Body received:', body);
  
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

  console.log('Sending to Discord:', discordBody);

  try {
    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody),
    });

    console.log('Discord response:', response.status);
    
    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.log('Discord error:', errorText);
      return res.status(500).json({ error: 'Discord webhook failed', details: errorText });
    }
  } catch (err) {
    console.log('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
