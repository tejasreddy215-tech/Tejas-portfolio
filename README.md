# Tejas Reddy — Portfolio

A static three-file site (`index.html`, `css/style.css`, `js/main.js`) — no build step, no server required. You can open `index.html` directly in a browser, or deploy it anywhere that hosts static files (GitHub Pages, Netlify, Vercel).

```
tejas-portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── README.md
```

## Getting real emails from the contact form (2 minutes)

The contact form needs a place to deliver messages to, since a static site has no server of its own to send mail from. This project uses **Formspree** — a free service built exactly for this, no backend code required.

1. Go to **[formspree.io](https://formspree.io)** and sign up (free tier is enough — 50 submissions/month).
2. Click **New Form**, name it something like "Portfolio contact," and set the destination to your email: `tejasreddy005@gmail.com`.
3. Formspree gives you an endpoint that looks like:
   `https://formspree.io/f/abcdwxyz`
4. Open `js/main.js` and replace the placeholder at the top:
   ```js
   const CONFIG = {
     FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz", // ← paste your real endpoint
     FALLBACK_EMAIL: "tejasreddy005@gmail.com"
   };
   ```
5. Save, then submit the form once yourself — Formspree sends a one-time confirmation email to activate the form. Click confirm, and you're live.

From then on, every message a recruiter sends through the form lands directly in your inbox, with their name, email, subject and message included. No dashboard login needed — it's just email.

**Spam protection:** the form already includes a hidden honeypot field (`_gotcha`) that Formspree recognizes automatically to filter out bots, plus basic client-side validation.

**Alternative — EmailJS:** if you'd rather send straight from the browser via your own Gmail account (more setup, more control over the email template), EmailJS is a solid alternative. Swap the `fetch()` call in `initContactForm()` inside `js/main.js` for the EmailJS SDK call instead. Formspree is the simpler path and is what's wired up by default.

## Deploying it

Any of these work with zero config, since it's plain HTML/CSS/JS:

- **GitHub Pages:** push this folder to a repo, enable Pages in repo settings, point it at the root.
- **Netlify / Vercel:** drag-and-drop the `tejas-portfolio` folder into their dashboard, or connect the repo.

## Editing content

- Copy, roles, and project descriptions live in `index.html`.
- Colors, fonts, and spacing are all defined as CSS variables at the top of `css/style.css` under `:root`.
- Skill percentages: change the `data-value` attribute on each `.meter-fill` div.
