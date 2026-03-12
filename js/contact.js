/**
 * Formulario de contacto: validación básica + envío a WhatsApp y Discord (webhook).
 */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const cfg = window.LIFT_CONTACT || {};
  const whatsappPhone = (cfg.whatsappPhone || '').replace(/[^\d]/g, '');
  const discordWebhookUrl = (cfg.discordWebhookUrl || '').trim();

  function showError(input, message) {
    let el = input.parentElement.querySelector('.error');
    if (!el) {
      el = document.createElement('span');
      el.className = 'error';
      input.parentElement.appendChild(el);
    }
    el.textContent = message;
  }

  function showInfo(message) {
    let el = form.querySelector('.success');
    if (!el) {
      el = document.createElement('p');
      el.className = 'success';
      form.appendChild(el);
    }
    el.textContent = message;
  }

  function clearError(input) {
    const el = input.parentElement.querySelector('.error');
    if (el) el.remove();
  }

  function buildSummary(payload) {
    const lines = [
      'Nuevo formulario Lift',
      '',
      `Nombre: ${payload.name}`,
      `Correo: ${payload.email}`,
      `Temas: ${payload.topics}`,
      `Mensaje: ${payload.message}`,
      '',
      `Página: ${payload.page}`,
      `Fecha: ${payload.timestamp}`,
    ];
    return lines.join('\n');
  }

  function openWhatsApp(summary) {
    if (!whatsappPhone) return false;
    const url = `https://wa.me/${encodeURIComponent(whatsappPhone)}?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  async function sendDiscord(payload, summary) {
    if (!discordWebhookUrl) return { ok: false, skipped: true };

    const body = {
      content: summary,
      embeds: [
        {
          title: 'Nuevo formulario Lift',
          color: 0x7c3aed,
          fields: [
            { name: 'Nombre', value: payload.name || '-', inline: true },
            { name: 'Correo', value: payload.email || '-', inline: true },
            { name: 'Temas', value: payload.topics || '-', inline: false },
            { name: 'Mensaje', value: payload.message || '-', inline: false },
            { name: 'Página', value: payload.page || '-', inline: false },
          ],
          footer: { text: payload.timestamp },
        },
      ],
    };

    const res = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return { ok: res.ok, status: res.status };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const topics = form.querySelector('#contact-topics');
    const message = form.querySelector('#contact-message');

    [name, email, topics, message].forEach(clearError);

    let valid = true;
    if (!name.value.trim()) {
      showError(name, 'Escribe tu nombre.');
      valid = false;
    }
    if (!email.value.trim()) {
      showError(email, 'Escribe tu correo.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Correo no válido.');
      valid = false;
    }
    if (!topics.value.trim()) {
      showError(topics, 'Cuéntanos qué temas te gustaría tratar.');
      valid = false;
    }
    if (!message.value.trim()) {
      showError(message, 'Escribe un mensaje.');
      valid = false;
    }

    if (!valid) return;

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      topics: topics.value.trim(),
      message: message.value.trim(),
      page: window.location.href,
      timestamp: new Date().toLocaleString('es-AR'),
    };

    const summary = buildSummary(payload);

    const waOpened = openWhatsApp(summary);
    if (!waOpened) {
      showInfo('Enviado localmente. Falta configurar WhatsApp (ver `js/contact-config.js`).');
    } else {
      showInfo('Abriendo WhatsApp para enviar el mensaje…');
    }

    // Enviar a Discord en segundo plano (si está configurado)
    sendDiscord(payload, summary)
      .then((r) => {
        if (r && r.skipped) return;
        if (r && r.ok) {
          showInfo('Listo: WhatsApp + Discord.');
          form.reset();
          return;
        }
        showInfo('WhatsApp listo. Discord no pudo enviarse: revisa el webhook en `js/contact-config.js`.');
      })
      .catch(() => {
        showInfo('WhatsApp listo. Discord no pudo enviarse: revisa el webhook en `js/contact-config.js`.');
      });
  });
})();
