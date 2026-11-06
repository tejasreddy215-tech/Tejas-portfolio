/* ==========================================================================
   main.js — boot sequence: preloader, then each module. Each module is
   initialised defensively so one failure can never blank the page.
   ========================================================================== */
(function () {
  "use strict";
  var P = window.Portfolio = window.Portfolio || {};
  var root = document.documentElement;
  var cfg = (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.config) || {};

  function safe(fn, label) {
    try { fn(); } catch (err) { console.warn("[portfolio] " + label + " failed:", err); }
  }

  function initResume() {
    var hasPdf = typeof cfg.resumeUrl === "string" && cfg.resumeUrl.trim().length > 0;
    document.querySelectorAll("[data-resume]").forEach(function (a) {
      a.hidden = false;
      if (hasPdf) {
        a.href = cfg.resumeUrl;
        a.target = "_blank";
        a.rel = "noopener";
      } else {
        a.href = "#contact";
        a.addEventListener("click", function (e) {
          var contact = document.getElementById("contact");
          var subj = document.getElementById("subject");
          var nameInput = document.getElementById("name");
          var status = document.getElementById("formStatus");
          if (contact) {
            e.preventDefault();
            contact.scrollIntoView({ behavior: P.motion && P.motion.reduced() ? "auto" : "smooth" });
          }
          if (subj && !subj.value) subj.value = "Resume Request — K. Tejas Reddy";
          if (status) {
            status.textContent = "Resume PDF is being updated — send a quick note below and I’ll share the latest copy.";
            status.className = "form__status ok";
          }
          if (nameInput) setTimeout(function () { nameInput.focus({ preventScroll: true }); }, 550);
        });
      }
    });
  }

  /** Short branded preloader: progress follows real loading, 1.1s minimum. */
  function runPreloader(done) {
    var pre = document.getElementById("preloader");
    var bar = document.getElementById("preloaderBar");
    var num = document.getElementById("preloaderCount");
    if (!pre || (P.motion && P.motion.reduced())) {
      if (pre) pre.hidden = true;
      done();
      return;
    }

    root.classList.add("is-loading");
    var MIN = 1000, CAP = 3200, start = performance.now(), loaded = false, shown = 0, finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove("is-loading");
      pre.classList.add("is-done");
      setTimeout(function () { pre.hidden = true; }, 1050);
      setTimeout(done, 320);
    }
    function markLoaded() { loaded = true; }

    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var pageLoaded = new Promise(function (res) {
      if (document.readyState === "complete") res(); else window.addEventListener("load", res, { once: true });
    });
    Promise.all([fontsReady, pageLoaded]).then(markLoaded, markLoaded);

    (function tick(now) {
      var elapsed = now - start;
      var target = (loaded || elapsed > CAP) ? Math.min(1, elapsed / MIN) : Math.min(0.9, elapsed / MIN);
      shown += (target - shown) * 0.18;
      bar.style.transform = "scaleX(" + shown.toFixed(3) + ")";
      num.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      if ((loaded || elapsed > CAP) && elapsed >= MIN && shown > 0.985) {
        bar.style.transform = "scaleX(1)"; num.textContent = "100";
        finish();
      } else {
        requestAnimationFrame(tick);
      }
    })(performance.now());
  }

  function boot() {
    window.__portfolioReady = true;
    safe(initResume, "resume");
    safe(P.motion.splitHeadings, "split text");
    safe(P.navigation.init, "navigation");
    safe(P.motion.initReveals, "reveals");
    safe(P.motion.initTimeline, "timeline");
    safe(P.motion.initMarquee, "marquee");
    safe(P.motion.initHeroParallax, "hero parallax");
    safe(P.projects.init, "projects");
    safe(function () { P.dither.init(); }, "dither veil");
    safe(P.interactions.init, "interactions");
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    runPreloader(function () { safe(P.motion.playHero, "hero"); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
