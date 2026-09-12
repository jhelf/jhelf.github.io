// Jean's motion. Transform and opacity only, Expo easing, reduced motion respected.
//
// Three hooks, and the verifier checks for them:
//   [data-hero-img]        the hero plate. Fades in, then tracks scroll as parallax.
//   [data-reveal]          the block slides up as one unit when it reaches 80% of the viewport.
//   [data-reveal="cascade"] the block's children come in one after another, top first.
//
// Optional: [data-review-carousel] turns three or more quotes into one-at-a-time
// slides. Missing markup is a no-op — delete the section when the quotes are not there.
//
// A cascade is for elements that belong together and read in order: eyebrow, then
// heading, then body, then the CTAs. Order comes from the DOM, so there is nothing
// to hand-number and the top element cannot end up last.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = 88;
  const hero = document.querySelector("[data-hero-img]");
  const blocks = [...document.querySelectorAll("[data-reveal], .reveal")];

  const BASE_DELAY = 0.2; // pre-delay, keeps the first screen from twitching on load
  const STEP = 0.09; // between siblings in a cascade
  const STEP_CAP = 7; // stop stepping after this many children

  const isCascade = (el) => el.getAttribute("data-reveal") === "cascade";

  const initReviewCarousel = () => {
    const root = document.querySelector("[data-review-carousel]");
    if (!root) return;
    const slides = [...root.querySelectorAll("[data-review-slide]")];
    const prev = root.querySelector(".review-prev");
    const next = root.querySelector(".review-next");
    const dotsWrap = root.querySelector("[data-review-dots]");
    const track = root.querySelector(".review-track");
    if (slides.length < 2 || !track) return;

    root.classList.add("is-carousel");
    let index = 0;
    const dots = slides.map((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Show review ${i + 1}`);
      dotsWrap?.append(btn);
      btn.addEventListener("click", () => go(i));
      return btn;
    });

    const go = (to) => {
      index = (to + slides.length) % slides.length;
      if (!reduced) {
        track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      } else {
        slides.forEach((slide, i) => {
          slide.hidden = i !== index;
        });
      }
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    };

    prev?.addEventListener("click", () => go(index - 1));
    next?.addEventListener("click", () => go(index + 1));
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    });

    let touchX = null;
    root.addEventListener("touchstart", (event) => {
      touchX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    root.addEventListener("touchend", (event) => {
      if (touchX == null) return;
      const dx = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
      if (dx > 40) go(index - 1);
      if (dx < -40) go(index + 1);
      touchX = null;
    }, { passive: true });

    go(0);
  };

  initReviewCarousel();

  if (reduced) {
    blocks.forEach((el) => el.classList.add("is-in"));
    if (hero) hero.classList.add("is-in");
    return;
  }

  blocks.forEach((block) => {
    const base = BASE_DELAY + Number(block.getAttribute("data-stagger") || 0) * 0.1;
    if (!isCascade(block)) {
      block.style.transitionDelay = `${base.toFixed(2)}s`;
      return;
    }
    [...block.children].forEach((child, i) => {
      child.style.transitionDelay = `${(base + Math.min(i, STEP_CAP) * STEP).toFixed(2)}s`;
    });
  });

  if (hero) requestAnimationFrame(() => hero.classList.add("is-in"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          return;
        }
        const r = e.boundingClientRect;
        if (r.bottom < 0 || r.top > innerHeight) e.target.classList.remove("is-in");
      });
    },
    { rootMargin: "0px 0px -20% 0px", threshold: 0 },
  );
  blocks.forEach((el) => io.observe(el));

  // Hero parallax. Half the travel on a narrow screen, and only while the hero is
  // on screen. The plate is oversized inside an overflow clip so it cannot leak.
  if (hero) {
    const frame = hero.closest(".hero") || hero.parentElement;
    let queued = false;

    const track = () => {
      queued = false;
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const rate = innerWidth < 750 ? 0.06 : 0.12;
      const y = Math.max(-80, Math.min(80, -r.top * rate));
      hero.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(track);
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    track();
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
    scrollTo({ top, behavior: "smooth" });
  });
})();
