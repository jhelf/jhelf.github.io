(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = 88;
  const hero = document.querySelector("[data-hero-img]");

  const reveal = (el, i) => {
    if (reduced) {
      el.classList.add("is-in");
      return;
    }
    const n = Number(el.getAttribute("data-stagger") || i % 4);
    el.style.transitionDelay = `${0.2 + n * 0.1}s`;
  };

  document.querySelectorAll("[data-reveal]").forEach(reveal);
  if (hero && reduced) hero.classList.add("is-in");
  if (hero && !reduced) requestAnimationFrame(() => hero.classList.add("is-in"));

  if (!reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-in");
          else {
            const r = e.boundingClientRect;
            if (r.bottom < 0 || r.top > innerHeight) e.target.classList.remove("is-in");
          }
        });
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    if (hero) {
      const onScroll = () => {
        const box = hero.parentElement;
        if (!box) return;
        const r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const k = innerWidth < 750 ? 0.06 : 0.12;
        const y = Math.max(-80, Math.min(80, -r.top * k));
        hero.style.transform = `translate3d(0,${y}px,0)`;
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + scrollY - headerOffset;
    scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  });
})();
