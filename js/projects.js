/* ==========================================================================
   projects.js — renders the project detail panel and card grid from
   PORTFOLIO_DATA.projects and connects them to the orbit gallery.
   GitHub / Live Demo buttons only appear when a real URL exists.
   ========================================================================== */
(function () {
  "use strict";
  var P = (window.Portfolio = window.Portfolio || {});

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isUrl(value) { return typeof value === "string" && /^https?:\/\//i.test(value.trim()); }

  function init() {
    var data = window.PORTFOLIO_DATA;
    var stage = document.getElementById("orbitStage");
    var cardsEl = document.getElementById("projectCards");
    var detail = document.getElementById("projectDetail");
    if (!data || !data.projects || !data.projects.length || !stage || !cardsEl || !detail) return;

    var projects = data.projects;
    var total = String(projects.length).padStart(2, "0");
    var reduced = P.motion ? P.motion.reduced() : false;
    var detailImg = document.getElementById("detailImg");
    var detailCat = document.getElementById("detailCat");
    var detailName = document.getElementById("detailName");
    var detailDesc = document.getElementById("detailDesc");
    var detailTags = document.getElementById("detailTags");
    var detailLinks = document.getElementById("detailLinks");
    var orbitCounter = document.getElementById("orbitCounter");
    var prevBtn = document.getElementById("orbitPrev");
    var nextBtn = document.getElementById("orbitNext");
    var swapTimer = 0;
    var cardButtons = [];

    /* ---------- cards ---------- */
    projects.forEach(function (p, i) {
      var numStr = String(i + 1).padStart(2, "0");
      var li = el("li");
      var btn = el("button", "card" + (p.placeholder ? " is-placeholder" : ""));
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Select project " + numStr + ": " + p.name);

      var imgWrap = el("span", "card__img");
      var img = document.createElement("img");
      img.src = p.image; img.alt = ""; img.width = 600; img.height = 500;
      img.loading = "lazy"; img.decoding = "async";
      imgWrap.appendChild(img);

      var metaRow = el("span", "card__meta");
      metaRow.appendChild(el("span", "card__num mono", numStr));
      metaRow.appendChild(el("span", "card__cat mono", p.category || ""));

      btn.appendChild(imgWrap);
      btn.appendChild(metaRow);
      btn.appendChild(el("span", "card__name", p.name));
      btn.appendChild(el("span", "card__desc", p.description || ""));

      if (p.technologies && p.technologies.length) {
        var chipRow = el("span", "card__tags");
        p.technologies.forEach(function (t) { chipRow.appendChild(el("span", "mono", t)); });
        btn.appendChild(chipRow);
      }

      btn.addEventListener("click", function () {
        orbit.select(i, true);
        if (!reduced) detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      li.appendChild(btn);
      cardsEl.appendChild(li);
      cardButtons.push(btn);
    });

    var count = document.getElementById("projectCount");
    if (count) {
      var ph = projects.filter(function (p) { return p.placeholder; }).length;
      count.textContent = projects.length + " entries" + (ph ? " · " + ph + " open slot" + (ph > 1 ? "s" : "") : "");
    }

    /* ---------- detail panel ---------- */
    function fill(p, idx) {
      var numStr = String(idx + 1).padStart(2, "0");
      detailImg.src = p.image;
      detailImg.alt = p.placeholder ? "Placeholder thumbnail for " + p.name : "Thumbnail for " + p.name;
      detailCat.textContent = numStr + " / " + total + " · " + (p.featured ? "Featured · " : "") + (p.category || "Project");
      detailName.textContent = p.name;
      detailDesc.textContent = [p.description, p.details].filter(Boolean).join(" ");

      if (orbitCounter) orbitCounter.textContent = numStr + " / " + total;

      detailTags.textContent = "";
      (p.technologies || []).forEach(function (t) { detailTags.appendChild(el("li", "", t)); });
      detailTags.hidden = !(p.technologies && p.technologies.length);

      detailLinks.textContent = "";
      var hasLink = false;
      [["GitHub repository", p.githubUrl], ["Live demo", p.liveUrl]].forEach(function (pair) {
        if (!isUrl(pair[1])) return;
        hasLink = true;
        var a = el("a", "btn btn--light btn--small");
        a.href = pair[1]; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.appendChild(el("span", "", pair[0] + " ↗"));
        a.setAttribute("aria-label", pair[0] + " for " + p.name + " (opens in a new tab)");
        detailLinks.appendChild(a);
      });
      if (!hasLink) {
        detailLinks.appendChild(el("p", "detail__note mono", p.placeholder ? "Reserved project slot — edit js/data.js" : "Repository & live demo links will be added soon"));
      }
    }

    function show(p, i) {
      cardButtons.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      clearTimeout(swapTimer);
      if (reduced || !detail.dataset.ready) { fill(p, i); detail.dataset.ready = "1"; return; }
      detail.classList.add("is-swapping");
      swapTimer = setTimeout(function () { fill(p, i); detail.classList.remove("is-swapping"); }, 240);
    }

    var orbit = P.orbit.create(stage, projects, show, {
      duration: 30, depth: 0.6, rotation: -8, intro: true, draggable: true, clickToFront: true
    });

    if (prevBtn) prevBtn.addEventListener("click", function () { orbit.selectRelative(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { orbit.selectRelative(1); });

    var firstFeatured = projects.findIndex(function (p) { return p.featured; });
    orbit.select(firstFeatured >= 0 ? firstFeatured : 0, false);
  }

  P.projects = { init: init };
})();
