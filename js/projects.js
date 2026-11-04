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
    var reduced = P.motion ? P.motion.reduced() : false;
    var detailImg = document.getElementById("detailImg");
    var detailCat = document.getElementById("detailCat");
    var detailName = document.getElementById("detailName");
    var detailDesc = document.getElementById("detailDesc");
    var detailTags = document.getElementById("detailTags");
    var detailLinks = document.getElementById("detailLinks");
    var swapTimer = 0;
    var cardButtons = [];

    /* ---------- cards ---------- */
    projects.forEach(function (p, i) {
      var li = el("li");
      var btn = el("button", "card");
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Show details for " + p.name);

      var imgWrap = el("span", "card__img");
      var img = document.createElement("img");
      img.src = p.image; img.alt = ""; img.width = 600; img.height = 500;
      img.loading = "lazy"; img.decoding = "async";
      imgWrap.appendChild(img);

      btn.appendChild(imgWrap);
      btn.appendChild(el("span", "card__cat mono", p.category || ""));
      btn.appendChild(el("span", "card__name", p.name));
      btn.appendChild(el("span", "card__desc", p.description || ""));
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
      count.textContent = projects.length + " entries" + (ph ? " · " + ph + " placeholder" + (ph > 1 ? "s" : "") : "");
    }

    /* ---------- detail panel ---------- */
    function fill(p) {
      detailImg.src = p.image;
      detailImg.alt = p.placeholder ? "Placeholder thumbnail for " + p.name : "Thumbnail for " + p.name;
      detailCat.textContent = (p.featured ? "Featured · " : "") + (p.category || "Project");
      detailName.textContent = p.name;
      detailDesc.textContent = [p.description, p.details].filter(Boolean).join(" ");

      detailTags.textContent = "";
      (p.technologies || []).forEach(function (t) { detailTags.appendChild(el("li", "", t)); });
      detailTags.hidden = !(p.technologies && p.technologies.length);

      detailLinks.textContent = "";
      var hasLink = false;
      [["GitHub", p.githubUrl], ["Live demo", p.liveUrl]].forEach(function (pair) {
        if (!isUrl(pair[1])) return;
        hasLink = true;
        var a = el("a", "btn btn--light btn--small");
        a.href = pair[1]; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.appendChild(el("span", "", pair[0] + " ↗"));
        a.setAttribute("aria-label", pair[0] + " for " + p.name + " (opens in a new tab)");
        detailLinks.appendChild(a);
      });
      if (!hasLink) detailLinks.appendChild(el("p", "detail__note mono", "Links will be added soon"));
    }

    function show(p, i) {
      cardButtons.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      clearTimeout(swapTimer);
      if (reduced || !detail.dataset.ready) { fill(p); detail.dataset.ready = "1"; return; }
      detail.classList.add("is-swapping");
      swapTimer = setTimeout(function () { fill(p); detail.classList.remove("is-swapping"); }, 260);
    }

    var orbit = P.orbit.create(stage, projects, show, {
      duration: 30, depth: 0.6, rotation: -8, intro: true, draggable: true, clickToFront: true
    });

    var firstFeatured = projects.findIndex(function (p) { return p.featured; });
    orbit.select(firstFeatured >= 0 ? firstFeatured : 0, false);
  }

  P.projects = { init: init };
})();

