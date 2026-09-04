(() => {
  const expo = "cubic-bezier(0.23, 1, 0.32, 1)";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const headerOffset = () => {
    const header = document.querySelector(".site-header");
    return (header ? header.offsetHeight : 72) + 12;
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      if (reduced) {
        target.scrollIntoView();
        return;
      }
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      const start = window.scrollY;
      const dist = top - start;
      const dur = 900;
      const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 4);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, start + dist * ease(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });

  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
    return;
  }

  const blocks = [...document.querySelectorAll(".reveal")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = Number(entry.target.dataset.stagger || 0);
          entry.target.style.transitionDelay = `${0.2 + i * 0.1}s`;
          entry.target.classList.add("is-in");
        } else if (entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > window.innerHeight) {
          entry.target.classList.remove("is-in");
          entry.target.style.transitionDelay = "0s";
        }
      });
    },
    { rootMargin: "0px 0px -20% 0px", threshold: 0.01 }
  );

  blocks.forEach((el, i) => {
    el.dataset.stagger = String(Math.min(i % 3, 2));
    el.style.willChange = "transform, opacity";
    io.observe(el);
  });

  const heroImg = document.querySelector(".hero-bleed");
  const hero = document.querySelector(".hero");
  if (heroImg && hero) {
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const shift = Math.max(-50, Math.min(50, -rect.top * 0.12));
      heroImg.style.transform = `translate3d(0, ${shift}px, 0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  document.documentElement.style.setProperty("--ease-out-expo", expo);
})();
