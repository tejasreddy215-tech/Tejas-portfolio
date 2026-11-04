/* ==========================================================================
   orbit.js — "Orbit Images": project thumbnails travelling along a tilted
   ellipse with depth (items pass behind and in front of the centre text).
   Original vanilla implementation inspired by the React Bits OrbitImages
   behaviour: continuous rotation, 3D-style depth, hover enlargement, drag /
   swipe with inertia, click-to-front, intro animation, responsive radii.

   Animates only transform/opacity, only while on screen, never when the
   tab is hidden, and not at all (beyond user input) with reduced motion.
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});
  var TAU = Math.PI * 2;

  var DEFAULTS = {
    duration: 30,          // seconds per full revolution
    depth: 0.6,            // 0 = flat, 1 = strong size/opacity falloff
    rotation: -8,          // ellipse tilt in degrees
    intro: true,
    draggable: true,
    clickToFront: true
  };

  function wrapPi(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function create(stage, projects, onSelect, options) {
    var o = Object.assign({}, DEFAULTS, options || {});
    var reduced = P.motion ? P.motion.reduced() : false;
    var n = projects.length;
    var step = TAU / n;
    var tilt = o.rotation * Math.PI / 180;
    var baseSpeed = reduced ? 0 : TAU / o.duration;       // rad / s

    var angle = 0, vel = 0, W = 0, H = 0, rx = 0, ry = 0;
    var selected = -1, tween = null, holdUntil = 0, hovering = false;
    var dragging = false, dragMoved = false, dragStartX = 0, lastX = 0, lastMoveT = 0, pointerId = null;
    var introStart = null, introDone = !o.intro || reduced;
    var raf = 0, onScreen = false, lastT = 0, destroyed = false;
    var items = [];

    /* ---------- build DOM ---------- */
    projects.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "orbit__item";
      btn.setAttribute("aria-label", p.name + (p.placeholder ? " (placeholder)" : "") + " — show details");
      btn.setAttribute("aria-pressed", "false");
      var face = document.createElement("span");
      face.className = "orbit__face";
      var img = document.createElement("img");
      img.src = p.image;
      img.alt = "";
      img.width = 120; img.height = 120;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      face.appendChild(img);
      btn.appendChild(face);
      btn.addEventListener("click", function () {
        if (dragMoved) return;
        select(i, true);
      });
      btn.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovering = true; } });
      btn.addEventListener("pointerleave", function () { hovering = false; });
      stage.appendChild(btn);
      items.push(btn);
    });

    /* ---------- layout ---------- */
    function measure() {
      var r = stage.getBoundingClientRect();
      W = r.width; H = r.height;
      var size = parseFloat(getComputedStyle(stage).getPropertyValue("--item")) || 96;
      rx = Math.max(60, Math.min(W * 0.4, W / 2 - size * 0.85));
      ry = Math.max(40, Math.min(H * 0.36, H / 2 - size * 0.9));
      render();
    }

    function render() {
      var intro = introDone ? 1 : easeOut(Math.min(1, (introStart === null ? 0 : (performance.now() - introStart) / 1500)));
      var cos = Math.cos(tilt), sin = Math.sin(tilt);
      for (var i = 0; i < n; i++) {
        var a = angle + i * step;
        var x = Math.cos(a) * rx * intro;
        var y = Math.sin(a) * ry * intro;
        var d = (Math.sin(a) + 1) / 2;                      // 0 = back, 1 = front
        var X = x * cos - y * sin;
        var Y = x * sin + y * cos;
        var scale = (1 - o.depth * 0.6 * (1 - d)) * 1.15 * (0.6 + 0.4 * intro);
        var el = items[i];
        el.style.transform = "translate3d(" + X.toFixed(2) + "px," + Y.toFixed(2) + "px,0) scale(" + scale.toFixed(3) + ")";
        el.style.opacity = ((1 - o.depth * 0.55 * (1 - d)) * intro).toFixed(3);
        el.style.zIndex = d > 0.5 ? 3 : 1;
      }
    }

    /* ---------- selection ---------- */
    function select(i, bring) {
      if (i < 0 || i >= n) return;
      var changed = i !== selected;
      selected = i;
      items.forEach(function (el, k) {
        el.classList.toggle("is-selected", k === i);
        el.setAttribute("aria-pressed", String(k === i));
      });
      if (bring && o.clickToFront) {
        var delta = wrapPi(Math.PI / 2 - (angle + i * step));
        if (reduced) { angle += delta; render(); }
        else { tween = { from: angle, delta: delta, t0: performance.now(), dur: 900 }; vel = 0; }
        holdUntil = performance.now() + 3500;
        kick();
      }
      if (changed && onSelect) onSelect(projects[i], i);
    }

    function selectRelative(dir) { select((selected + dir + n) % n, true); }

    /* ---------- loop ---------- */
    function frame(now) {
      raf = 0;
      if (destroyed || !onScreen || document.hidden) return;
      var dt = Math.min(0.05, (now - (lastT || now)) / 1000);
      lastT = now;

      if (!introDone) {
        if (introStart === null) introStart = now;
        if (now - introStart > 1500) introDone = true;
      }

      if (tween) {
        var t = Math.min(1, (now - tween.t0) / tween.dur);
        angle = tween.from + tween.delta * easeInOut(t);
        if (t >= 1) tween = null;
      } else if (!dragging) {
        var auto = (hovering || now < holdUntil) ? 0 : baseSpeed;
        angle += (auto + vel) * dt;
        vel *= Math.exp(-dt * 2.6);
        if (Math.abs(vel) < 0.001) vel = 0;
      }
      render();

      var needsFrame = !introDone || tween || dragging || vel !== 0 || (baseSpeed !== 0 && !hovering && now >= holdUntil);
      if (needsFrame || (baseSpeed !== 0)) raf = requestAnimationFrame(frame);
      else lastT = 0;
    }

    function kick() { if (!raf && onScreen && !destroyed) raf = requestAnimationFrame(frame); }

    /* ---------- drag / swipe ---------- */
    function down(e) {
      if (!o.draggable || (e.pointerType === "mouse" && e.button !== 0)) return;
      pointerId = e.pointerId;
      dragging = true; dragMoved = false;
      dragStartX = lastX = e.clientX; lastMoveT = performance.now();
      tween = null; vel = 0;
    }
    function move(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - lastX;
      if (!dragMoved && Math.abs(e.clientX - dragStartX) > 6) {
        dragMoved = true;
        stage.classList.add("is-dragging");
        try { stage.setPointerCapture(pointerId); } catch (err) { /* ignore */ }
      }
      if (!dragMoved) return;
      var now = performance.now(), dt = Math.max(1, now - lastMoveT) / 1000;
      var dA = -dx / rx;
      angle += dA;
      vel = vel * 0.6 + (dA / dt) * 0.4;
      lastX = e.clientX; lastMoveT = now;
      holdUntil = now + 1200;
      render();
    }
    function up(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (dragMoved) {
        vel = Math.max(-8, Math.min(8, vel));
        if (performance.now() - lastMoveT > 90) vel = 0;       // finger rested before release
        setTimeout(function () { dragMoved = false; }, 0);     // swallow the click that follows a drag
        kick();
      }
      try { stage.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }
    }

    function key(e) {
      if (e.key === "ArrowRight") { e.preventDefault(); selectRelative(1); focusItem(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); selectRelative(-1); focusItem(); }
    }
    function focusItem() { if (items[selected] && document.activeElement && stage.contains(document.activeElement)) items[selected].focus({ preventScroll: true }); }

    if (o.draggable) {
      stage.addEventListener("pointerdown", down);
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerup", up);
      stage.addEventListener("pointercancel", up);
    }
    stage.addEventListener("keydown", key);

    /* ---------- visibility ---------- */
    var io = new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) {
        if (!introDone && introStart === null) introStart = performance.now();
        lastT = 0; kick();
      } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.05 });
    io.observe(stage);
    var ro = new ResizeObserver(measure);
    ro.observe(stage);
    function onVis() { if (!document.hidden) { lastT = 0; kick(); } }
    document.addEventListener("visibilitychange", onVis);

    measure();
    if (!introDone) render();            // start collapsed at the centre

    function destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("keydown", key);
    }
    window.addEventListener("pagehide", destroy);

    return { select: select, destroy: destroy };
  }

  P.orbit = { create: create };
})();
