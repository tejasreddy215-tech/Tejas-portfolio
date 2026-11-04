/* ==========================================================================
   data.js — the ONE place to edit site configuration and project content.
   Loaded first; exposes window.PORTFOLIO_DATA. Plain script (no modules) so
   the site also works when index.html is opened straight from disk.
   ========================================================================== */
window.PORTFOLIO_DATA = {

  /* ---- Site configuration ------------------------------------------- */
  config: {
    // Formspree endpoint for the contact form (see README).
    formEndpoint: "https://formspree.io/f/myeynzjq",
    fallbackEmail: "tejasreddy005@gmail.com",

    // Path to your resume PDF, e.g. "assets/resume.pdf".
    // While this is null, every "Resume" button is hidden automatically.
    resumeUrl: null
  },

  /* ---- Projects ------------------------------------------------------
     Fields:
       id            unique string
       name          project title
       category      short label
       description   one-line summary (cards + orbit panel)
       details       longer description (orbit panel)
       image         thumbnail path (square-ish, ~600x500 works well)
       technologies  array of strings ([] is fine)
       githubUrl     string URL, or null  -> button hidden when null
       liveUrl       string URL, or null  -> button hidden when null
       featured      true / false
       placeholder   true while the entry is only a stand-in
  ---------------------------------------------------------------------- */
  projects: [
    {
      id: "project-01",
      name: "Intelligent Chatbot with LLM",
      category: "AI / Machine Learning",
      description: "A context-aware conversational agent built on large language model architecture.",
      details: "It holds complex, multi-turn dialogue with near-human accuracy and handles edge cases gracefully instead of falling over.",
      image: "assets/images/projects/placeholder-project-01.svg",
      technologies: ["Python", "LLM", "NLP"],
      githubUrl: null,
      liveUrl: null,
      featured: true,
      placeholder: false
    },
    {
      id: "project-02",
      name: "Predictive Analytics Dashboard",
      category: "Data Science",
      description: "An end-to-end data pipeline with ML-powered forecasts and interactive visualisation.",
      details: "It takes raw, messy datasets and turns them into clean, honest charts someone can actually act on.",
      image: "assets/images/projects/placeholder-project-02.svg",
      technologies: ["Python", "DBMS", "JavaScript"],
      githubUrl: null,
      liveUrl: null,
      featured: true,
      placeholder: false
    },
    {
      id: "project-03",
      name: "High-Performance DB Query Engine",
      category: "Systems / Backend",
      description: "A custom query optimiser written in C++ with indexing and transaction management.",
      details: "Indexing, transaction management and ACID compliance — a ground-up exploration of how databases actually behave under the hood.",
      image: "assets/images/projects/placeholder-project-03.svg",
      technologies: ["C++", "DBMS", "Algorithms"],
      githubUrl: null,
      liveUrl: null,
      featured: true,
      placeholder: false
    },
    {
      id: "project-04",
      name: "AI-Powered Learning Platform",
      category: "Full Stack / Web",
      description: "An adaptive learning system that personalises study paths and generates custom quizzes.",
      details: "It flags weak areas early and generates custom quizzes on demand — built to make studying feel a little less like a chore.",
      image: "assets/images/projects/placeholder-project-04.svg",
      technologies: ["JavaScript", "Python", "LLM"],
      githubUrl: null,
      liveUrl: null,
      featured: false,
      placeholder: false
    },
    {
      id: "project-05",
      name: "Project Placeholder 05",
      category: "To be added",
      description: "Project description will be added later.",
      details: "This slot is reserved for an upcoming project. Edit js/data.js to fill it in.",
      image: "assets/images/projects/placeholder-project-05.svg",
      technologies: [],
      githubUrl: null,
      liveUrl: null,
      featured: false,
      placeholder: true
    },
    {
      id: "project-06",
      name: "Project Placeholder 06",
      category: "To be added",
      description: "Project description will be added later.",
      details: "This slot is reserved for an upcoming project. Edit js/data.js to fill it in.",
      image: "assets/images/projects/placeholder-project-06.svg",
      technologies: [],
      githubUrl: null,
      liveUrl: null,
      featured: false,
      placeholder: true
    }
  ]
};
