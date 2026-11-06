/* ==========================================================================
   navigation.js — sticky header, scroll progress bar, active-section
   indicator, accessible mobile menu, and back-to-top.
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});

  function initSticky() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      nav.classList.toggle("is-stuck", y > 24);
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var pct = Math.max(0, Math.min(1, y / maxScroll));
      nav.style.setProperty("--scroll", pct.toFixed(4));
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    // Flip the bar to a dark treatment while a dark section sits under it.
    if ("IntersectionObserver" in window) {
      var active = new Set();
      var darkObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) active.add(e.target); else active.delete(e.target); });
        nav.classList.toggle("is-dark", active.size > 0);
      }, { rootMargin: "0px 0px -92% 0px" });
      document.querySelectorAll(".projects, .footer").forEach(function (s) { darkObserver.observe(s); });
    }
  }

  /** Highlights the nav link whose section crosses the middle of the viewport. */
  function initActiveSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
    var sections = document.querySelectorAll("section[data-nav]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = entry.target.getAttribute("data-nav");
        links.forEach(function (a) {
          var on = a.getAttribute("data-nav") === key;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { observer.observe(s); });
  }

  function initMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;
    var closeTimer = 0;

    menu.querySelectorAll("a").forEach(function (a, i) { a.style.setProperty("--i", i); });

    function setOpen(open) {
      clearTimeout(closeTimer);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { menu.classList.add("is-open"); });
        });
        var first = menu.querySelector("a:not([hidden])");
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
      } else {
        menu.classList.remove("is-open");
        closeTimer = setTimeout(function () { menu.hidden = true; }, 750);
      }
    }
    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    toggle.addEventListener("click", function () { setOpen(!isOpen()); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") { setOpen(false); toggle.focus(); return; }
      if (e.key === "Tab") {           // keep focus inside the open menu
        var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a:not([hidden])")));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches && isOpen()) setOpen(false);
    });
  }

  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: P.motion && P.motion.reduced() ? "auto" : "smooth" });
    });
  }

  P.navigation = {
    init: function () { initSticky(); initActiveSection(); initMobileMenu(); initBackToTop(); }
  };
})();
