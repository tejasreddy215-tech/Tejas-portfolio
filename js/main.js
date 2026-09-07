/* ==========================================================================
   K. Tejas Reddy — Portfolio
   Interactions: scroll reveal, section index, project accordion, contact form.
   ========================================================================== */

/* --------------------------------------------------------------------
   1. CONFIG — put your Formspree endpoint here to receive real emails.
   See README.md for the two-minute setup.
   -------------------------------------------------------------------- */
const CONFIG = {
  // Replace with your own endpoint from https://formspree.io
  // It looks like: "https://formspree.io/f/abcdwxyz"
  FORM_ENDPOINT: "https://formspree.io/f/myeynzjq",
  FALLBACK_EMAIL: "tejasreddy005@gmail.com"
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollReveal();
  initSectionIndex();
  initAccordion();
  initContactForm();
  initMagnetic();
  initSheen();
});

/* --------------------------------------------------------------------
   Magnetic buttons — nudges toward the cursor within a small radius.
   -------------------------------------------------------------------- */
function initMagnetic(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFine = window.matchMedia('(pointer: fine)').matches;
  if (reduced || !isFine) return;

  document.querySelectorAll('.btn').forEach(btn => {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function loop(){
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      btn.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1){
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * 0.25;
      ty = (e.clientY - r.top - r.height / 2) * 0.35;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    btn.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
}

/* --------------------------------------------------------------------
   Sheen — tracks cursor position within .sheen elements for the
   radial-highlight effect defined in CSS.
   -------------------------------------------------------------------- */
function initSheen(){
  const isFine = window.matchMedia('(pointer: fine)').matches;
  if (!isFine) return;

  document.querySelectorAll('.sheen').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* --------------------------------------------------------------------
   Mobile menu
   -------------------------------------------------------------------- */
function initMobileMenu(){
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

/* --------------------------------------------------------------------
   Scroll reveal — clip-path style headings + fade items
   -------------------------------------------------------------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('.clip, .fade');
  const meterTargets = document.querySelectorAll('.meter-fill');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => obs.observe(el));

  const meterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.querySelectorAll('.meter-fill').forEach(fill => {
          fill.style.width = fill.dataset.value + '%';
        });
        meterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skills-grid').forEach(el => meterObs.observe(el));

  // hero runs on load, not on scroll
  document.querySelectorAll('#hero .clip, #hero .fade').forEach(el => {
    requestAnimationFrame(() => el.classList.add('in'));
  });
}

/* --------------------------------------------------------------------
   Left-rail section index — highlights the active section dot
   -------------------------------------------------------------------- */
function initSectionIndex(){
  const dots = document.querySelectorAll('.rail-dot');
  if (!dots.length) return;
  const sections = Array.from(dots).map(d => document.querySelector(d.getAttribute('href')));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sections.indexOf(entry.target);
      if (idx === -1) return;
      if (entry.isIntersecting){
        dots.forEach(d => d.classList.remove('active'));
        dots[idx].classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => { if (s) obs.observe(s); });
}

/* --------------------------------------------------------------------
   Project accordion ("case files")
   -------------------------------------------------------------------- */
function initAccordion(){
  document.querySelectorAll('.case-head').forEach(head => {
    head.addEventListener('click', () => {
      const case_ = head.closest('.case');
      const wasOpen = case_.classList.contains('open');
      document.querySelectorAll('.case.open').forEach(c => c.classList.remove('open'));
      if (!wasOpen) case_.classList.add('open');
    });
  });

  // open the first case by default
  const first = document.querySelector('.case');
  if (first) first.classList.add('open');
}

/* --------------------------------------------------------------------
   Contact form — real backend via Formspree (no server required)
   Submits with fetch as JSON/FormData, shows inline status, degrades
   to a mailto link if the network request fails.
   -------------------------------------------------------------------- */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');
  const submitLabel = submitBtn ? submitBtn.querySelector('span') : null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot spam trap — if filled, silently drop
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message){
      setStatus('Please fill in your name, email and message.', 'err');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setStatus('That email address doesn\u2019t look right.', 'err');
      return;
    }

    if (CONFIG.FORM_ENDPOINT.includes('YOUR_FORM_ID')){
      setStatus('Form backend not connected yet \u2014 see README.md to plug in Formspree.', 'err');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok){
        form.reset();
        setStatus('Message sent \u2014 thank you. I\u2019ll reply within 24 hours.', 'ok');
      } else {
        const data = await res.json().catch(() => null);
        const msg = data && data.errors ? data.errors.map(x => x.message).join(', ') : null;
        throw new Error(msg || 'Delivery failed');
      }
    } catch (err) {
      setStatus(
        `Something went wrong \u2014 please email me directly at ${CONFIG.FALLBACK_EMAIL}`,
        'err'
      );
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading){
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (submitLabel) submitLabel.textContent = isLoading ? 'Sending…' : 'Send message';
  }

  function setStatus(msg, kind){
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status ' + (kind || '');
  }
}
