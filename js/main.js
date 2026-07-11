/* Caldwell Concrete & Construction — "Monolith" client behavior
   State: formSent, film-strip scroll (DOM), reveal-on-scroll, mobile menu. */
(function () {
  'use strict';

  /* ============================================================
     CONFIG — form submission path.
     Create a free form at https://formspree.io, then set:
     FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
     While empty, the form runs in demo mode (validates + shows
     the confirmation without sending anything).
     ============================================================ */
  var FORM_ENDPOINT = '';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Gate reveal styles on JS availability (no-JS users see everything) */
  document.documentElement.classList.add('js');

  /* ---------- Scroll reveals ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('on'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });

  menu.querySelectorAll('a').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- Film strip ---------- */
  var strip = document.getElementById('filmstrip');
  var CARD = 440 + 4; /* card width + gap */

  function scrollStrip(dir) {
    strip.scrollBy({ left: dir * CARD * 2, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  document.getElementById('strip-prev').addEventListener('click', function () { scrollStrip(-1); });
  document.getElementById('strip-next').addEventListener('click', function () { scrollStrip(1); });

  /* ---------- Estimate form ---------- */
  var form = document.getElementById('estimate-form');
  var fields = document.getElementById('form-fields');
  var success = document.getElementById('form-success');
  var errorEl = document.getElementById('form-error');
  var submitBtn = document.getElementById('form-submit');

  var required = ['name', 'phone', 'details'];

  required.forEach(function (name) {
    form.elements[name].addEventListener('input', function () {
      this.classList.remove('is-invalid');
    });
  });

  function showSuccess() {
    fields.hidden = true;
    success.hidden = false;
    success.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    /* Honeypot — bots fill it, humans never see it */
    if (form.elements['_gotcha'].value) return;

    /* Validation: name, phone, details required */
    var invalid = false;
    required.forEach(function (name) {
      var el = form.elements[name];
      var ok = el.value.trim().length > 0;
      el.classList.toggle('is-invalid', !ok);
      if (!ok) invalid = true;
    });
    if (invalid) {
      errorEl.textContent = 'Name, phone, and job details are required.';
      errorEl.hidden = false;
      form.querySelector('.is-invalid').focus();
      return;
    }

    /* Demo mode until FORM_ENDPOINT is configured */
    if (!FORM_ENDPOINT) {
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('send failed');
        showSuccess();
      })
      .catch(function () {
        errorEl.textContent = 'Something went wrong. Call or text (636) 200-7548 instead.';
        errorEl.hidden = false;
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
})();
