/**
 * Intelligence Designed To Evolve - Vanilla JS Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  initCountUp();
  initMobileMenu();
  initNavLinks();
});

/**
 * 1) Metric Count-up Animation with easeOutCubic & IntersectionObserver
 */
function initCountUp() {
  const statItems = document.querySelectorAll(".stat-item");
  if (!statItems.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let hasAnimated = false;

  const startAnimation = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    statItems.forEach((item, index) => {
      const target = parseFloat(item.dataset.target || "0");
      const suffix = item.dataset.suffix || "";
      const decimals = parseInt(item.dataset.decimals || "0", 10);
      const valueEl = item.querySelector(".stat-value");
      if (!valueEl) return;

      const duration = 1500 + index * 80;
      const startOffset = 480 + index * 90;

      setTimeout(() => {
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const easedProgress = easeOutCubic(progress);
          const current = target * easedProgress;

          valueEl.textContent = current.toFixed(decimals) + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            valueEl.textContent = target.toFixed(decimals) + suffix;
          }
        }

        requestAnimationFrame(update);
      }, startOffset);
    });
  };

  // IntersectionObserver threshold 0.25 (with immediate fallback)
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    const statsFooter = document.querySelector(".stats");
    if (statsFooter) {
      observer.observe(statsFooter);
    } else {
      startAnimation();
    }
  } else {
    startAnimation();
  }
}

/**
 * 2) Mobile Navigation Menu Controller
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById("mobile-burger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileOverlay = document.getElementById("mobile-overlay");

  if (!burgerBtn || !mobileMenu || !mobileOverlay) return;

  function openMenu() {
    burgerBtn.setAttribute("aria-expanded", "true");
    mobileMenu.removeAttribute("hidden");
    mobileOverlay.removeAttribute("hidden");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("hidden", "");
    mobileOverlay.setAttribute("hidden", "");
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burgerBtn.addEventListener("click", toggleMenu);
  mobileOverlay.addEventListener("click", closeMenu);

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burgerBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  // Close menu on mobile link click
  const mobileLinks = mobileMenu.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Automatically close mobile menu if resized to desktop viewport
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && burgerBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });
}

/**
 * 3) Navigation Active State Handler
 */
function initNavLinks() {
  const desktopLinks = document.querySelectorAll(".desktop-nav .nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-menu .mobile-nav-link");

  function handleActiveState(links, targetLink) {
    links.forEach((l) => l.classList.remove("active"));
    targetLink.classList.add("active");
  }

  desktopLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      handleActiveState(desktopLinks, link);
    });
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      handleActiveState(mobileLinks, link);
    });
  });
}
