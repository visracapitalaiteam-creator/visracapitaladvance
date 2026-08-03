/* =========================================================
   Visra Capital Group — interactions
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header: solid on scroll ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- scroll reveal ---------- */
  // NOTE: the hero is above the fold — it gets a pure-CSS entrance instead of
  // JS reveal, so it's never hidden on load (avoids the blank-hero flash).
  const revealTargets = [
    [".section-head", 0],
    [".contact__intro", 0], [".contact__formwrap", 1],
    [".footer__grid", 0],
  ];
  const groups = [".tenet", ".service", ".intel-card", ".focus-card"];

  const toReveal = new Set();
  revealTargets.forEach(([sel, d]) =>
    document.querySelectorAll(sel).forEach((el) => { el.dataset.delay = String(d); toReveal.add(el); })
  );
  groups.forEach((sel) =>
    document.querySelectorAll(sel).forEach((el, i) => { el.dataset.delay = String(i % 4); toReveal.add(el); })
  );
  toReveal.forEach((el) => el.classList.add("reveal"));

  if (prefersReduced || !("IntersectionObserver" in window)) {
    toReveal.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    toReveal.forEach((el) => io.observe(el));
  }

  /* ---------- contact form validation ---------- */
  const form = document.getElementById("contact-form");
  if (!form) return;
  const success = document.getElementById("form-success");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    name: (v) => v.trim().length >= 2 || "Please enter your full name.",
    email: (v) => (v.trim() === "" ? "Please enter your email." : emailRe.test(v.trim()) || "Please enter a valid email address."),
    message: (v) => v.trim().length >= 10 || "Please tell us a little more (at least 10 characters).",
  };

  const validateField = (input) => {
    const rule = validators[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const field = input.closest(".field");
    const err = field.querySelector(".field__err");
    if (result === true) {
      field.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
      return true;
    }
    field.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    if (err) err.textContent = result;
    return false;
  };

  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("is-invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (input && !validateField(input)) { ok = false; firstInvalid = firstInvalid || input; }
    });
    if (!ok) { if (firstInvalid) firstInvalid.focus(); return; }

    // no backend — simulate a successful submit
    form.querySelectorAll("input, textarea, select, button").forEach((el) => (el.disabled = true));
    success.hidden = false;
    success.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    setTimeout(() => {
      form.reset();
      form.querySelectorAll("input, textarea, select, button").forEach((el) => (el.disabled = false));
    }, 600);
  });
})();
