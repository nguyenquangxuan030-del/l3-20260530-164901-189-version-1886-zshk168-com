(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector(".hero-slider");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterForm = document.querySelector(".search-panel");
  if (filterForm) {
    var searchInput = filterForm.querySelector(".search-input");
    var regionSelect = filterForm.querySelector("[data-filter='region']");
    var typeSelect = filterForm.querySelector("[data-filter='type']");
    var yearSelect = filterForm.querySelector("[data-filter='year']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));

    function includesValue(source, value) {
      return !value || String(source || "").indexOf(value) !== -1;
    }

    function applyFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matched = true;
        matched = matched && (!keyword || text.indexOf(keyword) !== -1);
        matched = matched && includesValue(card.getAttribute("data-region"), region);
        matched = matched && includesValue(card.getAttribute("data-type"), type);
        matched = matched && includesValue(card.getAttribute("data-year"), year);
        card.classList.toggle("hide-card", !matched);
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilter);
        el.addEventListener("change", applyFilter);
      }
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
  players.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-trigger");
    var url = box.getAttribute("data-video-url");
    var hlsReady = false;

    function attachSource() {
      if (!video || !url || hlsReady) {
        return;
      }
      hlsReady = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!hlsReady) {
          playVideo();
        }
      });
    }
  });
})();
