(function () {
  var header = document.getElementById("site-header");
  var mobileToggle = document.getElementById("mobile-toggle");
  var mobilePanel = document.getElementById("mobile-panel");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-rail]").forEach(function (rail) {
    var wrap = rail.parentElement;
    if (!wrap) {
      return;
    }
    var left = wrap.querySelector("[data-rail-left]");
    var right = wrap.querySelector("[data-rail-right]");
    if (left) {
      left.addEventListener("click", function () {
        rail.scrollBy({ left: -420, behavior: "smooth" });
      });
    }
    if (right) {
      right.addEventListener("click", function () {
        rail.scrollBy({ left: 420, behavior: "smooth" });
      });
    }
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var summary = document.getElementById("search-summary");

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(item) {
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(item.link) + "\" class=\"movie-cover-link\" aria-label=\"观看 " + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-float\">▶</span>" +
      "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"" + escapeHtml(item.link) + "\">" + escapeHtml(item.title) + "</a>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"movie-meta-row\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
      "</div>" +
      "</article>";
  }

  function renderSearch(query) {
    if (!results || !summary || !window.SEARCH_INDEX) {
      return;
    }
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) {
      summary.textContent = "可以从标题、简介、地区和标签中检索影片。";
      return;
    }
    var words = keyword.split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (item) {
      var source = [item.title, item.oneLine, item.region, item.year, item.type, item.genre, item.category, item.tags].join(" ").toLowerCase();
      return words.every(function (word) {
        return source.indexOf(word) !== -1;
      });
    }).slice(0, 96);
    summary.textContent = matched.length ? "找到 " + matched.length + " 个相关结果" : "没有找到相关影片，可以换一个关键词。";
    results.innerHTML = matched.map(card).join("");
  }

  if (form && input) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      renderSearch(input.value);
    });
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });
  }
})();
