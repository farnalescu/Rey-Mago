document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const isOpen = header.classList.contains('open');

    header.classList.toggle('open');
    body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
  });
});

const FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/formResponse';
const FORM_ENTRY_ID = 'entry.REPLACE_WITH_ENTRY_ID';

document.getElementById('enviar-btn').addEventListener('click', () => {
  const input = document.getElementById('mensaje');
  const estado = document.getElementById('mensaje-estado');
  const texto = input.value.trim();

  if (!texto) return;

  fetch(FORM_ACTION_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ [FORM_ENTRY_ID]: texto })
  });

  input.value = '';
  estado.textContent = '¡Mensaje enviado!';
  setTimeout(() => { estado.textContent = ''; }, 3000);
});
