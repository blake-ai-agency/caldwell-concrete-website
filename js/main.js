/* Caldwell Concrete & Construction — client behavior
   Trivial state only: activeGalleryCategory, lightboxItem, formSent, mobile-menu open. */
(function () {
  'use strict';

  /* ============================================================
     CONFIG — form submission path.
     Create a free form at https://formspree.io, then set:
     FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
     While empty, the form runs in demo mode (validates + shows
     the REQUEST SENT confirmation without sending anything).
     ============================================================ */
  var FORM_ENDPOINT = '';

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

  /* ---------- Gallery filter ---------- */
  var tags = Array.prototype.slice.call(document.querySelectorAll('.filters .tag'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shots .shot'));

  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      tags.forEach(function (t) {
        var active = t === tag;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
      var cat = tag.getAttribute('data-cat');
      shots.forEach(function (s) {
        s.hidden = cat !== 'all' && s.getAttribute('data-cat') !== cat;
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox.querySelector('.lightbox__img');
  var lbLabel = document.getElementById('lightbox-label');
  var lastFocus = null;

  function openLightbox(src, label) {
    lbImg.src = src;
    lbImg.alt = label;
    lbLabel.textContent = label;
    lightbox.hidden = false;
    lightbox.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (shot) {
    shot.addEventListener('click', function () {
      lastFocus = shot;
      var img = shot.querySelector('img');
      openLightbox(img.src, shot.getAttribute('data-label'));
    });
  });

  lightbox.addEventListener('click', closeLightbox);

  /* ---------- Request-sent modal ---------- */
  var modal = document.getElementById('sent-modal');
  var modalCard = modal.querySelector('.modal__card');
  var doneBtn = document.getElementById('sent-done');

  function openModal() {
    modal.hidden = false;
    doneBtn.focus();
  }
  function closeModal() {
    modal.hidden = true;
  }

  modal.addEventListener('click', closeModal);
  modalCard.addEventListener('click', function (e) { e.stopPropagation(); });
  doneBtn.addEventListener('click', closeModal);

  /* Escape closes any open overlay */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lightbox.hidden) closeLightbox();
    if (!modal.hidden) closeModal();
    if (menu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- Estimate form ---------- */
  var form = document.getElementById('estimate-form');
  var errorEl = document.getElementById('form-error');
  var submitBtn = document.getElementById('form-submit');

  function fieldValue(name) {
    return form.elements[name] ? form.elements[name].value.trim() : '';
  }

  /* Clear invalid state as the user types */
  ['name', 'phone'].forEach(function (name) {
    form.elements[name].addEventListener('input', function () {
      this.classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    /* Honeypot — bots fill it, humans never see it */
    if (fieldValue('_gotcha')) return;

    /* Validation: name + phone required */
    var invalid = false;
    ['name', 'phone'].forEach(function (name) {
      var el = form.elements[name];
      var ok = el.value.trim().length > 0;
      el.classList.toggle('is-invalid', !ok);
      if (!ok) invalid = true;
    });
    if (invalid) {
      errorEl.textContent = 'Name and phone are required.';
      errorEl.hidden = false;
      form.querySelector('.is-invalid').focus();
      return;
    }

    /* Demo mode until FORM_ENDPOINT is configured */
    if (!FORM_ENDPOINT) {
      openModal();
      form.reset();
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
        openModal();
        form.reset();
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
