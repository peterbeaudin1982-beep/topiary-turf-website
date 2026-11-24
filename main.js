/* Topiary & Turf Estate Care — site behaviour */
(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Image fallback (also handled inline via onerror for images that fail before JS runs)
  document.querySelectorAll(".media img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-broken");
  });

  // Reveal on scroll
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Estimate form
  // ---------------------------------------------------------------------
  // Works with no server: it opens the visitor's email app with the request
  // pre-filled to info@topiaryestatecareky.com.
  // To receive submissions directly instead, create a free form endpoint
  // (e.g. Formspree, Netlify Forms, Basin) and paste its URL below.
  var FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"
  var TO = "info@topiaryestatecareky.com";

  document.querySelectorAll("form.estimate-form").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      if (data.get("company_website")) return; // honeypot

      var status = form.querySelector(".form-status");
      var lines = [
        "Name: " + (data.get("name") || ""),
        "Email: " + (data.get("email") || ""),
        "Phone: " + (data.get("phone") || ""),
        "Property address: " + (data.get("address") || ""),
        "Service: " + (data.get("service") || ""),
        "",
        "Details:",
        (data.get("message") || "")
      ];

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            status.textContent = "Thank you — your request is in. We'll be in touch within one business day.";
            status.classList.add("show");
          })
          .catch(function () {
            status.textContent = "Something went wrong sending the form. Please call us or email " + TO + ".";
            status.classList.add("show");
          });
        return;
      }

      var subject = "Free Estimate Request — " + (data.get("service") || "Estate Care");
      window.location.href = "mailto:" + TO +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with your request ready to send. If it doesn't, email us at " + TO + " or call (661) 609-6725.";
      status.classList.add("show");
    });
  });
})();
