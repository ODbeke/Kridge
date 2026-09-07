/**
 * Intelligence Designed To Evolve - Vanilla JS Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  initCountUp();
  initMobileMenu();
  initNavLinks();
  initModals();
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
  }

  function closeMenu() {
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("hidden", "");
    mobileOverlay.setAttribute("hidden", "");
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burgerBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  const mobileLinks = mobileMenu.querySelectorAll("a, button");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

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
    link.addEventListener("click", () => {
      handleActiveState(desktopLinks, link);
    });
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      handleActiveState(mobileLinks, link);
    });
  });
}

/**
 * 4) Interactive Modals & Click Handlers
 */
function initModals() {
  const signinBtns = document.querySelectorAll(".desktop-signin, .mobile-signin");
  signinBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // If href is not standard URL, prompt wallet connect
      if (!btn.getAttribute("href") || btn.getAttribute("href").startsWith("#")) {
        const addr = prompt("Connect Web3 Wallet (Enter public address or click OK to simulate):", "0x71C840...392B");
        if (addr) {
          btn.textContent = addr.substring(0, 6) + "..." + addr.slice(-4);
        }
      }
    });
  });
}
