/**
 * Formulario de contacto: validación básica. Envío vía action (Formspree/Netlify o #).
 */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(input, message) {
    let el = input.parentElement.querySelector('.error');
    if (!el) {
      el = document.createElement('span');
      el.className = 'error';
      input.parentElement.appendChild(el);
    }
    el.textContent = message;
  }

  function clearError(input) {
    const el = input.parentElement.querySelector('.error');
    if (el) el.remove();
  }

  function showSuccess(message) {
    let el = form.querySelector('.success');
    if (!el) {
      el = document.createElement('p');
      el.className = 'success';
      form.appendChild(el);
    }
    el.textContent = message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const message = form.querySelector('#contact-message');

    [name, email, message].forEach(clearError);

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
    if (!message.value.trim()) {
      showError(message, 'Escribe un mensaje.');
      valid = false;
    }

    if (!valid) return;

    if (form.action && form.action !== '#' && !form.action.startsWith('javascript:')) {
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then(r => r.json())
        .then(() => {
          showSuccess('Mensaje enviado. Te contactaremos pronto.');
          form.reset();
        })
        .catch(() => {
          showSuccess('Gracias. Si no usas Formspree/Netlify, configura el action del formulario.');
          form.reset();
        });
    } else {
      showSuccess('Gracias. Para recibir mensajes, configura Formspree o Netlify Forms en el action del formulario.');
      form.reset();
    }
  });
})();
