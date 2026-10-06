/* =========================================================
   Visra Capital Group — interactions
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- text the script itself produces, per page language ---------- */
  const isArabic = (document.documentElement.lang || "").toLowerCase().startsWith("ar");
  const T = isArabic
    ? {
        openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة",
        nameErr: "يرجى إدخال اسمك الكامل.",
        emailEmpty: "يرجى إدخال بريدك الإلكتروني.",
        emailBad: "يرجى إدخال بريد إلكتروني صحيح.",
        messageErr: "يرجى إخبارنا بالمزيد (١٠ أحرف على الأقل).",
        hub: "دبي",
        subject: "استفسار خاص",
        fName: "الاسم", fCompany: "الشركة / المكتب العائلي", fEmail: "البريد الإلكتروني", fInterest: "مجال الاهتمام",
      }
    : {
        openMenu: "Open menu", closeMenu: "Close menu",
        nameErr: "Please enter your full name.",
        emailEmpty: "Please enter your email.",
        emailBad: "Please enter a valid email address.",
        messageErr: "Please tell us a little more (at least 10 characters).",
        hub: "DUBAI",
        subject: "Private enquiry",
        fName: "Name", fCompany: "Company / family office", fEmail: "Email", fInterest: "Area of interest",
      };

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

  /* ---------- header: reading progress, current section, gliding highlight ---------- */
  const bar = document.querySelector(".scroll-progress span");
  const nav = document.querySelector(".nav");
  const glider = document.querySelector(".nav__glider");
  const navLinks = [...document.querySelectorAll('.nav__menu a[href^="#"]:not(.nav__cta)')];
  // every section is tracked, including the ones with no menu link of their own,
  // so the highlight clears there instead of staying on the previous link
  const spySections = [...document.querySelectorAll("main > section")];
  const linkFor = (id) => navLinks.find((a) => a.getAttribute("href") === `#${id}`) || null;
  let activeLink = null, hoverLink = null, currentId = "";

  const placeGlider = () => {
    if (!glider || !nav) return;
    const target = hoverLink || activeLink;
    if (!target || !target.offsetWidth) { glider.classList.remove("is-on"); return; }
    const n = nav.getBoundingClientRect(), r = target.getBoundingClientRect();
    glider.style.width = `${r.width}px`;
    glider.style.height = `${r.height}px`;
    glider.style.transform = `translate(${r.left - n.left}px, ${r.top - n.top}px)`;
    glider.classList.add("is-on");
  };

  const updateHeader = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    // current section = the last one whose top has passed 40% of the viewport
    const line = window.innerHeight * 0.4;
    let section = null;
    spySections.forEach((s) => { if (s.getBoundingClientRect().top <= line) section = s; });
    currentId = (section && section.id) || "";
    const current = currentId ? linkFor(currentId) : null;
    if (current !== activeLink) {
      if (activeLink) { activeLink.classList.remove("is-active"); activeLink.removeAttribute("aria-current"); }
      activeLink = current;
      if (activeLink) { activeLink.classList.add("is-active"); activeLink.setAttribute("aria-current", "location"); }
      placeGlider();
    }
  };
  updateHeader();
  window.addEventListener("scroll", () => requestAnimationFrame(updateHeader), { passive: true });
  window.addEventListener("resize", () => { updateHeader(); placeGlider(); });
  navLinks.forEach((a) => a.addEventListener("pointerenter", () => { hoverLink = a; placeGlider(); }));
  if (nav) nav.addEventListener("pointerleave", () => { hoverLink = null; placeGlider(); });
  // switching language keeps your place: open the other page at the same section
  document.querySelectorAll('a[hreflang][href$=".html"]').forEach((a) => {
    const base = a.getAttribute("href");
    // re-check the position at click time rather than trusting the last scroll update
    a.addEventListener("click", () => { updateHeader(); a.setAttribute("href", currentId ? `${base}#${currentId}` : base); });
  });

  // the links animate in on load; measure again once they've settled
  setTimeout(placeGlider, 1300);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeGlider);

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("is-menu-open", open);   // the full-screen menu holds the page still behind it
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
    };
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    // tapping anywhere outside the open menu closes it, as does growing to the desktop layout
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("is-open") && !e.target.closest(".nav")) setMenu(false);
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 900 && menu.classList.contains("is-open")) setMenu(false); });
  }

  /* ---------- scroll reveal ---------- */
  // NOTE: the hero is above the fold — it gets a pure-CSS entrance instead of
  // JS reveal, so it's never hidden on load (avoids the blank-hero flash).
  const revealTargets = [
    [".section-head", 0],
    [".contact__intro", 0], [".contact__formwrap", 1],
    [".footer__grid", 0], [".reach", 0], [".ornament", 0], [".faq__list", 1],
  ];
  const groups = [".tenet", ".service", ".focus-card", ".step"];

  const toReveal = new Set();
  revealTargets.forEach(([sel, d]) =>
    document.querySelectorAll(sel).forEach((el) => { el.dataset.delay = String(d); toReveal.add(el); })
  );
  groups.forEach((sel) =>
    document.querySelectorAll(sel).forEach((el, i) => { el.dataset.delay = String(i % 4); toReveal.add(el); })
  );
  toReveal.forEach((el) => el.classList.add("reveal"));

  // portfolio icons trace themselves in: normalise every stroke to length 1
  // (plain selector list, not :is() — older iOS Safari throws on it, which would stop the reveal below)
  document.querySelectorAll(".focus-card__ico path, .focus-card__ico rect, .focus-card__ico circle")
    .forEach((s) => s.setAttribute("pathLength", "1"));

  if (prefersReduced || !("IntersectionObserver" in window)) {
    toReveal.forEach((el) => el.classList.add("is-visible", "is-settled"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        // after the entrance, drop any stagger delay so hover responds instantly
        setTimeout(() => el.classList.add("is-settled"), 1700);
        obs.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    toReveal.forEach((el) => io.observe(el));
  }

  /* ---------- hero: living constellation ---------- */
  // Gold points drift and link up when close; near the cursor they lean in.
  // Paused off-screen / in background tabs; one static frame for reduced motion.
  const net = document.querySelector(".hero__net");
  const hero = document.querySelector(".hero");
  if (net && hero && net.getContext) {
    const ctx = net.getContext("2d");
    const LINK = 130, PULL = 170;
    const mouse = { x: 0, y: 0, on: false };
    let w = 0, h = 0, pts = [], raf = 0, inView = true;

    const seed = () => {
      const r = net.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      net.width = Math.round(w * dpr); net.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 10500));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        ox: 0, oy: 0, r: Math.random() * 1.2 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        // ease an offset toward the cursor rather than moving the point itself,
        // so the field bends around the pointer and relaxes back afterwards
        let tx = 0, ty = 0;
        if (mouse.on) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
          if (d < PULL) { const f = (1 - d / PULL) * 0.28; tx = dx * f; ty = dy * f; }
        }
        p.ox += (tx - p.ox) * 0.07; p.oy += (ty - p.oy) * 0.07;
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], ax = a.x + a.ox, ay = a.y + a.oy;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = ax - (b.x + b.ox), dy = ay - (b.y + b.oy);
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(201, 162, 90, ${(1 - Math.sqrt(d2) / LINK) * 0.34})`;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(b.x + b.ox, b.y + b.oy); ctx.stroke();
          }
        }
        if (mouse.on) {
          const d = Math.hypot(mouse.x - ax, mouse.y - ay);
          if (d < PULL) {
            ctx.strokeStyle = `rgba(232, 206, 143, ${(1 - d / PULL) * 0.45})`;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(232, 206, 143, 0.8)";
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2); ctx.fill(); }
    };

    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && inView && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    seed();
    if (prefersReduced) {
      draw();
    } else {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); }).observe(hero);
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
      hero.addEventListener("pointermove", (e) => {
        const r = net.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;   // a finger bends the field too
      });
      hero.addEventListener("pointerleave", () => (mouse.on = false));
      // a touch has no "leave": release the field when the finger lifts or the page starts scrolling
      ["pointerup", "pointercancel"].forEach((ev) => hero.addEventListener(ev, (e) => { if (e.pointerType !== "mouse") mouse.on = false; }));
      start();
    }
    let lastW = w;
    if ("ResizeObserver" in window) new ResizeObserver(() => {
      // re-seed on width changes only (mobile URL-bar height jitter shouldn't reshuffle)
      const nw = net.getBoundingClientRect().width;
      if (Math.abs(nw - lastW) > 1) { lastW = nw; seed(); if (prefersReduced) draw(); }
    }).observe(net);
  }

  /* ---------- cursor spotlight on cards ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
      });
    });
  }

  /* ---------- intelligence pipeline ---------- */
  const pipe = document.querySelector(".pipeline");
  const rail = pipe && pipe.querySelector(".pipeline__rail");
  const fill = pipe && pipe.querySelector(".pipeline__fill");
  const stages = pipe ? [...pipe.querySelectorAll(".stage")] : [];
  const wave = pipe && pipe.querySelector(".pipeline__wave");
  let pipeGeo = null;

  if (wave) {
    // periodic over 1200 units so a -1200 translate loops seamlessly
    const params = [[34, 2, 0.4, 14, 5, 1.9], [26, 3, 2.2, 18, 4, 0.3], [40, 1, 4.1, 10, 7, 2.8]];
    wave.querySelectorAll("path").forEach((path, i) => {
      const [a1, k1, p1, a2, k2, p2] = params[i];
      let d = "";
      for (let x = 0; x <= 2400; x += 10) {
        const t = (x / 1200) * Math.PI * 2;
        const y = 120 + a1 * Math.sin(k1 * t + p1) + a2 * Math.sin(k2 * t + p2);
        d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
    });
  }

  // offsetLeft/Top ignore transforms, so the unlit cards' translate doesn't skew the rail
  const measurePipe = () => {
    if (!pipe || stages.length < 2) return;
    const centre = (s) => {
      const n = s.querySelector(".stage__node");
      return [s.offsetLeft + n.offsetLeft + n.offsetWidth / 2, s.offsetTop + n.offsetTop + n.offsetHeight / 2];
    };
    const pts = stages.map(centre);
    const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    const vertical = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    // right-to-left pages run the row from right to left: measure by distance, fill from the right
    const rtl = !vertical && x1 < x0;
    pipe.classList.toggle("is-vertical", vertical);
    pipe.classList.toggle("is-rtl", rtl);
    const len = vertical ? y1 - y0 : Math.abs(x1 - x0);
    Object.assign(rail.style, vertical
      ? { left: `${x0 - 0.5}px`, top: `${y0}px`, width: "1px", height: `${len}px` }
      : { left: `${Math.min(x0, x1)}px`, top: `${y0 - 0.5}px`, width: `${len}px`, height: "1px" });
    if (wave && !vertical) wave.style.top = `${y0 - 95}px`;
    pipeGeo = { vertical, len, start: vertical ? y0 : x0, at: pts.map(([x, y]) => (vertical ? y - y0 : Math.abs(x - x0))) };
  };

  const updatePipe = () => {
    if (!pipeGeo || prefersReduced) return;
    const vh = window.innerHeight;
    const top = pipe.getBoundingClientRect().top;
    // horizontal: sweep across while the row rises from 82% to 37% of the viewport;
    // vertical: the fill follows a reading line at 62% of the viewport
    const p = pipeGeo.vertical
      ? (vh * 0.62 - (top + pipeGeo.start)) / pipeGeo.len
      : (vh * 0.82 - top) / (vh * 0.45);
    const k = Math.max(0, Math.min(1, p));
    fill.style.transform = pipeGeo.vertical ? `scaleY(${k})` : `scaleX(${k})`;
    stages.forEach((s, i) => s.classList.toggle("is-lit", k * pipeGeo.len >= pipeGeo.at[i] - 1));
  };

  if (pipe) {
    measurePipe();
    if (prefersReduced) {
      fill.style.transform = "none";
      stages.forEach((s) => s.classList.add("is-lit"));
    } else {
      pipe.classList.add("is-live");
      updatePipe();
    }
  }

  /* ---------- manifesto: words brighten as you scroll ---------- */
  const manifesto = document.querySelector(".manifesto__text");
  let words = [];
  if (manifesto) {
    [...manifesto.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        // split on ordinary whitespace only, so &nbsp; keeps "care —" together
        node.textContent.split(/([ \t\r\n]+)/).forEach((tok) => {
          if (!tok) return;
          if (/^[ \t\r\n]+$/.test(tok)) { frag.append(tok); return; }
          const s = document.createElement("span"); s.className = "w"; s.textContent = tok; frag.append(s);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add("w");
      }
    });
    words = [...manifesto.querySelectorAll(".w")];
    if (prefersReduced) words.forEach((el) => el.classList.add("is-lit"));
  }
  const updateManifesto = () => {
    if (!words.length || prefersReduced) return;
    const r = manifesto.getBoundingClientRect(), vh = window.innerHeight;
    const p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
    const lit = Math.round(Math.max(0, Math.min(1, p)) * words.length * 1.1);
    words.forEach((el, i) => el.classList.toggle("is-lit", i < lit));
  };

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));

  /* ---------- hero medallion: 3D lean + layered parallax + gleam ---------- */
  const medal = document.querySelector(".medallion");


  if (medal && hero && finePointer && !prefersReduced) {
    const layers = [...medal.querySelectorAll("[data-depth]")].map((el) => [el, +el.dataset.depth]);
    const shine = medal.querySelector(".medallion__shine");
    let tx = 0, ty = 0, cx = 0, cy = 0, mraf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      medal.style.transform = `rotateX(${(-cy * 6).toFixed(2)}deg) rotateY(${(cx * 6).toFixed(2)}deg)`;
      layers.forEach(([el, d]) => { el.style.translate = `${(cx * d * 16).toFixed(1)}px ${(cy * d * 16).toFixed(1)}px`; });
      if (shine) shine.style.setProperty("--sx", cx.toFixed(3));
      mraf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!mraf) mraf = requestAnimationFrame(tick); };
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = medal.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
      ty = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
      medal.classList.add("is-tracking");
      kick();
    });
    hero.addEventListener("pointerleave", () => { tx = ty = 0; medal.classList.remove("is-tracking"); kick(); });
  }

  /* ---------- cards: 3D tilt with inner parallax ---------- */
  // The card presses away under the cursor; the numeral / icon drift at a different
  // rate than the text, which reads as depth. Pointer devices only.
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".service, .focus-card").forEach((card) => {
      const big = card.classList.contains("service");
      const max = big ? 5 : 7, lift = big ? -6 : -4;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
        const py = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
        const m = max * Math.min(1, 600 / r.width);   // wide, stacked cards tilt less
        card.classList.add("is-tilting");
        card.style.transform = `perspective(1100px) rotateX(${(-py * m).toFixed(2)}deg) rotateY(${(px * m).toFixed(2)}deg) translateY(${lift}px)`;
        card.style.setProperty("--px", px.toFixed(3));
        card.style.setProperty("--py", py.toFixed(3));
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.transform = "";
        card.style.removeProperty("--px");
        card.style.removeProperty("--py");
      });
    });
  }

  /* ---------- global reach: 3D dotted globe ---------- */
  // Rebuilt from the flat map's own dot rows, so the SVG stays the no-JS fallback.
  const reach = document.querySelector(".reach");
  const globe = reach && reach.querySelector(".reach__globe");
  const landPath = reach && reach.querySelector(".reach__land");
  if (globe && landPath && globe.getContext) {
    const g = globe.getContext("2d");
    const RAD = Math.PI / 180;

    // land mask: 160 × 60 cells of 2.25°, rows from 78°N
    const land = new Set();
    for (const [, x, y, len] of landPath.getAttribute("d").matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)/g)) {
      const i0 = +x - 0.5, j = +y - 0.5, n = Math.round(+len - 0.5);
      for (let i = i0; i <= i0 + n; i++) land.add(j * 160 + i);
    }
    const isLand = (lat, lon) => {
      const j = Math.round((78 - lat) / 2.25), i = Math.floor((lon + 180) / 2.25);
      return j >= 0 && j < 60 && land.has(j * 160 + (((i % 160) + 160) % 160));
    };
    const vec = (lat, lon) => {
      const p = lat * RAD, l = lon * RAD;
      return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
    };

    // evenly spaced points (Fibonacci sphere), kept where there's land
    const pts = [];
    const N = 12000, golden = Math.PI * (3 - Math.sqrt(5));
    for (let k = 0; k < N; k++) {
      const lat = Math.asin(1 - (2 * k + 1) / N) / RAD;
      const lon = (((k * golden) / RAD) % 360) - 180;
      if (isLand(lat, lon)) pts.push(...vec(lat, lon));
    }
    const dots = new Float32Array(pts);

    // arcs from Dubai, lifted off the surface in proportion to their length
    const HUB = [25.2, 55.3];
    const DEST = [[51.5, -0.1], [40.7, -74], [22.3, 114.2], [1.3, 103.8], [-26.2, 28], [-33.9, 151.2], [-23.5, -46.6]];
    const hubV = vec(...HUB);
    const arcs = DEST.map(([la, lo]) => {
      const b = vec(la, lo);
      const w = Math.acos(clamp(hubV[0] * b[0] + hubV[1] * b[1] + hubV[2] * b[2]));
      const path = [];
      for (let s = 0; s <= 60; s++) {
        const t = s / 60, k0 = Math.sin((1 - t) * w) / Math.sin(w), k1 = Math.sin(t * w) / Math.sin(w);
        const alt = 1 + 0.085 * w * Math.sin(Math.PI * t);
        path.push([(k0 * hubV[0] + k1 * b[0]) * alt, (k0 * hubV[1] + k1 * b[1]) * alt, (k0 * hubV[2] + k1 * b[2]) * alt]);
      }
      return { end: b, path };
    });

    let S = 0, R = 0, dpr = 1;
    let lon0 = HUB[1], lat0 = 22;
    let offLon = 0, offLat = 0, vel = 0, dragging = false, lastX = 0, lastY = 0, idleSince = 0;
    let t0 = performance.now(), arcsFrom = null, graf = 0, gInView = false;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      S = globe.getBoundingClientRect().width;
      globe.width = Math.round(S * dpr); globe.height = Math.round(S * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = S * 0.38;
    };

    // rotate so (lat0, lon0) faces the viewer; returns [x, y, z] with z toward us
    const view = (v) => {
      const cl = Math.cos(lon0 * RAD), sl = Math.sin(lon0 * RAD);
      const ct = Math.cos(lat0 * RAD), st = Math.sin(lat0 * RAD);
      const x = v[0] * cl - v[2] * sl, z1 = v[0] * sl + v[2] * cl;
      return [x, v[1] * ct - z1 * st, v[1] * st + z1 * ct];
    };

    const draw = (now) => {
      const c = S / 2;
      g.clearRect(0, 0, S, S);

      // atmosphere + body
      const halo = g.createRadialGradient(c, c, R * 0.92, c, c, R * 1.28);
      halo.addColorStop(0, "rgba(201, 162, 90, 0.16)"); halo.addColorStop(1, "rgba(201, 162, 90, 0)");
      g.fillStyle = halo; g.beginPath(); g.arc(c, c, R * 1.28, 0, Math.PI * 2); g.fill();
      const body = g.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R);
      body.addColorStop(0, "rgba(201, 162, 90, 0.10)"); body.addColorStop(1, "rgba(9, 9, 11, 0.9)");
      g.fillStyle = body; g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(232, 206, 143, 0.22)"; g.lineWidth = 1; g.stroke();

      // land dots, bucketed by depth so we set fillStyle only a few times
      // (same maths as view(), inlined — this runs for ~3,000 points a frame)
      const buckets = [[], [], [], [], [], []];
      const cl = Math.cos(lon0 * RAD), sl = Math.sin(lon0 * RAD);
      const ct = Math.cos(lat0 * RAD), st = Math.sin(lat0 * RAD);
      for (let i = 0; i < dots.length; i += 3) {
        const vx = dots[i], vy = dots[i + 1], vz = dots[i + 2];
        const x = vx * cl - vz * sl, z1 = vx * sl + vz * cl;
        const y = vy * ct - z1 * st, z = vy * st + z1 * ct;
        buckets[z < 0 ? 0 : 1 + Math.min(4, Math.floor(z * 5))].push(c + x * R, c - y * R, z);
      }
      buckets.forEach((b, bi) => {
        g.fillStyle = bi === 0 ? "rgba(232, 206, 143, 0.05)" : `rgba(232, 206, 143, ${0.16 + bi * 0.12})`;
        for (let i = 0; i < b.length; i += 3) {
          const s = bi === 0 ? 1 : 1 + b[i + 2] * 1.3;
          g.fillRect(b[i] - s / 2, b[i + 1] - s / 2, s, s);
        }
      });

      // arcs: drawn in on first view, then a bright pulse travels each one
      const secs = (now - t0) / 1000;
      const since = arcsFrom === null ? -1 : (now - arcsFrom) / 1000;
      g.lineCap = "round";
      arcs.forEach((a, ai) => {
        const prog = prefersReduced ? 1 : clamp((since - 0.2 - ai * 0.15) / 1.5, 0, 1);
        if (prog <= 0) return;
        const eased = 1 - Math.pow(1 - prog, 3);
        const last = Math.round(eased * (a.path.length - 1));
        const P = a.path.map(view);
        const seen = (p) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;
        // two passes: the stretch in front of the globe bright, the part curving
        // round the back (still outside the silhouette) faint
        g.lineWidth = 1.2;
        [[true, "rgba(232, 206, 143, 0.75)"], [false, "rgba(232, 206, 143, 0.2)"]].forEach(([front, col]) => {
          g.strokeStyle = col; g.beginPath();
          let pen = false;
          for (let s = 0; s <= last; s++) {
            const p = P[s];
            if (!seen(p) || (p[2] > 0) !== front) {
              // keep the join seamless where the arc crosses the limb
              if (pen && seen(p)) g.lineTo(c + p[0] * R, c - p[1] * R);
              pen = false; continue;
            }
            const X = c + p[0] * R, Y = c - p[1] * R;
            pen ? g.lineTo(X, Y) : g.moveTo(X, Y); pen = true;
          }
          g.stroke();
        });
        if (prog >= 1 && !prefersReduced) {
          const h = Math.floor((((secs * 0.35 + ai * 0.37) % 1)) * (P.length - 1));
          const p = P[h];
          if (seen(p)) {
            g.fillStyle = "rgba(255, 245, 220, 0.95)";
            g.beginPath(); g.arc(c + p[0] * R, c - p[1] * R, 1.8, 0, Math.PI * 2); g.fill();
          }
        }
        if (prog >= 1) {
          const e = view(a.end);
          if (e[2] > 0) {
            g.fillStyle = "rgba(232, 206, 143, 0.95)";
            g.beginPath(); g.arc(c + e[0] * R, c - e[1] * R, 2.2, 0, Math.PI * 2); g.fill();
          }
        }
      });

      // Dubai: glow, pulse ring, label
      const hp = view(hubV);
      if (hp[2] > 0) {
        const X = c + hp[0] * R, Y = c - hp[1] * R;
        const glow = g.createRadialGradient(X, Y, 0, X, Y, 16);
        glow.addColorStop(0, "rgba(232, 206, 143, 0.55)"); glow.addColorStop(1, "rgba(232, 206, 143, 0)");
        g.fillStyle = glow; g.beginPath(); g.arc(X, Y, 16, 0, Math.PI * 2); g.fill();
        if (!prefersReduced) {
          const ph = (secs % 2.6) / 2.6;
          g.strokeStyle = `rgba(232, 206, 143, ${0.6 * (1 - ph)})`; g.lineWidth = 1;
          g.beginPath(); g.arc(X, Y, 3 + ph * 16, 0, Math.PI * 2); g.stroke();
        }
        g.fillStyle = "#f3e2b0"; g.beginPath(); g.arc(X, Y, 3, 0, Math.PI * 2); g.fill();
        g.font = isArabic ? '600 13px "IBM Plex Sans Arabic", "Segoe UI", sans-serif' : "600 10px Inter, system-ui, sans-serif";
        if ("letterSpacing" in g) g.letterSpacing = isArabic ? "0px" : "2px";
        g.textAlign = "left";   // the canvas inherits the page direction; keep the label to the hub's right
        g.fillStyle = "rgba(243, 239, 230, 0.92)";
        g.fillText(T.hub, X + 9, Y - 8);
      }
    };

    const frame = (now) => {
      const secs = (now - t0) / 1000;
      if (!dragging) {
        offLon += vel; vel *= 0.94;
        if (now - idleSince > 2500) {
          // ease back to the home sway, taking the short way round
          offLon = ((((offLon + 180) % 360) + 360) % 360) - 180;
          offLon *= 0.975; offLat *= 0.95;
        }
      }
      // gentle sway either side of the Gulf, so Dubai always stays on the near side
      lon0 = HUB[1] + 60 * Math.sin(secs * 0.14) + offLon;
      lat0 = 22 + offLat;
      draw(now);
      graf = requestAnimationFrame(frame);
    };
    const run = () => { if (!graf && gInView && !document.hidden && !prefersReduced) graf = requestAnimationFrame(frame); };
    const halt = () => { cancelAnimationFrame(graf); graf = 0; };

    reach.classList.add("has-globe");
    size();
    if (prefersReduced) draw(performance.now());

    new IntersectionObserver(([e]) => {
      gInView = e.isIntersecting;
      if (gInView && arcsFrom === null) arcsFrom = performance.now();
      gInView ? run() : halt();
    }, { threshold: 0.15 }).observe(globe);
    document.addEventListener("visibilitychange", () => (document.hidden ? halt() : run()));
    if ("ResizeObserver" in window) new ResizeObserver(() => { size(); if (prefersReduced || !graf) draw(performance.now()); }).observe(globe);

    globe.addEventListener("pointerdown", (e) => {
      dragging = true; vel = 0; lastX = e.clientX; lastY = e.clientY;
      globe.setPointerCapture(e.pointerId); globe.classList.add("is-dragging");
    });
    globe.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      const k = 180 / (Math.PI * R);           // one globe radius of drag ≈ 57°
      offLon -= dx * k; vel = -dx * k;
      offLat = clamp(offLat + dy * k, -35, 35);
      if (prefersReduced) { lon0 = HUB[1] + offLon; lat0 = 22 + offLat; draw(performance.now()); }
    });
    const release = () => { dragging = false; idleSince = performance.now(); globe.classList.remove("is-dragging"); };
    globe.addEventListener("pointerup", release);
    globe.addEventListener("pointercancel", release);
  }

  /* ---------- phone: swipeable card rows with progress dots ---------- */
  // On phones the service and sector grids scroll sideways (CSS). The card nearest
  // the centre of its row is marked .is-focus and its dot is lit.
  if ("IntersectionObserver" in window) {
    document.querySelectorAll(".service-grid, .focus-grid").forEach((row) => {
      const cards = [...row.children];
      if (cards.length < 2) return;
      const dots = document.createElement("div");
      dots.className = "dots"; dots.setAttribute("aria-hidden", "true");
      cards.forEach(() => dots.append(document.createElement("i")));
      row.after(dots);
      row.classList.add("has-dots");
      const ratio = new Map();
      const pick = () => {
        // on wider screens the row is an ordinary grid: nothing is "centred", so nothing is singled out
        if (row.scrollWidth <= row.clientWidth + 4) {
          cards.forEach((c) => c.classList.remove("is-focus"));
          return;
        }
        let best = 0, bestR = -1;
        cards.forEach((c, i) => { const r = ratio.get(c) || 0; if (r > bestR) { bestR = r; best = i; } });
        cards.forEach((c, i) => c.classList.toggle("is-focus", i === best));
        [...dots.children].forEach((d, i) => d.classList.toggle("is-on", i === best));
      };
      // how much of each card is visible inside the row decides which one is "centred"
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => ratio.set(e.target, e.intersectionRatio));
        pick();
      }, { root: row, threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] });
      cards.forEach((c) => io.observe(c));
      window.addEventListener("resize", pick);
      pick();
    });

    /* ---------- touch: the item in the middle of the screen takes the hover look ---------- */
    const band = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("is-focus", e.isIntersecting));
    }, { rootMargin: "-38% 0px -38% 0px" });
    document.querySelectorAll(".tenet, .step").forEach((el) => band.observe(el));
  }

  /* ---------- touch: a gold light under the finger ---------- */
  document.querySelectorAll(".spot").forEach((el) => {
    let timer = 0;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.classList.add("is-touched");
      clearTimeout(timer);
      timer = setTimeout(() => {
        el.classList.remove("is-touched");
        el.style.removeProperty("--mx"); el.style.removeProperty("--my");
      }, 900);
    });
  });

  /* ---------- phone: floating call-to-action ---------- */
  // Appears once the hero has scrolled away; steps aside when the contact form
  // (or the footer below it) is on screen, where it would only be in the way.
  const floatCta = document.querySelector(".float-cta");
  const contactSection = document.getElementById("contact");
  if (floatCta && hero && contactSection) {
    let pending = false;
    const updateFloat = () => {
      pending = false;
      const pastHero = hero.getBoundingClientRect().bottom < 80;
      const atContact = contactSection.getBoundingClientRect().top < window.innerHeight * 0.75;
      floatCta.classList.toggle("is-on", pastHero && !atContact);
    };
    window.addEventListener("scroll", () => { if (!pending) { pending = true; requestAnimationFrame(updateFloat); } }, { passive: true });
    updateFloat();
  }

  /* ---------- shared scroll / resize loop ---------- */
  let ticking = false;
  const onFrame = () => { ticking = false; updatePipe(); updateManifesto(); };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
  if (!prefersReduced) {
    window.addEventListener("scroll", request, { passive: true });
    updateManifesto();
  }
  // re-measure whenever the pipeline reflows (resize, web fonts arriving, etc.)
  if (pipe && "ResizeObserver" in window) new ResizeObserver(() => { measurePipe(); request(); }).observe(pipe);

  /* ---------- contact form validation ---------- */
  const form = document.getElementById("contact-form");
  if (!form) return;
  const success = document.getElementById("form-success");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    name: (v) => v.trim().length >= 2 || T.nameErr,
    email: (v) => (v.trim() === "" ? T.emailEmpty : emailRe.test(v.trim()) || T.emailBad),
    message: (v) => v.trim().length >= 10 || T.messageErr,
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

    // No server: hand the enquiry to the visitor's own email app, addressed to the firm.
    // Nothing is sent until they press send there, and no third party sees it.
    const val = (name) => ((form.elements[name] && form.elements[name].value) || "").trim();
    const lines = [`${T.fName}: ${val("name")}`];
    if (val("company")) lines.push(`${T.fCompany}: ${val("company")}`);
    lines.push(`${T.fEmail}: ${val("email")}`);
    if (val("interest")) lines.push(`${T.fInterest}: ${val("interest")}`);
    lines.push("", val("message"));
    const to = form.dataset.to || "visracapitalMD@gmail.com";
    const mailto = `mailto:${to}?subject=${encodeURIComponent(`${T.subject} — ${val("name")}`)}&body=${encodeURIComponent(lines.join("\n"))}`;

    success.hidden = false;
    // stamp the seal (restart the animation if they send another enquiry)
    const wrap = form.closest(".contact__formwrap");
    if (wrap) { wrap.classList.remove("is-sealed"); void wrap.offsetWidth; wrap.classList.add("is-sealed"); }
    // bring the top of the card into view, so the seal stamp and the message are seen together
    const target = wrap || success;
    const y = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 56;
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    // the form keeps what they typed, in case the email app didn't open and they want to try again
    window.location.href = mailto;
  });
})();
