(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const hero = document.querySelector(".hero-carousel");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    };

    const restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  const filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    const searchInput = document.getElementById("searchFilter");
    const yearSelect = document.getElementById("yearFilter");
    const regionSelect = document.getElementById("regionFilter");
    const typeSelect = document.getElementById("typeFilter");
    const items = Array.from(document.querySelectorAll(".movie-card, .rank-row"));

    const normalize = function (value) {
      return (value || "").toString().trim().toLowerCase();
    };

    const apply = function () {
      const query = normalize(searchInput && searchInput.value);
      const year = normalize(yearSelect && yearSelect.value);
      const region = normalize(regionSelect && regionSelect.value);
      const type = normalize(typeSelect && typeSelect.value);

      items.forEach(function (item) {
        const text = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.year,
          item.dataset.type,
          item.dataset.tags
        ].join(" "));
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchYear = !year || normalize(item.dataset.year) === year;
        const matchRegion = !region || normalize(item.dataset.region) === region;
        const matchType = !type || normalize(item.dataset.type) === type;
        item.hidden = !(matchQuery && matchYear && matchRegion && matchType);
      });
    };

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }
})();
