/* ==========================================================================
   interactions.js — magnetic buttons, spotlight cards, contact form.
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});

  /** Buttons drift slightly towards the cursor (fine pointers only). */
  function initMagnetic() {
    if ((P.motion && P.motion.reduced()) || !window.matchMedia("(pointer: fine)").matches) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (node) {
      node.addEventListener("pointermove", function (e) {
        var r = node.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        node.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      node.addEventListener("pointerleave", function () { node.style.translate = ""; });
    });
  }

  /** Cursor-following highlight inside spotlight cards. */
  function initSpotlight() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.querySelectorAll(".spotlight").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /** Contact form — real delivery via Formspree; no fake success states. */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var cfg = (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.config) || {};
    if (!form) return;

    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("formSubmit");
    var label = submitBtn.querySelector("span");

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = "form__status " + (kind || "");
    }
    function setLoading(on) {
      submitBtn.disabled = on;
      label.textContent = on ? "Sending…" : "Send message";
    }
    function mark(input, bad) {
      input.closest(".field").classList.toggle("is-invalid", bad);
      input.setAttribute("aria-invalid", String(bad));
    }

    if (!cfg.formEndpoint) {
      form.hidden = true;     // no backend configured: never show a dead form
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) return;

      var name = form.elements.name, email = form.elements.email, message = form.elements.message;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      mark(name, !name.value.trim());
      mark(email, !emailOk);
      mark(message, !message.value.trim());

      if (!name.value.trim() || !message.value.trim()) { setStatus("Please fill in your name, email and message.", "err"); return; }
      if (!emailOk) { setStatus("That email address doesn’t look right.", "err"); email.focus(); return; }

      setLoading(true);
      setStatus("", "");
      fetch(cfg.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (res) {
          if (!res.ok) throw new Error("Delivery failed");
          form.reset();
          setStatus("Message sent — thank you. I’ll get back to you soon.", "ok");
        })
        .catch(function () {
          setStatus("Something went wrong — please email me directly at " + cfg.fallbackEmail + ".", "err");
        })
        .then(function () { setLoading(false); });
    });
  }

  P.interactions = {
    init: function () { initMagnetic(); initSpotlight(); initContactForm(); }
  };
})();

