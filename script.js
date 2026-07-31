/* ==========================================================================
   Moses Austin Portfolio — script.js
   Organized into logical sections. Comments explain the "why", not just
   the "what", so this is easy to follow for learning purposes.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     ------------------------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu whenever a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     2. ACTIVE NAVIGATION HIGHLIGHTING WHILE SCROLLING
     ------------------------------------------------------------------
     We use IntersectionObserver on each <section> to know which one is
     currently in the viewport, then mark the matching nav link active.
  */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkMap = new Map();
  document.querySelectorAll('.nav-link').forEach((link) => {
    navLinkMap.set(link.dataset.nav, link);
  });

  // Map real section ids to the nav-link data-nav key
  const sectionToNavKey = (id) => (id === 'home-section' ? 'home' : id);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const navKey = sectionToNavKey(entry.target.id);
          const activeLink = navLinkMap.get(navKey);
          if (activeLink) {
            document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
            activeLink.classList.add('active');
          }
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 } // Trigger around the middle of the viewport
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ------------------------------------------------------------------
     3. SMOOTH SCROLLING
     ------------------------------------------------------------------
     CSS `scroll-behavior: smooth` already handles this for same-page
     anchor links, so no extra JS is required. This section is kept as
     a placeholder in case a smooth-scroll polyfill is ever needed for
     older browsers.
  */

  /* ------------------------------------------------------------------
     4. SCROLL-TO-TOP BUTTON
     ------------------------------------------------------------------ */
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ------------------------------------------------------------------
     Elements with the `.reveal` class start hidden (see CSS) and fade
     / slide into place the first time they enter the viewport.
  */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target); // Animate once, then stop watching
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     6. ANIMATED PROGRESS BARS (Currently Learning section)
     ------------------------------------------------------------------
     Fill each bar to its target width only once it scrolls into view,
     so the animation feels intentional rather than happening off-screen.
  */
  const progressBars = document.querySelectorAll('.progress-fill');

  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.dataset.progress;
          bar.style.width = `${targetWidth}%`;
          progressObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );

  progressBars.forEach((bar) => progressObserver.observe(bar));

  /* ------------------------------------------------------------------
     7. CONTACT FORM VALIDATION
     ------------------------------------------------------------------
     Simple, dependency-free validation. Real submission would need a
     backend or a form service (e.g. Formspree) wired up to the `action`
     attribute; here we simulate a successful send.
  */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: (value) => value.trim().length >= 2,
      message: 'Please enter your name (at least 2 characters).',
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: 'Please enter a valid email address.',
    },
    subject: {
      input: document.getElementById('subject'),
      error: document.getElementById('subjectError'),
      validate: (value) => value.trim().length >= 3,
      message: 'Please enter a subject (at least 3 characters).',
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: (value) => value.trim().length >= 10,
      message: 'Please write a message (at least 10 characters).',
    },
  };

  function validateField(field) {
    const value = field.input.value;
    const isValid = field.validate(value);
    field.error.textContent = isValid ? '' : field.message;
    field.input.closest('.form-group').classList.toggle('invalid', !isValid);
    return isValid;
  }

  // Validate as the user types/leaves a field, for immediate feedback
  Object.values(fields).forEach((field) => {
    field.input.addEventListener('blur', () => validateField(field));
    field.input.addEventListener('input', () => {
      if (field.input.closest('.form-group').classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const allValid = Object.values(fields)
      .map((field) => validateField(field))
      .every(Boolean);

    if (!allValid) {
      formStatus.textContent = 'Please fix the highlighted fields above.';
      formStatus.className = 'form-status error';
      return;
    }

    // Simulated send (no backend wired up in this template)
    formStatus.textContent = 'Thanks! Your message has been sent.';
    formStatus.className = 'form-status success';
    contactForm.reset();
  });

  /* ------------------------------------------------------------------
     8. CURRENT YEAR IN FOOTER
     ------------------------------------------------------------------ */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     9. DOWNLOAD CV FUNCTIONALITY
     ------------------------------------------------------------------
     The button already points to files/Moses_Austin_CV.pdf with a
     `download` attribute, so the browser handles the download natively.
     This listener just gives quick visual confirmation to the user.
  */
  const downloadCvBtn = document.getElementById('downloadCvBtn');
  downloadCvBtn.addEventListener('click', () => {
    downloadCvBtn.textContent = 'Downloading…';
    setTimeout(() => {
      downloadCvBtn.textContent = 'Download CV';
    }, 1500);
  });

  /* ------------------------------------------------------------------
     10. THEME-READY STRUCTURE (for future enhancements)
     ------------------------------------------------------------------
     Colors are defined as CSS custom properties in :root (see style.css).
     To add a light/dark toggle later: create a `.theme-light` class with
     overridden variables, then toggle it on <body> and persist the
     choice (e.g. in localStorage) here.
  */
  const themeConfig = {
    current: 'dark',
    // Example of how a future toggle could hook in:
    // setTheme(themeName) { document.body.className = `theme-${themeName}`; }
  };
  window.__themeConfig = themeConfig; // Exposed for future use, not required now

});