
(function () {
  const body = document.body;
  const page = body.dataset.page || 'home';

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function initHeader() {
    const header = qs('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const toggle = qs('.mobile-toggle');
    const panel = qs('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', () => panel.classList.toggle('open'));
    }
  }

  function initHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) return;
    const slides = qsa('[data-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    if (!slides.length) return;
    let index = 0;
    const setActive = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
    let timer = setInterval(() => setActive(index + 1), 6000);
    root.addEventListener('mouseenter', () => { clearInterval(timer); });
    root.addEventListener('mouseleave', () => { timer = setInterval(() => setActive(index + 1), 6000); });
    setActive(0);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function cardHtml(item) {
    const tags = [item.type, item.year, item.bucket].filter(Boolean).slice(0, 2).map(v => `<span class="chip">${escapeHtml(v)}</span>`).join('');
    const desc = item.one_line || item.genre || '';
    return `
      <article class="movie-card compact">
        <a class="movie-poster" href="${escapeHtml(item.slug)}">
          <img src="covers/${String(item.id).padStart(4, '0')}.svg" alt="${escapeHtml(item.title)}" loading="lazy"/>
          <div class="poster-glow"></div>
        </a>
        <div class="movie-body">
          <div class="movie-meta">${tags}</div>
          <h3 class="movie-title"><a href="${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></h3>
          <p class="movie-desc">${escapeHtml(desc)}</p>
          <div class="movie-foot"><span class="muted">${escapeHtml(item.region || '')}</span><a class="text-link" href="${escapeHtml(item.slug)}">查看详情</a></div>
        </div>
      </article>`;
  }

  function initSearchPage() {
    const input = qs('#searchInput');
    const btn = qs('#searchBtn');
    const results = qs('#searchResults');
    const stats = qs('#searchStats');
    const raw = qs('#movieIndex');
    if (!input || !btn || !results || !raw) return;
    const data = JSON.parse(raw.textContent || '[]');

    function norm(v) { return String(v || '').toLowerCase(); }
    function run() {
      const q = norm(input.value.trim());
      const filtered = !q ? data.slice(0, 80) : data.filter(item => {
        const hay = [item.title, item.region, item.type, item.genre, item.bucket, item.one_line, ...(item.tags || [])].map(norm).join(' ');
        return hay.includes(q);
      }).sort((a, b) => (b.score || 0) - (a.score || 0));
      stats.textContent = q ? `找到 ${filtered.length} 条结果` : `默认展示 ${filtered.length} 条高关注影片`;
      results.innerHTML = filtered.map(cardHtml).join('') || '<div class="info-card">没有找到相关结果，请尝试其他关键词。</div>';
    }
    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    btn.addEventListener('click', run);
    input.addEventListener('input', run);
    run();
  }

  function initDetailPlayer() {
    const video = qs('.js-player');
    if (!video) return;
    const overlay = qs('.player-overlay');
    const playBtn = qs('[data-play-center]');
    const sourceBtns = qsa('[data-source-btn]');
    const poster = video.getAttribute('poster') || '';
    let hls = null;

    function setNote(text) {
      const note = qs('.player-note');
      if (note) note.textContent = text;
    }

    function destroyHls() {
      try {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      } catch (e) {}
    }

    function loadSource(url) {
      if (!url) return;
      destroyHls();
      video.pause();
      video.removeAttribute('src');
      video.poster = poster;
      if (window.Hls && Hls.isSupported && Hls.isSupported()) {
        try {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => setNote('点击播放按钮即可开始观看'));
          hls.on(Hls.Events.ERROR, function (evt, data) {
            if (data && data.fatal) {
              setNote('视频加载失败，请稍后重试');
            }
          });
        } catch (e) {
          video.src = url;
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        setNote('点击播放按钮即可开始观看');
      } else {
        video.src = url;
        setNote('您的浏览器不支持HLS视频播放');
      }
    }

    const first = qs('[data-source-btn].active') || sourceBtns[0];
    if (first) loadSource(first.dataset.src || video.dataset.defaultSrc);
    sourceBtns.forEach(btn => btn.addEventListener('click', () => {
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadSource(btn.dataset.src);
    }));

    function togglePlay() {
      if (video.paused) {
        video.play().catch(() => setNote('视频加载失败，请稍后重试'));
      } else {
        video.pause();
      }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) togglePlay();
    });
    video.addEventListener('click', togglePlay);
    video.addEventListener('error', () => setNote('视频加载失败，请稍后重试'));
    video.addEventListener('play', () => {
      if (overlay) overlay.style.opacity = '0';
      setNote('正在播放');
    });
    video.addEventListener('pause', () => {
      if (overlay) overlay.style.opacity = '1';
      setNote('点击播放按钮即可开始观看');
    });
  }

  function initCommonSearchFilters() {
    qsa('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scope = btn.closest('[data-filter-scope]');
        if (!scope) return;
        const query = btn.dataset.filter;
        qsa('[data-item]', scope).forEach(el => {
          const text = (el.dataset.text || '').toLowerCase();
          el.style.display = !query || query === 'all' || text.includes(query.toLowerCase()) ? '' : 'none';
        });
      });
    });
  }

  initHeader();
  initHeroCarousel();
  initCommonSearchFilters();
  if (page === 'search') initSearchPage();
  if (page === 'detail') initDetailPlayer();
})();
