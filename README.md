# K. Tejas Reddy — Portfolio

A hand-built, framework-free portfolio: **HTML + CSS + vanilla JavaScript**, no framework migration, no runtime build step required for deployment. Deploy the repository root directly to GitHub Pages.

Live URL (GitHub Pages): https://tejasreddy215-tech.github.io/Tejas-portfolio/

```
Tejas-portfolio/
├── index.html                   # all page content (SEO-friendly, semantic)
├── robots.txt · sitemap.xml
├── src/
│   └── dither-veil.js           # readable vanilla-JS port of React Bits <DitherVeil />
├── assets/
│   └── images/
│       ├── paper-texture.jpg    # seamless tile built from the supplied crumpled-paper reference
│       ├── showcase.svg         # artwork used by the DitherVeil section
│       ├── og-image.jpg         # 1200x630 social preview
│       ├── favicon.svg
│       └── projects/            # thumbnails (placeholder-project-XX.svg for now)
├── css/
│   ├── style.css                # design tokens, base, layout, every section
│   ├── animations.css           # preloader, reveals, marquee, keyframes, reduced-motion
│   └── responsive.css           # breakpoints (1100 / 900 / 640 / 400)
├── js/
│   ├── data.js                  # ★ projects + site config — the file you edit most
│   ├── animations.js            # word-split text, scroll reveals, hero parallax, timeline line
│   ├── navigation.js            # sticky bar, active link, accessible mobile menu
│   ├── dither.js                # mounts DitherVeil, lazy-loads bundle, CSS fallback
│   ├── dither-veil.bundle.js    # built bundle: DitherVeil port + ogl (66 KB, lazy-loaded)
│   ├── orbit.js                 # OrbitImages elliptical 3D gallery
│   ├── projects.js              # detail panel + cards, wired to the orbit
│   ├── interactions.js          # magnetic buttons, spotlight cards, contact form
│   └── main.js                  # boot sequence + preloader
└── LICENSES/
    └── NOTICE.md                # third-party notices & license documentation
```

## What Changed vs. What Was Preserved

* **Preserved:** All verified copy (name, bio, degree, NIAT institution, Pondicherry location, focus areas, the four project descriptions), contact details (`tejasreddy005@gmail.com`), social links (GitHub, LinkedIn), the Formspree contact form (`https://formspree.io/f/myeynzjq`) + `_gotcha` honeypot, the "Python for intelligence…" marquee strip, and GitHub Pages root-folder deployment compatibility.
* **Redesigned & Added:**
  * Paper-and-ink editorial visual identity derived directly from your supplied crumpled-paper reference (`#F3EDE2` paper cream, `#E8DFD1` parchment, `#211E1A` charcoal ink, `#B86F4B` terracotta, `#A98A61` bronze, `#211F1D` deep charcoal contrast sections).
  * Editorial typography pairing `Cormorant Garamond`, `Inter`, and `JetBrains Mono` with responsive `clamp()` scaling.
  * All 12 requested sections: Preloader, Navigation, Hero with interactive layered emblem, About Me, Technical Skills, DitherVeil Visual Showcase, OrbitImages Project Showcase + Card Grid, Experience/Journey Timeline, Education, Marquee Strip, Contact, and Footer.
* **Removed on purpose (unverifiable claims):** Unverified skill percentage meters (92%, 88%, etc.) and unverified technologies not present in your original portfolio. Only technologies verified in your existing portfolio (`Python`, `C++`, `JavaScript`, `DBMS & SQL`, `NoSQL`, `Machine Learning`, `Neural Networks`, `NLP`, `LLMs & Applied AI`, `Data Structures`, `Algorithms`, `REST APIs`, `Git & GitHub`, `Problem Solving`, `Data Analysis`) are displayed.

## Libraries and Why Each Was Selected

