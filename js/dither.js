/* ==========================================================================
   dither.js — mounts the React Bits DitherVeil (vanilla port, see
   src/dither-veil.js) inside #veilStage.

   - The 66 KB bundle (port + ogl) is fetched only when the section is near
     the viewport.
   - If the remote Unsplash image fails to load, retries automatically with
     the local cached copy (assets/images/showcase.jpg).
   - If WebGL2 is missing or context is lost, a CSS-mask fallback reveals
     colour under the cursor instead.
   - Wires optional pattern/palette controls ([data-dither-pattern],
     [data-dither-palette]) to instance.update().
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});

  var BUNDLE = "js/dither-veil.bundle.js";
  var LOCAL_FALLBACK_SRC = "assets/images/showcase.jpg";

  function loadBundle() {
    return new Promise(function (resolve, reject) {
      if (P.createDitherVeil) return resolve();
      var s = document.createElement("script");
      s.src = BUNDLE;
      s.async = true;
      s.onload = function () { P.createDitherVeil ? resolve() : reject(new Error("bundle missing export")); };
      s.onerror = function () { reject(new Error("bundle failed to load")); };
      document.head.appendChild(s);
    });
  }

  function init() {
    var veil = document.getElementById("veil");
    var stage = document.getElementById("veilStage");
    var img = document.getElementById("veilImg");
    if (!veil || !stage || !img) return null;

    var reduced = P.motion ? P.motion.reduced() : false;
    var coarse = window.matchMedia("(hover: none)").matches;
    var hint = document.getElementById("veilHintText");
    if (hint) hint.textContent = coarse ? "Touch & drag to reveal" : "Move to reveal · click to ripple";

    var instance = null, destroyed = false, triedLocal = false;

    veil.addEventListener("pointerdown", function () { veil.classList.add("is-touched"); }, { passive: true });
    veil.addEventListener("pointermove", function () { veil.classList.add("is-touched"); }, { passive: true });

    function enableFallback() {
      if (instance) { instance.destroy(); instance = null; }
      if (veil.classList.contains("is-fallback")) return;
      veil.classList.remove("is-webgl");
      veil.classList.add("is-fallback");
      stage.hidden = true;
      var color = document.createElement("img");
      color.className = "veil__color";
      color.alt = "";
      color.setAttribute("aria-hidden", "true");
      color.decoding = "async";
      color.src = img.currentSrc || img.src;
      veil.insertBefore(color, stage);
      veil.addEventListener("pointermove", function (e) {
        var r = veil.getBoundingClientRect();
        veil.style.setProperty("--vx", e.clientX - r.left + "px");
        veil.style.setProperty("--vy", e.clientY - r.top + "px");
      }, { passive: true });
      veil.addEventListener("pointerleave", function () {
        veil.style.setProperty("--vx", "-999px"); veil.style.setProperty("--vy", "-999px");
      });
    }

    function mountWithSrc(srcUrl) {
      if (destroyed) return;
      if (instance) { instance.destroy(); instance = null; }
      var radius = veil.clientWidth < 640 ? 120 : 200;
      try {
        instance = P.createDitherVeil(stage, {
          src: srcUrl,
          fit: "cover",
          pattern: "floyd",
          palette: "duotone",
          pixelSize: 2,
          inkColor: "#120f17",
          paperColor: "#f4f1ea",
          revealRadius: radius,
          softness: 0.6,
          linger: reduced ? 0.15 : 1,
          clickBurst: !reduced,
          onReady: function () { veil.classList.add("is-webgl"); },
          onError: function () {
            if (!triedLocal && srcUrl !== LOCAL_FALLBACK_SRC) {
              triedLocal = true;
              img.src = LOCAL_FALLBACK_SRC;
              mountWithSrc(LOCAL_FALLBACK_SRC);
            } else {
              enableFallback();
            }
          }
        });
      } catch (err) {
        enableFallback();
      }
    }

    /* ---------- interactive pattern / palette toolbar ---------- */
    document.querySelectorAll("[data-dither-pattern]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pat = btn.getAttribute("data-dither-pattern");
        document.querySelectorAll("[data-dither-pattern]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        if (instance) instance.update({ pattern: pat });
      });
    });

    document.querySelectorAll("[data-dither-palette]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pal = btn.getAttribute("data-dither-palette");
        document.querySelectorAll("[data-dither-palette]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        if (instance) instance.update({ palette: pal });
      });
    });

    function start() {
      loadBundle().then(function () {
        mountWithSrc(img.currentSrc || img.src || LOCAL_FALLBACK_SRC);
      }).catch(enableFallback);
    }

    function destroy() {
      destroyed = true;
      if (instance) { instance.destroy(); instance = null; }
    }
    window.addEventListener("pagehide", destroy);

    if ("IntersectionObserver" in window) {
      var gate = new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { obs.disconnect(); start(); }
      }, { rootMargin: "600px" });
      gate.observe(veil);
    } else {
      enableFallback();
    }
    return { destroy: destroy };
  }

  P.dither = { init: init };
})();
