(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function uniqueSorted(values, numeric) {
    var list = Array.from(new Set(values.filter(Boolean)));
    return list.sort(function (a, b) {
      if (numeric) {
        return Number(b) - Number(a);
      }
      return String(a).localeCompare(String(b), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var count = panel.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-empty-result]');

    fillSelect(regionSelect, uniqueSorted(cards.map(function (card) {
      return card.dataset.region;
    })));
    fillSelect(typeSelect, uniqueSorted(cards.map(function (card) {
      return card.dataset.type;
    })));
    fillSelect(yearSelect, uniqueSorted(cards.map(function (card) {
      return card.dataset.year;
    }), true));

    function apply() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var region = regionSelect && regionSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var year = yearSelect && yearSelect.value || '';
      var category = categorySelect && categorySelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && card.dataset.region !== region) {
          ok = false;
        }
        if (type && card.dataset.type !== type) {
          ok = false;
        }
        if (year && card.dataset.year !== year) {
          ok = false;
        }
        if (category && card.dataset.category !== category) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupVideoPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var message = box.querySelector('[data-video-message]');
      var src = box.dataset.videoSrc;
      var hlsInstance = null;
      var initialized = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function init() {
        if (initialized || !video) {
          return;
        }
        initialized = true;
        if (!src) {
          setMessage('当前影片暂未绑定播放源。');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('播放源已载入，可使用播放器控制栏观看。');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setMessage('网络加载异常，正在尝试重新连接播放源。');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setMessage('媒体解码异常，正在尝试恢复。');
              hlsInstance.recoverMediaError();
            } else {
              setMessage('播放源暂时无法播放，请稍后重试。');
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          setMessage('浏览器已使用原生 HLS 播放。');
        } else {
          setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Firefox 或 Safari。');
        }
      }

      function play() {
        init();
        if (button) {
          button.style.display = 'none';
        }
        var promise = video && video.play ? video.play() : null;
        if (promise && promise.catch) {
          promise.catch(function () {
            setMessage('播放已准备好，请点击播放器控制栏开始。');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (button) {
            button.style.display = 'none';
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupVideoPlayers();
  });
})();