| Library / Component | Used? | Why |
|---|---|---|
| React Bits **DitherVeil** | **Yes** (vanilla port of your supplied TS+CSS source) | Ported 1:1 from React hooks/refs to a plain JS factory (`src/dither-veil.js`) preserving all WebGL2 shaders, true Floyd-Steinberg & Atkinson serpentine error diffusion, blue noise, Bayer/engraving patterns, ping-pong render-target trail masks, and click shockwave bursts. Bundled with `ogl` into `js/dither-veil.bundle.js` and lazy-loaded only when scrolling near the showcase. |
| **ogl** (`v1.0.11`) | **Yes** (bundled, Unlicense) | Required dependency of `DitherVeil` (`Renderer`, `Program`, `Mesh`, `Triangle`, `Texture`, `RenderTarget`). |
| React Bits **OrbitImages** | **Yes** (vanilla implementation) | Implemented in `js/orbit.js` with elliptical 3D depth (`depth: 0.6`, `rotation: -8 deg`, `duration: 30s`), continuous rotation, hover enlargement, pointer drag/swipe with inertia, click-to-front tweening, keyboard arrow navigation, and intro expansion. |
| GSAP / Motion / Lenis | **No** | All split-text word reveals, scroll-triggered reveals, hero parallax, magnetic buttons, spotlight cards, and timeline drawing are implemented in ~350 lines of clean vanilla JS + CSS using `IntersectionObserver` and `requestAnimationFrame` — zero main-thread bloat. |
| Google Fonts | **Yes** | `Cormorant Garamond`, `Inter`, and `JetBrains Mono` (SIL Open Font License 1.1). |

## How to Edit Content Later

### 1. Add or Update Projects (`js/data.js`)
Open `js/data.js` and edit `window.PORTFOLIO_DATA.projects`. Each entry supports:
```js
{
  id: "project-01",
  name: "Project Name",
  category: "AI / Machine Learning",
  description: "Short summary shown on cards.",
  details: "Detailed description shown when selected in the orbit gallery.",
  image: "assets/images/projects/your-screenshot.jpg",
  technologies: ["Python", "LLM", "NLP"],
  githubUrl: null, // set to "https://github.com/..." or leave null to hide button
  liveUrl: null,   // set to "https://..." or leave null to hide button
  featured: true,
  placeholder: false
}
```
When `githubUrl` or `liveUrl` is `null`, the corresponding link button is automatically omitted so visitors never hit broken or fake links.

### 2. Replace Images
* **Project thumbnails:** Place 600x500 JPG/PNG/WebP/SVG images in `assets/images/projects/` and update the `image` path in `js/data.js`.
* **DitherVeil showcase image:** Replace `assets/images/showcase.svg` or change the `src` attribute on `#veilImg` in `index.html`.
* **Profile portrait:** In `index.html` inside `#about`, replace `<div class="portrait">...</div>` with `<img class="portrait" src="assets/images/profile.jpg" alt="K. Tejas Reddy">`.

### 3. Enable the Resume Button
Place your PDF at `assets/resume.pdf` and set `resumeUrl: "assets/resume.pdf"` in `js/data.js`. Every Resume button in the navigation, mobile menu, and hero will automatically unhide and link to it.

### 4. Update Personal Information, Experience & Education
* Edit text directly in `index.html`.
* In `#experience` and `#education`, items marked with class `is-placeholder` are clearly labelled editable placeholders — replace their text with your verified milestones and remove the `is-placeholder` class.
* If you want to add more skills (`React`, `Node.js`, `Vercel`, `Supabase`, etc.), add `<li>` chips inside `#skills` in `index.html`.

### 5. Rebuild the DitherVeil Bundle (Only if Editing `src/dither-veil.js`)
The prebuilt `js/dither-veil.bundle.js` is committed and ready for GitHub Pages. If you ever modify `src/dither-veil.js`, rebuild it with:
```bash
npx esbuild src/dither-veil.js --bundle --minify --format=iife --target=es2019 --outfile=js/dither-veil.bundle.js
```

## Deploying to GitHub Pages

1. Commit and push all files to the `main` branch.
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose **`main`** and **`/ (root)`**, and click **Save**.
4. For local preview, serve the folder over HTTP so WebGL can read image pixels without CORS restrictions:
   ```bash
   python -m http.server 8000
   ```
