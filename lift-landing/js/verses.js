/**
 * Versículos: carga data/verses.json, verso del día (por fecha), grid, "Descubre otro verso", copiar.
 */
(function () {
  let verses = [];
  let currentVerseIndex = 0;

  const verseOfDayRef = document.getElementById('verse-of-day-ref');
  const verseOfDayText = document.getElementById('verse-of-day-text');
  const verseCard3d = document.getElementById('verse-card-3d');
  const verseGrid = document.getElementById('verse-grid');
  const btnRandom = document.getElementById('btn-random-verse');
  const btnCopy = document.getElementById('btn-copy-verse');

  function getVerseOfDayIndex() {
    if (!verses.length) return 0;
    const start = new Date(2025, 0, 1);
    const now = new Date();
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return days % verses.length;
  }

  function setVerseOfDay(verse) {
    if (!verseOfDayRef || !verseOfDayText) return;
    verseOfDayRef.textContent = verse.reference;
    verseOfDayText.textContent = verse.text;
  }

  function showRandomVerse() {
    if (!verses.length) return;
    currentVerseIndex = Math.floor(Math.random() * verses.length);
    setVerseOfDay(verses[currentVerseIndex]);
    if (verseCard3d) verseCard3d.classList.add('flipped');
  }

  function copyCurrentVerse() {
    const ref = verseOfDayRef ? verseOfDayRef.textContent : '';
    const text = verseOfDayText ? verseOfDayText.textContent : '';
    if (!ref && !text) return;
    const full = ref ? `${ref}\n${text}` : text;
    navigator.clipboard.writeText(full).then(() => {
      if (btnCopy) {
        const label = btnCopy.textContent;
        btnCopy.textContent = '¡Copiado!';
        setTimeout(() => { btnCopy.textContent = label; }, 1500);
      }
    }).catch(() => {});
  }

  function renderGrid() {
    if (!verseGrid || !verses.length) return;
    verseGrid.innerHTML = verses.slice(0, 9).map(v => `
      <article class="verse-card">
        <cite class="verse-ref">${escapeHtml(v.reference)}</cite>
        <blockquote class="verse-text">${escapeHtml(v.text)}</blockquote>
      </article>
    `).join('');
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function init() {
    fetch('data/verses.json')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        verses = Array.isArray(data) ? data : (data.verses || []);
        if (!verses.length) return;

        currentVerseIndex = getVerseOfDayIndex();
        setVerseOfDay(verses[currentVerseIndex]);

        if (verseCard3d) {
          var inner = verseCard3d.querySelector('.verse-card-inner');
          verseCard3d.addEventListener('click', function () {
            this.classList.toggle('flipped');
            if (inner) inner.style.transform = '';
          });
          verseCard3d.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.classList.toggle('flipped');
              if (inner) inner.style.transform = '';
            }
          });
          if (inner) {
            verseCard3d.addEventListener('mousemove', function (e) {
              if (this.classList.contains('flipped')) return;
              var rect = this.getBoundingClientRect();
              var x = (e.clientX - rect.left) / rect.width - 0.5;
              var y = (e.clientY - rect.top) / rect.height - 0.5;
              inner.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
            });
            verseCard3d.addEventListener('mouseleave', function () {
              if (!this.classList.contains('flipped')) inner.style.transform = '';
            });
          }
        }
        if (btnRandom) btnRandom.addEventListener('click', showRandomVerse);
        if (btnCopy) btnCopy.addEventListener('click', copyCurrentVerse);

        renderGrid();
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
