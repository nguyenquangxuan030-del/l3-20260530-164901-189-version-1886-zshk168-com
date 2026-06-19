(function () {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      const isOpen = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function cycleSlides(slides, dots, index) {
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('active', itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('active', itemIndex === index);
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-target]'));
    const previous = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    let current = 0;
    const show = function (index) {
      current = (index + slides.length) % slides.length;
      cycleSlides(slides, dots, current);
    };
    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-target')) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFeature() {
    const slides = Array.from(document.querySelectorAll('[data-feature-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-feature-target]'));
    const previous = document.querySelector('[data-feature-prev]');
    const next = document.querySelector('[data-feature-next]');
    if (!slides.length) {
      return;
    }
    let current = 0;
    const show = function (index) {
      current = (index + slides.length) % slides.length;
      cycleSlides(slides, dots, current);
    };
    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-feature-target')) || 0);
      });
    });
  }

  function setupRails() {
    document.querySelectorAll('[data-scroll-left]').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = document.getElementById(button.getAttribute('data-scroll-left'));
        if (target) {
          target.scrollBy({ left: -420, behavior: 'smooth' });
        }
      });
    });
    document.querySelectorAll('[data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = document.getElementById(button.getAttribute('data-scroll-right'));
        if (target) {
          target.scrollBy({ left: 420, behavior: 'smooth' });
        }
      });
    });
  }

  function setupSearch() {
    const input = document.querySelector('.search-input');
    const results = document.querySelector('.search-results');
    const index = window.SEARCH_INDEX || [];
    if (!input || !results || !index.length) {
      return;
    }
    const render = function (items) {
      results.innerHTML = items.map(function (item) {
        return [
          '<a class="search-item" href="', item.url, '">',
          '<img src="', item.cover, '" alt="', item.title.replace(/"/g, '&quot;'), '">',
          '<span><strong>', item.title, '</strong><span>', item.year, ' · ', item.region, ' · ', item.category, '</span></span>',
          '</a>'
        ].join('');
      }).join('');
      results.classList.toggle('open', items.length > 0);
    };
    input.addEventListener('input', function () {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        render([]);
        return;
      }
      const items = index.filter(function (item) {
        const haystack = [item.title, item.year, item.region, item.category, item.genre, item.keywords].join(' ').toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).slice(0, 12);
      render(items);
    });
    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove('open');
      }
    });
  }

  function setupFilters() {
    const grid = document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    const input = document.querySelector('.filter-input');
    const selects = Array.from(document.querySelectorAll('.filter-select'));
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const empty = document.querySelector('.empty-state');
    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      const activeFilters = selects.reduce(function (memo, select) {
        if (select.value) {
          memo[select.getAttribute('data-filter')] = select.value;
        }
        return memo;
      }, {});
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        const matchedQuery = !query || haystack.indexOf(query) !== -1;
        const matchedYear = !activeFilters.year || card.dataset.year === activeFilters.year;
        const matchedType = !activeFilters.type || card.dataset.type === activeFilters.type;
        const show = matchedQuery && matchedYear && matchedType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFeature();
    setupRails();
    setupSearch();
    setupFilters();
  });
}());
