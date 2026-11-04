/* ==========================================================================
   animations.js — shared motion helpers: word-split headings, scroll reveals,
   hero cursor parallax and the timeline progress line. No dependencies.
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});
  var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Wrap every word of an element in a masked span so it can rise into view. */
  function splitWords(root) {
    var counter = { n: 0 };
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var mask = document.createElement("span");
            var inner = document.createElement("span");
            mask.className = "w";
            inner.className = "w__i";
            inner.textContent = part;
            inner.style.setProperty("--i", counter.n++);
            mask.appendChild(inner);
            frag.appendChild(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(root);
  }

  function splitHeadings() {
    document.querySelectorAll("[data-split]").forEach(splitWords);
  }

  /** Reveal elements as they enter the viewport (hero is played separately). */
  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal], [data-split]");
    var hero = document.getElementById("home");

    if (reducedQuery.matches || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--delay", k++ * 90 + "ms");
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

    // Clip-path reveals hide the element's own box, so they need a 2px sliver
    // (see animations.css) and a zero-threshold observer to fire reliably.
    var clipObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        clipObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -14% 0px" });

    targets.forEach(function (el) {
      if (hero && hero.contains(el)) return;
      (el.getAttribute("data-reveal") === "clip" ? clipObserver : observer).observe(el);
    });
  }

  /** Staggered hero entrance, called once the preloader has lifted. */
  function playHero() {
    var hero = document.getElementById("home");
    if (!hero) return;
    hero.querySelectorAll("[data-split]").forEach(function (el, line) {
      el.style.setProperty("--base", line * 180 + "ms");
      el.classList.add("is-in");
    });
    hero.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--delay", 300 + i * 110 + "ms");
      el.classList.add("is-in");
    });
  }

  /** Cursor-driven parallax for the hero artwork (fine pointers only). */
  function initHeroParallax() {
    var hero = document.getElementById("home");
    var art = document.getElementById("heroArt");
    if (!hero || !art || reducedQuery.matches || !window.matchMedia("(pointer: fine)").matches) return;

    art.querySelectorAll("[data-depth]").forEach(function (el) {
      el.style.setProperty("--d", el.getAttribute("data-depth"));
    });

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function frame() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      art.style.setProperty("--px", cx.toFixed(4));
      art.style.setProperty("--py", cy.toFixed(4));
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(frame) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
  }

  /** Draw the vertical timeline line as the section scrolls past. */
  function initTimeline() {
    var timeline = document.getElementById("timeline");
    if (!timeline) return;
    var visible = false, ticking = false;

    function update() {
      ticking = false;
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.65 - r.top) / r.height;
      timeline.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    function onScroll() { if (visible && !ticking) { ticking = true; requestAnimationFrame(update); } }

    if (reducedQuery.matches || !("IntersectionObserver" in window)) {
      timeline.style.setProperty("--progress", 1);
      return;
    }
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) update();
    }).observe(timeline);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /** Pause the CSS marquee while it is off-screen. */
  function initMarquee() {
    var marquee = document.querySelector(".marquee");
    if (!marquee || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      marquee.classList.toggle("is-paused", !entries[0].isIntersecting);
    }).observe(marquee);
  }

  P.motion = {
    reduced: function () { return reducedQuery.matches; },
    splitHeadings: splitHeadings,
    initReveals: initReveals,
    playHero: playHero,
    initHeroParallax: initHeroParallax,
    initTimeline: initTimeline,
    initMarquee: initMarquee
  };
})();
