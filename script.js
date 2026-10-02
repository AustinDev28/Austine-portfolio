/* ============================================================
   Moses Austin — Portfolio script
   ============================================================ */

/* --- Contact form settings ---
   Option A: paste a Formspree (or similar) endpoint to receive messages.
   Option B: leave it empty and the form opens the visitor's email app instead. */
// Lets the CSS hide .reveal elements only when JavaScript is running
document.documentElement.classList.add("js");

const FORM_ENDPOINT = "";            // e.g. "https://formspree.io/f/xxxxxxx"
const CONTACT_EMAIL = "kehindem495@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  const links     = document.querySelectorAll(".nav-link");

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
  };

  hamburger.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  // Close the menu after choosing a link, or pressing Escape
  links.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Navbar style once the page scrolls ---------- */
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Highlight the nav link for the section in view ---------- */
  const sectionIds = ["home", "about", "skills", "projects", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle("active", l.dataset.nav === entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }   // fires when a section crosses mid-screen
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const reveal = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => reveal.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Contact form ---------- */
  const form   = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const fields = {
    name: {
      el: document.getElementById("name"),
      err: document.getElementById("nameError"),
      check: (v) => (v.length < 2 ? "Enter your name." : ""),
    },
    email: {
      el: document.getElementById("email"),
      err: document.getElementById("emailError"),
      check: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address.",
    },
    subject: {
      el: document.getElementById("subject"),
      err: document.getElementById("subjectError"),
      check: (v) => (v.length < 3 ? "Enter a subject." : ""),
    },
    message: {
      el: document.getElementById("message"),
      err: document.getElementById("messageError"),
      check: (v) => (v.length < 10 ? "Write at least 10 characters." : ""),
    },
  };

  const validateField = (f) => {
    const msg = f.check(f.el.value.trim());
    f.err.textContent = msg;
    f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };

  Object.values(fields).forEach((f) => {
    f.el.addEventListener("blur", () => validateField(f));
    f.el.addEventListener("input", () => {
      if (f.err.textContent) validateField(f);   // clear the error as they fix it
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    const results = Object.values(fields).map(validateField);
    if (results.includes(false)) {
      const firstBad = Object.values(fields).find((f) => f.el.getAttribute("aria-invalid") === "true");
      firstBad.el.focus();
      return;
    }

    const data = {
      name:    fields.name.el.value.trim(),
      email:   fields.email.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim(),
    };

    // Option B: no endpoint set -> open the visitor's email app, pre-filled
    if (!FORM_ENDPOINT) {
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app to send the message.";
      return;
    }

    // Option A: send to the form service
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    status.textContent = "Sending…";

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      form.reset();
      status.textContent = "Message sent. I'll reply soon.";
    } catch (err) {
      status.textContent = `Couldn't send the message. Email me directly at ${CONTACT_EMAIL}.`;
    } finally {
      button.disabled = false;
    }
  });
});