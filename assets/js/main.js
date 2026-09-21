/* Christian Powlette - Portfolio
   Small, dependency-free behaviours. The only external script is the QR generator (cdnjs). */

/* ------------------------------------------------------------------
   CONFIG - edit these three values before publishing.
   siteUrl: the public address of the portfolio home page, e.g.
            "https://christianpowlette.github.io/portfolio/"
            Leave empty to use the address the page is currently served from.
   ------------------------------------------------------------------ */
const CONFIG = {
  siteUrl: "https://cpowlette.github.io/Portfolio/",
  projectsPath: "projects.html",
  resumeUrl: "https://cpowlette.github.io/Portfolio/assets/docs/Christian_Powlette_Resume.pdf",
  email: "christian.powlette@ontariotechu.net",
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Short section-routing acknowledgement ---------- */
  const packetTransition = $("[data-packet-transition]");
  const packetStage = $("[data-packet-stage]");
  const playPacketTransition = () => {
    if (reduceMotion || !packetTransition || !packetStage) return;
    const stages = ["PACKET SENT", "PACKET RECEIVED", "AUTHENTICATED", "LOADING RESOURCE"];
    packetTransition.removeAttribute("aria-hidden");
    packetTransition.classList.remove("is-active");
    void packetTransition.offsetWidth;
    packetTransition.classList.add("is-active");
    stages.forEach((stage, index) => window.setTimeout(() => { packetStage.textContent = stage; }, index * 105));
    window.setTimeout(() => {
      packetTransition.classList.remove("is-active");
      packetTransition.setAttribute("aria-hidden", "true");
    }, 470);
  };
  $$('a[href^="#"]').forEach((link) => {
    if (link.classList.contains("skip-link")) return;
    link.addEventListener("click", () => playPacketTransition());
  });

  /* ---------- Evidence counters ---------- */
  const counters = $$('[data-counter]');
  if (counters.length) {
    const fillCounter = (counter) => {
      const target = Number(counter.dataset.counterTarget || 0);
      if (reduceMotion) { counter.textContent = String(target); return; }
      const start = performance.now();
      const duration = 680;
      const render = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = String(Math.round(target * progress));
        if (progress < 1) requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    };
    if ("IntersectionObserver" in window && !reduceMotion) {
      const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => {
        if (entry.isIntersecting) { fillCounter(entry.target); instance.unobserve(entry.target); }
      }), { threshold: 0.7 });
      counters.forEach((counter) => observer.observe(counter));
    } else counters.forEach(fillCounter);
  }

  /* ---------- Respectful section reveals ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const sections = $$("main > .section");
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4%" });
    sections.forEach((section) => reveal.observe(section));
  }

  /* ---------- Mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const menuLabel = $("[data-menu-label]", toggle);
    const navFocusable = () => $$('a[href], button:not([disabled])', nav)
      .filter((element) => element.getClientRects().length > 0);
    const setOpen = (open, restoreFocus = true) => {
      nav.classList.toggle("open", open);
      document.documentElement.classList.toggle("nav-is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
      if (open) {
        window.setTimeout(() => navFocusable()[0]?.focus(), 0);
      } else if (restoreFocus) {
        toggle.focus();
      }
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false, false); });
    document.addEventListener("keydown", (e) => {
      if (!nav.classList.contains("open")) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const focusable = navFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Highlight current section in the nav ---------- */
  const navLinks = $$('#site-nav a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    navLinks.forEach((a) => {
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) map.set(target, a);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          map.get(entry.target).setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, section) => io.observe(section));
  }

  /* ---------- Hero diagram: play the draw-in once ---------- */
  $$(".diagram[data-live]").forEach((svg) => {
    if (reduceMotion) return;
    svg.classList.add("is-live");
  });

  /* ---------- Hero topology inspector: public, sanitized controls ---------- */
  const topology = {
    office: { title: "Office network", output: "control: strong password / approved services" },
    guest: { title: "Guest network", output: "route: internet only / internal resources blocked" },
    nas: { title: "Secure NAS", output: "access: named users + role-based shares / encrypted backup" },
    wifi: { title: "Secure Wi-Fi", output: "control: strong authentication + isolated IoT access" },
  };
  const inspectorTitle = $("[data-topology-title]");
  const inspectorOutput = $("[data-topology-output]");
  const topologyNodes = $$('[data-topology-node]');
  const inspectTopologyNode = (node) => {
    const detail = topology[node.dataset.topologyNode];
    if (!detail || !inspectorTitle || !inspectorOutput) return;
    topologyNodes.forEach((item) => item.classList.toggle("is-selected", item === node));
    inspectorTitle.textContent = detail.title;
    inspectorOutput.textContent = detail.output;
  };
  topologyNodes.forEach((node) => {
    node.addEventListener("click", () => inspectTopologyNode(node));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspectTopologyNode(node); }
    });
  });

  /* ---------- Sanitized CLI-style hero telemetry ---------- */
  const terminalOutput = $("[data-terminal-output]");
  if (terminalOutput) {
    const lines = [
      "show project secure-nas --summary",
      "Secure NAS: QNAP / RAID / recovery planning",
      "show project google-workspace --summary",
      "Google Workspace: Gmail / DNS / migration planning",
      "show project drabpe-directory --summary",
      "DRABPE Directory: Supabase / Postgres / subdomains",
    ];
    if (reduceMotion) {
      terminalOutput.textContent = lines[1];
    } else {
      let lineIndex = 0;
      let character = 0;
      const type = () => {
        const line = lines[lineIndex];
        terminalOutput.textContent = line.slice(0, character);
        character += 1;
        if (character <= line.length) {
          window.setTimeout(type, 18);
          return;
        }
        window.setTimeout(() => {
          lineIndex = (lineIndex + 1) % lines.length;
          character = 0;
          type();
        }, 1900);
      };
      terminalOutput.textContent = "";
      type();
    }
  }

  /* ---------- Brief console acknowledgement for interactive controls ---------- */
  const writeInteractionLog = (element) => {
    if (!terminalOutput || element.matches("[data-image-preview-close]")) return;
    const text = (element.getAttribute("aria-label") || element.textContent || element.getAttribute("href") || "control")
      .replace(/\s+/g, " ").trim().slice(0, 72);
    terminalOutput.textContent = `user.select(\"${text}\") // routing... // system: online`;
  };
  document.addEventListener("click", (event) => {
    const interactive = event.target.closest("a, button, [role='button']");
    if (interactive) writeInteractionLog(interactive);
  });

  /* ---------- In-page portfolio image preview ---------- */
  const imagePreviewModal = $("#image-preview-modal");
  const imagePreviewImage = $("[data-image-preview-image]", imagePreviewModal || document);
  const imagePreviewTitle = $("[data-image-preview-title]", imagePreviewModal || document);
  const imagePreviewDetail = $("[data-image-preview-detail]", imagePreviewModal || document);
  $$('[data-image-preview]').forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const image = $("img", trigger);
      if (!image || !imagePreviewModal || typeof imagePreviewModal.showModal !== "function") return;
      imagePreviewImage.src = image.currentSrc || image.src;
      imagePreviewImage.alt = image.alt;
      imagePreviewTitle.textContent = $("figcaption strong", trigger)?.textContent.trim() || image.alt;
      imagePreviewDetail.textContent = $("figcaption span", trigger)?.textContent.trim() || "Portfolio image preview";
      imagePreviewModal.showModal();
    });
  });
  $("[data-image-preview-close]", imagePreviewModal || document)?.addEventListener("click", () => imagePreviewModal.close());
  imagePreviewModal?.addEventListener("click", (event) => { if (event.target === imagePreviewModal) imagePreviewModal.close(); });

  /* ---------- Abstract rack status: informational, never live telemetry ---------- */
  const rackOutput = $("[data-rack-output]");
  if (rackOutput && !reduceMotion) {
    const messages = [
      "network: segmented · storage: protected · recovery: documented",
      "access: named users · backup: scheduled · status: sanitized",
      "wireless: controlled · guest: isolated · logs: reviewed",
    ];
    let rackMessage = 0;
    window.setInterval(() => {
      rackMessage = (rackMessage + 1) % messages.length;
      rackOutput.textContent = messages[rackMessage];
    }, 3200);
  }

  /* ---------- Copy email ---------- */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch (_) {
        const range = document.createRange();
        const node = $(btn.getAttribute("data-copy-target"));
        if (node) { range.selectNodeContents(node); const s = getSelection(); s.removeAllRanges(); s.addRange(range); }
        btn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });

  /* ---------- Contact form -> opens the visitor's email app, no backend needed ---------- */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = `Portfolio message from ${data.get("name")}` + (data.get("org") ? ` (${data.get("org")})` : "");
      const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("org") || ""}\n${data.get("email")}`;
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = $("#form-status");
      if (status) status.textContent = "Your email app should open with the message ready to send.";
    });
  }

  /* ---------- QR codes ---------- */
  function baseUrl() {
    if (CONFIG.siteUrl) return CONFIG.siteUrl.replace(/\/?$/, "/");
    if (/^https?:$/.test(location.protocol)) return location.href.split("#")[0].replace(/[^/]*$/, "");
    return "";
  }
  function qrSvg(text) {
    const qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n} ${n}" role="img" aria-label="QR code for ${text}" shape-rendering="crispEdges"><path d="${d}" fill="#2b231c"/></svg>`;
  }
  $$("[data-qr]").forEach((box) => {
    const base = baseUrl();
    const url = box.dataset.qr === "resume" ? CONFIG.resumeUrl : (base ? base + CONFIG.projectsPath : "");
    if (!url) { box.closest(".qr-row")?.setAttribute("hidden", ""); return; }
    if (typeof window.qrcode !== "function") { box.textContent = url; return; }
    box.innerHTML = qrSvg(url);
    box.title = url;
  });

  /* ---------- Footer year ---------- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
