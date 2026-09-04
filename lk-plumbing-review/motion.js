// Jean motion system — Expo ease, transform/opacity only, prefers-reduced-motion respected.
// See skills/jean-motion-system.md. No page-transition cinema, no WebGL.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var revealTargets = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealTargets.length === 0) {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.05 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Sticky header shrink is intentionally skipped — chrome (header, sticky
  // Call dock) must be tappable immediately, no animation on entry.

  // In-page hash scroll: offset for the sticky header so anchors land
  // below the fold, not underneath it.
  var header = document.querySelector(".site-header");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      var headerH = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
