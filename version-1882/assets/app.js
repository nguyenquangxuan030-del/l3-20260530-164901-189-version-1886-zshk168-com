document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  var scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));

  scopes.forEach(function (scope) {
    var input = scope.querySelector(".search-input");
    var category = scope.querySelector(".category-filter");
    var year = scope.querySelector(".year-filter");
    var region = scope.querySelector(".region-filter");
    var cards = Array.from(scope.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function matchYear(cardYear, wantedYear) {
      if (!wantedYear) {
        return true;
      }

      if (wantedYear === "older") {
        var numericYear = Number(cardYear);
        return numericYear && numericYear < 2020;
      }

      return cardYear === wantedYear;
    }

    function applyFilter() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var visible = true;

        if (text && title.indexOf(text) === -1) {
          visible = false;
        }

        if (selectedCategory && cardCategory !== selectedCategory) {
          visible = false;
        }

        if (!matchYear(cardYear, selectedYear)) {
          visible = false;
        }

        if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
          visible = false;
        }

        card.classList.toggle("hidden", !visible);
      });
    }

    [input, category, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
});
