// Configuración de envíos del formulario de contacto.
// Nota: en un sitio estático, este archivo queda público (incluye el webhook).
// Si necesitas ocultarlo, conviene enviar a un backend / función serverless.

window.LIFT_CONTACT = {
  // Ejemplo: "5491122334455" (código país + número, sin + ni espacios).
  // Tu número venía como 0999333741 (EC). Se convierte a 593 + 999333741.
  whatsappPhone: "593999333741",

  // URL del webhook de Discord (crear en el canal → Integraciones → Webhooks).
  // Ejemplo: "https://discord.com/api/webhooks/...."
  discordWebhookUrl: "/api/discord",
};

