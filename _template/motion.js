(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = 88;

  document.querySelectorAll("[data-reveal]").forEach((el, index) => {
    if (reduced) {
      el.classList.add("is-in");
      return;
    }
    const stagger = Number(el.getAttribute("data-stagger") || index % 4);
    el.style.transitionDelay = `${stagger * 0.1}s`;
  });

  if (!reduced) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            return;
          }
          const rect = entry.boundingClientRect;
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            entry.target.classList.remove("is-in");
          }
        });
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
  }

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  });
})();
