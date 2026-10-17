/* =====================================================
   MAIN.JS — mobile menu, active link, year, contact form
   ===================================================== */

(function () {
  "use strict";

  var SITE = window.SITE || {};

  /* ---------- current year ---------- */
  var yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------- highlight current section in the menu ---------- */
  var links = document.querySelectorAll(".site-nav ul a");
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove("active"); });
          map[entry.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contact-form");
  var statusBox = document.getElementById("form-status");
  var submitBtn = document.getElementById("form-submit");

  function setStatus(type, message, withLinks, text) {
    statusBox.className = "form-status " + type;
    statusBox.textContent = message;
    if (withLinks) {
      var box = document.createElement("div");
      box.className = "alt-links";

      var wa = document.createElement("a");
      wa.href = SITE.whatsappLink + "?text=" + encodeURIComponent(text || "");
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.textContent = "Send via WhatsApp";

      var mail = document.createElement("a");
      mail.href = SITE.emailLink + "?subject=" + encodeURIComponent("Project enquiry") + "&body=" + encodeURIComponent(text || "");
      mail.textContent = "Send via Email";

      box.appendChild(wa);
      box.appendChild(mail);
      statusBox.appendChild(box);
    }
  }

  function showError(field, message) {
    var wrap = field.closest(".field");
    wrap.classList.add("has-error");
    var old = wrap.querySelector(".error");
    if (old) old.remove();
    var p = document.createElement("div");
    p.className = "error";
    p.textContent = message;
    wrap.appendChild(p);
  }

  function clearErrors() {
    form.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("has-error");
      var e = f.querySelector(".error");
      if (e) e.remove();
    });
  }

  function validate() {
    clearErrors();
    var ok = true;
    var first = null;
    var name = form.elements.name, email = form.elements.email, type = form.elements.website_type, details = form.elements.details;

    if (!name.value.trim()) { showError(name, "Please enter your full name."); ok = false; first = first || name; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "Please enter a valid email address."); ok = false; first = first || email; }
    if (!type.value) { showError(type, "Please choose a type of website."); ok = false; first = first || type; }
    if (details.value.trim().length < 10) { showError(details, "Please describe your project (at least a few words)."); ok = false; first = first || details; }
    if (first) first.focus();
    return ok;
  }

  function summaryText() {
    return [
      "Project enquiry for Kelvsdesign",
      "Name: " + form.elements.name.value.trim(),
      "Email: " + form.elements.email.value.trim(),
      "Type of website: " + form.elements.website_type.value,
      "Budget: " + (form.elements.budget.value.trim() || "Not stated"),
      "Details: " + form.elements.details.value.trim()
    ].join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusBox.className = "form-status";
      statusBox.textContent = "";

      if (!validate()) return;

      /* Spam trap: real people never fill this hidden field. */
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      var endpoint = SITE.formEndpoint || "";
      var configured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint);

      if (!configured) {
        setStatus("info", "To ensure immediate review, choose your preferred direct channel to transmit your project specification directly:", true, summaryText());
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      var data = new FormData(form);

      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setStatus("success", "Thank you. Your enquiry has been sent. I will get back to you by email.", false);
          } else {
            setStatus("error", "Sorry, your enquiry could not be sent. Please use one of these instead:", true, summaryText());
          }
        })
        .catch(function () {
          setStatus("error", "A network problem stopped your enquiry from being sent. Please check your connection or use one of these:", true, summaryText());
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Project Enquiry";
        });
    });
  }
})();
