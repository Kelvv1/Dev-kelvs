/* =====================================================
   RENDER.JS — builds services, skills, projects, socials
   from the data files. You normally do not need to edit this.
   ===================================================== */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var SKILLS = window.SKILLS || [];
  var PROJECTS = window.PROJECTS || [];

  /* ---------- helpers ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  function svg(inner, size) {
    var s = size || 24;
    var wrap = document.createElement("span");
    wrap.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      inner + "</svg>";
    return wrap.firstChild;
  }

  function safeUrl(url) {
    if (!url) return "";
    try { return encodeURI(decodeURI(url)); } catch (e) { return url; }
  }

  /* ---------- icons ---------- */
  var ICONS = {
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M10 20v-6h4v6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12h11l2-8H6"/>',
    refresh: '<path d="M20 11a8 8 0 00-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0014 4l2-2"/><path d="M20 20v-5h-5"/>',
    code: '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/><path d="M14 4l-4 16"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 005 5L21 12.6 12.6 21a2.1 2.1 0 01-3-3L18 9.6"/><path d="M9 15l-6 6"/>'
  };

  var SOCIAL_ICONS = {
    instagram: { label: "Instagram", svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.8" fill="currentColor"/>' },
    linkedin: { label: "LinkedIn", svg: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6M12 13a3 3 0 016 0v4"/>' },
    x: { label: "X", svg: '<path d="M4 4l16 16M20 4L4 20"/>' },
    pinterest: { label: "Pinterest", svg: '<circle cx="12" cy="12" r="9"/><path d="M11 8.5c2.5-.8 4.5.6 4.2 3-.3 2.4-2.2 3.6-3.8 2.8M11.2 11l-2 8"/>' },
    whatsapp: { label: "WhatsApp", svg: '<path d="M3.5 20.5l1.3-4.4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1l-4.5 1z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>' },
    email: { label: "Email", svg: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>' }
  };

  /* ---------- services ---------- */
  var servicesBox = document.getElementById("services-list");
  if (servicesBox) {
    (SITE.services || []).forEach(function (s) {
      var icon = el("div", { class: "icon" });
      icon.appendChild(svg(ICONS[s.icon] || ICONS.code, 40));
      var body = el("div", {}, [
        el("h3", { text: s.name }),
        el("p", { text: s.text })
      ]);
      servicesBox.appendChild(el("div", { class: "service" }, [icon, body]));
    });
  }

  /* ---------- skills ---------- */
  var skillsBox = document.getElementById("skills-list");
  if (skillsBox) {
    SKILLS.forEach(function (group) {
      if (!group.items || !group.items.length) return;
      var chips = el("div", { class: "chips" });
      group.items.forEach(function (name) {
        chips.appendChild(el("span", { class: "chip", text: name }));
      });
      skillsBox.appendChild(el("div", { class: "skill-group" }, [el("h3", { text: group.group }), chips]));
    });
  }

  /* ---------- projects ---------- */
  var grid = document.getElementById("projects-grid");
  var filterBox = document.getElementById("project-filters");
  var activeCategory = "All";

  function projectCard(p) {
    var imgSrc = p.image || "images/projects/primeapex-business.svg";
    var img = el("img", {
      src: imgSrc,
      alt: p.name + " preview",
      loading: "lazy",
      width: "600",
      height: "375"
    });
    img.addEventListener("error", function () {
      img.src = "images/projects/primeapex-business.svg";
    }, { once: true });

    var imgWrap;
    if (p.liveUrl) {
      imgWrap = el("a", { class: "project-img", href: p.liveUrl, "aria-label": "Open " + p.name }, [img]);
    } else {
      imgWrap = el("div", { class: "project-img" }, [img]);
    }

    var title = el("h3", { text: p.name });

    var chips = el("div", { class: "chips" });
    (p.tech || []).forEach(function (t) { chips.appendChild(el("span", { class: "chip", text: t })); });

    var actions = el("div", { class: "project-actions" });
    if (p.liveUrl) {
      actions.appendChild(el("a", { class: "btn btn-primary", href: p.liveUrl, text: "View Details" }));
    }
    if (p.githubUrl) {
      actions.appendChild(el("a", { class: "repo", href: p.githubUrl, target: "_blank", rel: "noopener noreferrer", text: "Source Code", "aria-label": "GitHub repository for " + p.name }));
    }

    var body = el("div", { class: "project-body" }, [
      el("p", { class: "project-cat", text: p.category }),
      title,
      el("p", { text: p.description }),
      chips,
      actions
    ]);

    return el("article", { class: "project" }, [imgWrap, body]);
  }

  function renderProjects() {
    if (!grid) return;
    grid.innerHTML = "";
    var list = PROJECTS.filter(function (p) { return activeCategory === "All" || p.category === activeCategory; });
    if (!list.length) {
      grid.appendChild(el("p", { class: "empty-note", text: "No projects in this category yet." }));
      return;
    }
    list.forEach(function (p) { grid.appendChild(projectCard(p)); });
  }

  function renderFilters() {
    if (!filterBox) return;
    var cats = ["All"];
    PROJECTS.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    if (cats.length <= 2) { filterBox.style.display = "none"; return; }
    cats.forEach(function (c) {
      var b = el("button", { type: "button", class: "filter-btn", "aria-pressed": c === activeCategory ? "true" : "false", text: c });
      b.addEventListener("click", function () {
        activeCategory = c;
        Array.prototype.forEach.call(filterBox.children, function (btn) {
          btn.setAttribute("aria-pressed", btn.textContent === c ? "true" : "false");
        });
        renderProjects();
      });
      filterBox.appendChild(b);
    });
  }

  renderFilters();
  renderProjects();

  /* ---------- social icons + contact links ---------- */
  var socialBox = document.getElementById("social-icons");
  if (socialBox) {
    ["instagram", "linkedin", "x", "pinterest", "whatsapp", "email"].forEach(function (key) {
      var url = SITE.social && SITE.social[key];
      if (!url) return;
      var info = SOCIAL_ICONS[key];
      var isMail = key === "email";
      var attrs = { href: isMail ? url : safeUrl(url), "aria-label": info.label, title: info.label };
      if (!isMail) { attrs.target = "_blank"; attrs.rel = "noopener noreferrer"; }
      socialBox.appendChild(el("a", attrs, [svg(info.svg, 20)]));
    });
  }

  function setLink(id, href, text) {
    var node = document.getElementById(id);
    if (!node) return;
    node.setAttribute("href", href);
    node.textContent = text;
  }
  setLink("contact-phone", SITE.phoneLink, SITE.phoneDisplay);
  setLink("footer-phone", SITE.phoneLink, SITE.phoneDisplay);
  setLink("contact-email", SITE.emailLink, SITE.email);
  setLink("footer-email", SITE.emailLink, SITE.email);
})();
